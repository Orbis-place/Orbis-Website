'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FilterCardProps {
    title: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
}

export function FilterCard({ title, children, defaultExpanded = true }: FilterCardProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] p-5 flex flex-col gap-2.5">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-left transition-colors"
            >
                <h3 className="font-hebden font-semibold text-xs leading-[14px] text-[#C7F4FA]/50 uppercase">
                    {title}
                </h3>
                {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#C7F4FA]/50" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-[#C7F4FA]/50" />
                )}
            </button>
            {isExpanded && <div className="flex flex-col gap-2.5">{children}</div>}
        </div>
    );
}
