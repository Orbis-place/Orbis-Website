'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';

interface FilterCardProps {
    title: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
    icon?: string;
}

// Map titles to icons
const titleIconMap: Record<string, string> = {
    'Tags': 'solar:tag-bold-duotone',
    'Categories': 'solar:folder-with-files-bold-duotone',
    'Hytale Version': 'solar:gamepad-bold-duotone',
    'Browse': 'solar:compass-bold-duotone',
};

export function FilterCard({ title, children, defaultExpanded = true, icon }: FilterCardProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    // Get icon from map or use provided icon
    const displayIcon = icon || titleIconMap[title] || 'solar:filter-bold-duotone';

    return (
        <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] p-5 flex flex-col gap-2.5">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-left"
            >
                <div className="flex items-center gap-2.5">
                    <Icon
                        icon={displayIcon}
                        className="w-4 h-4 text-[#109EB1]"
                    />
                    <h3 className="font-hebden font-semibold text-xs leading-[14px] text-[#C7F4FA]/50 uppercase">
                        {title}
                    </h3>
                </div>
                <div
                    className="transition-transform duration-300 ease-out"
                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                    <Icon
                        icon="solar:alt-arrow-down-bold"
                        className="w-4 h-4 text-[#C7F4FA]/50"
                    />
                </div>
            </button>

            {isExpanded && (
                <>
                    <div className="flex flex-col gap-2.5 pt-2">
                        {children}
                    </div>
                </>
            )}
        </div>
    );
}
