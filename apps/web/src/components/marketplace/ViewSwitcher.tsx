'use client';

import { LayoutGrid, List, Grid3x3 } from 'lucide-react';

export type ViewMode = 'row' | 'grid' | 'gallery';

interface ViewSwitcherProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

export default function ViewSwitcher({ viewMode, onViewModeChange }: ViewSwitcherProps) {
    return (
        <div className="flex bg-[#06363D] border border-[#084B54] rounded-full p-0.5 sm:p-1 h-9 sm:h-11">
            <button
                onClick={() => onViewModeChange('row')}
                className={`px-2 sm:px-3 rounded-full transition-all ${viewMode === 'row' ? 'bg-[#109EB1]' : 'hover:bg-[#084B54]'}`}
                title="Row view"
            >
                <List className="w-4 h-4 sm:w-5 sm:h-5 text-[#C7F4FA]" />
            </button>
            <button
                onClick={() => onViewModeChange('grid')}
                className={`px-2 sm:px-3 rounded-full transition-all ${viewMode === 'grid' ? 'bg-[#109EB1]' : 'hover:bg-[#084B54]'}`}
                title="Grid view"
            >
                <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 text-[#C7F4FA]" />
            </button>
            <button
                onClick={() => onViewModeChange('gallery')}
                className={`px-2 sm:px-3 rounded-full transition-all ${viewMode === 'gallery' ? 'bg-[#109EB1]' : 'hover:bg-[#084B54]'}`}
                title="Gallery view"
            >
                <Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5 text-[#C7F4FA]" />
            </button>
        </div>
    );
}
