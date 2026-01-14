import type { ViewMode } from './ViewSwitcher';

interface SkeletonCardProps {
    viewMode: ViewMode;
}

export default function SkeletonCard({ viewMode }: SkeletonCardProps) {
    if (viewMode === 'row') {
        return (
            <div className="bg-secondary/30 rounded-lg overflow-hidden animate-pulse">
                <div className="flex flex-col sm:flex-row gap-4 p-4">
                    {/* Image skeleton */}
                    <div className="w-full sm:w-48 h-32 bg-white/5 rounded-md flex-shrink-0" />

                    {/* Content skeleton */}
                    <div className="flex-1 space-y-3">
                        <div className="h-6 bg-white/5 rounded w-3/4" />
                        <div className="h-4 bg-white/5 rounded w-1/4" />
                        <div className="h-4 bg-white/5 rounded w-full" />

                        {/* Tags skeleton */}
                        <div className="flex gap-2">
                            <div className="h-6 w-16 bg-white/5 rounded-full" />
                            <div className="h-6 w-16 bg-white/5 rounded-full" />
                            <div className="h-6 w-16 bg-white/5 rounded-full" />
                        </div>

                        {/* Stats skeleton */}
                        <div className="flex gap-4">
                            <div className="h-4 w-20 bg-white/5 rounded" />
                            <div className="h-4 w-20 bg-white/5 rounded" />
                            <div className="h-4 w-24 bg-white/5 rounded" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (viewMode === 'gallery') {
        return (
            <div className="bg-[#06363D] border border-[#084B54] rounded-[20px] overflow-hidden animate-pulse flex flex-col h-full">
                {/* Header with icon and title */}
                <div className="flex gap-2.5 p-2.5">
                    {/* Icon skeleton */}
                    <div className="w-14 h-14 flex-shrink-0 rounded-[12px] bg-[#084B54]" />

                    {/* Title and Author skeleton */}
                    <div className="flex-1 flex flex-col justify-center gap-1.5">
                        <div className="h-4 bg-[#084B54] rounded w-3/4" />
                        <div className="h-3 bg-[#084B54] rounded w-1/2" />
                    </div>
                </div>

                {/* Description skeleton */}
                <div className="px-2.5 flex-1 space-y-1">
                    <div className="h-3 bg-[#084B54] rounded w-full" />
                    <div className="h-3 bg-[#084B54] rounded w-4/5" />
                </div>

                {/* Tags skeleton */}
                <div className="flex gap-1 px-2.5 py-2">
                    <div className="h-4 w-12 bg-[#084B54] rounded-[4px]" />
                    <div className="h-4 w-10 bg-[#084B54] rounded-[4px]" />
                </div>

                {/* Footer stats skeleton */}
                <div className="flex justify-between items-center px-2.5 py-2 border-t border-[#084B54]">
                    <div className="flex gap-2">
                        <div className="h-3 w-8 bg-[#084B54] rounded" />
                        <div className="h-3 w-8 bg-[#084B54] rounded" />
                    </div>
                    <div className="w-6 h-6 bg-[#084B54] rounded-full" />
                </div>
            </div>
        );
    }

    // Grid view (default)
    return (
        <div className="bg-secondary/30 rounded-lg overflow-hidden animate-pulse">
            {/* Image skeleton */}
            <div className="w-full h-48 bg-white/5" />

            {/* Content skeleton */}
            <div className="p-4 space-y-3">
                <div className="h-5 bg-white/5 rounded w-3/4" />
                <div className="h-4 bg-white/5 rounded w-1/2" />
                <div className="h-3 bg-white/5 rounded w-full" />
                <div className="h-3 bg-white/5 rounded w-5/6" />

                {/* Tags skeleton */}
                <div className="flex gap-2 mt-3">
                    <div className="h-5 w-14 bg-white/5 rounded-full" />
                    <div className="h-5 w-14 bg-white/5 rounded-full" />
                    <div className="h-5 w-14 bg-white/5 rounded-full" />
                </div>

                {/* Stats skeleton */}
                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                    <div className="flex gap-3">
                        <div className="h-4 w-16 bg-white/5 rounded" />
                        <div className="h-4 w-16 bg-white/5 rounded" />
                    </div>
                    <div className="h-4 w-20 bg-white/5 rounded" />
                </div>
            </div>
        </div>
    );
}
