'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    useReactFlow,
    useOnViewportChange,
    ReactFlowProvider,
    Node,
    Edge,
    MarkerType,
    ControlButton,
    Handle,
    Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Icon } from '@iconify/react';
import type { Dependency } from '@/app/(app)/(resources)/[type]/[slug]/(with-header)/dependencies/page';

interface DependencyGraphViewProps {
    dependencies: Dependency[];
    resourceName: string;
    resourceSlug: string;
    resourceIcon?: string | null;
}

const nodeWidth = 200;
const nodeHeight = 80;

// Custom node component for resources
function ResourceNode({ data }: { data: any }) {
    // Get badge colors based on dependency type
    const getBadgeStyle = () => {
        switch (data.dependencyType) {
            case 'REQUIRED':
                return 'bg-[#109EB1]/30 text-[#C7F4FA] border border-[#109EB1]';
            case 'OPTIONAL':
                return 'bg-[#C7F4FA]/20 text-[#C7F4FA]/80 border border-[#C7F4FA]/30';
            case 'INCOMPATIBLE':
                return 'bg-amber-500/20 text-amber-300 border border-amber-500/50';
            case 'EMBEDDED':
                return 'bg-violet-500/20 text-violet-300 border border-violet-500/50';
            default:
                return '';
        }
    };

    return (
        <div
            className={`
                relative rounded-[15px] overflow-hidden min-w-[200px] max-w-[240px] transition-all duration-200 shadow-lg
                ${data.isMain
                    ? 'bg-[#109EB1]/20 border-2 border-[#109EB1]'
                    : 'bg-[#06363D] border border-[#084B54] hover:border-[#109EB1]'
                }
            `}
        >
            {/* Connection handles - invisible but functional */}
            <Handle
                type="target"
                position={Position.Top}
                className="!opacity-0 !w-px !h-px"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                className="!opacity-0 !w-px !h-px"
            />

            {/* Header */}
            <div className="flex gap-2.5 p-3">
                {/* Icon */}
                <div className="w-12 h-12 rounded-[10px] overflow-hidden bg-[#032125] flex items-center justify-center flex-shrink-0">
                    {data.iconUrl ? (
                        <img src={data.iconUrl} alt={data.name} className="w-full h-full object-cover" />
                    ) : (
                        <Icon
                            ssr={true}
                            icon={data.isMain ? "mdi:cube" : data.isExternal ? "mdi:link-variant" : "mdi:cube-outline"}
                            width="24"
                            height="24"
                            className="text-[#C7F4FA]/50"
                        />
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className={`font-hebden font-semibold text-sm leading-tight truncate ${data.isMain ? 'text-[#109EB1]' : 'text-[#C7F4FA]'}`}>
                        {data.name}
                    </p>
                    {data.version && (
                        <p className="text-xs text-[#C7F4FA]/50 font-nunito mt-0.5">
                            v{data.version}
                        </p>
                    )}
                    {data.isExternal && !data.version && (
                        <p className="text-xs text-[#C7F4FA]/50 font-nunito flex items-center gap-1 mt-0.5">
                            <Icon ssr={true} icon="mdi:open-in-new" width="10" height="10" />
                            External
                        </p>
                    )}
                </div>
            </div>

            {/* Footer with badge */}
            {data.dependencyType && (
                <div className="px-3 pb-2.5">
                    <span className={`
                        inline-block text-[10px] px-2 py-0.5 rounded-[5px] font-nunito
                        ${getBadgeStyle()}
                    `}>
                        {data.dependencyType === 'REQUIRED' ? 'Required' :
                            data.dependencyType === 'OPTIONAL' ? 'Optional' :
                                data.dependencyType === 'EMBEDDED' ? 'Embedded' : 'Incompatible'}
                    </span>
                </div>
            )}
        </div>
    );
}

const nodeTypes = {
    resource: ResourceNode,
};

// Custom zoom controls component
function ZoomControls() {
    const { zoomIn, zoomOut, fitView, getZoom } = useReactFlow();
    const [zoom, setZoom] = useState(1);

    const minZoom = 0.5;
    const maxZoom = 1.5;

    // Get initial zoom on mount
    useEffect(() => {
        // Small delay to ensure react-flow has initialized
        const timer = setTimeout(() => {
            setZoom(getZoom());
        }, 100);
        return () => clearTimeout(timer);
    }, [getZoom]);

    // Track viewport changes (including fitView on load)
    useOnViewportChange({
        onChange: (viewport) => {
            setZoom(viewport.zoom);
        },
    });

    const handleZoomIn = () => {
        zoomIn();
    };

    const handleZoomOut = () => {
        zoomOut();
    };

    const handleFitView = () => {
        fitView({ padding: 0.3 });
    };

    const isMaxZoom = zoom >= maxZoom - 0.05;
    const isMinZoom = zoom <= minZoom + 0.05;

    return (
        <div className="react-flow__panel react-flow__controls bottom left">
            <div className="flex flex-col gap-1 bg-secondary/90 backdrop-blur-sm p-1 rounded-lg border border-border">
                <button
                    onClick={handleZoomIn}
                    disabled={isMaxZoom}
                    className={`w-8 h-8 flex items-center justify-center rounded-md transition-all
                        ${isMaxZoom
                            ? 'opacity-40 cursor-not-allowed bg-secondary text-muted-foreground'
                            : 'bg-secondary hover:bg-primary text-foreground hover:text-primary-foreground'
                        }`}
                    title="Zoom in"
                >
                    <Icon ssr={true} icon="mdi:plus" width="16" height="16" />
                </button>
                <button
                    onClick={handleZoomOut}
                    disabled={isMinZoom}
                    className={`w-8 h-8 flex items-center justify-center rounded-md transition-all
                        ${isMinZoom
                            ? 'opacity-40 cursor-not-allowed bg-secondary text-muted-foreground'
                            : 'bg-secondary hover:bg-primary text-foreground hover:text-primary-foreground'
                        }`}
                    title="Zoom out"
                >
                    <Icon ssr={true} icon="mdi:minus" width="16" height="16" />
                </button>
                <button
                    onClick={handleFitView}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-secondary hover:bg-primary text-foreground hover:text-primary-foreground transition-all"
                    title="Fit view"
                >
                    <Icon ssr={true} icon="mdi:fit-to-screen" width="16" height="16" />
                </button>
            </div>
        </div>
    );
}

export default function DependencyGraphView({
    dependencies,
    resourceName,
    resourceSlug,
    resourceIcon
}: DependencyGraphViewProps) {
    // Create nodes and edges
    const { initialNodes, initialEdges } = useMemo(() => {
        const nodes: Node[] = [];
        const edges: Edge[] = [];

        // Main resource node (center)
        nodes.push({
            id: 'main',
            type: 'resource',
            position: { x: 300, y: 50 },
            data: {
                name: resourceName,
                iconUrl: resourceIcon,
                isMain: true,
            },
        });

        const spacing = 250;
        const startY = 200;
        const columns = Math.min(dependencies.length, 4);

        dependencies.forEach((dep, index) => {
            const row = Math.floor(index / columns);
            const col = index % columns;
            const totalInRow = Math.min(columns, dependencies.length - row * columns);
            const startX = 300 - ((totalInRow - 1) * spacing) / 2;

            const nodeId = `dep-${dep.id}`;

            nodes.push({
                id: nodeId,
                type: 'resource',
                position: {
                    x: startX + col * spacing,
                    y: startY + row * 150
                },
                data: {
                    name: dep.isInternal ? dep.dependencyResource?.name : dep.externalName,
                    iconUrl: dep.isInternal ? dep.dependencyResource?.iconUrl : null,
                    isExternal: !dep.isInternal,
                    dependencyType: dep.dependencyType,
                    version: dep.isInternal
                        ? dep.minVersion?.versionNumber
                        : dep.externalMinVersion,
                    slug: dep.isInternal ? dep.dependencyResource?.slug : null,
                    url: !dep.isInternal ? dep.externalUrl : null,
                },
            });

            const edgeColor = dep.dependencyType === 'REQUIRED'
                ? '#109EB1'  // Primary cyan
                : dep.dependencyType === 'OPTIONAL'
                    ? '#C7F4FA50'  // Muted text color
                    : dep.dependencyType === 'EMBEDDED'
                        ? '#8b5cf6'  // Violet
                        : '#f59e0b';  // Amber for incompatible

            edges.push({
                id: `edge-${dep.id}`,
                source: 'main',
                target: nodeId,
                type: 'smoothstep',
                animated: dep.dependencyType === 'REQUIRED',
                style: { stroke: edgeColor, strokeWidth: 2 },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: edgeColor,
                },
            });
        });

        return { initialNodes: nodes, initialEdges: edges };
    }, [dependencies, resourceName, resourceIcon]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        if (node.data.slug) {
            window.location.href = `/mod/${node.data.slug}`;
        } else if (node.data.url) {
            window.open(node.data.url as string, '_blank');
        }
    }, []);

    if (dependencies.length === 0) {
        return (
            <div className="bg-secondary/30 rounded-lg p-8 text-center">
                <Icon ssr={true} icon="mdi:graph" width="48" height="48" className="text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground font-nunito text-lg mb-2">No dependencies to visualize</p>
            </div>
        );
    }

    return (
        <div className="w-full h-[500px] bg-secondary/20 rounded-lg border border-border overflow-hidden">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                minZoom={0.5}
                maxZoom={1.5}
                proOptions={{ hideAttribution: true }}
            >
                <Background color="#084B54" gap={20} size={1} />
                <ZoomControls />
            </ReactFlow>

            {/* Legend */}
            <div className="absolute bottom-4 left-14 bg-[#06363D]/95 backdrop-blur-sm rounded-[10px] p-2.5 border border-[#084B54]">
                <p className="text-[10px] font-hebden text-[#C7F4FA] mb-1.5">Legend</p>
                <div className="space-y-1 text-[10px] font-nunito">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-0.5 bg-[#109EB1] rounded-full"></div>
                        <span className="text-[#C7F4FA]/70">Required</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-0.5 bg-[#C7F4FA]/30 rounded-full"></div>
                        <span className="text-[#C7F4FA]/70">Optional</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-0.5 bg-violet-500 rounded-full"></div>
                        <span className="text-[#C7F4FA]/70">Embedded</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-0.5 bg-amber-500 rounded-full"></div>
                        <span className="text-[#C7F4FA]/70">Incompatible</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
