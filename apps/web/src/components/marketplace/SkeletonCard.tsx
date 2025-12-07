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
            <div className="bg-secondary/30 rounded-lg overflow-hidden animate-pulse">
                {/* Image skeleton */}
                <div className="w-full aspect-square bg-white/5" />

                {/* Content skeleton */}
                <div className="p-3 space-y-2">
                    <div className="h-4 bg-white/5 rounded w-3/4" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                    <div className="flex gap-1 mt-2">
                        <div className="h-4 w-12 bg-white/5 rounded" />
                        <div className="h-4 w-12 bg-white/5 rounded" />
                    </div>
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
