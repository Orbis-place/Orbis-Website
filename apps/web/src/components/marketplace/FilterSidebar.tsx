'use client';

import { useState } from 'react';

export type FilterOption = {
    id: string;
    label: string;
};

interface FilterSidebarProps {
    title?: string;
    filters: FilterOption[];
    activeFilter: string;
    onFilterChange: (filterId: string) => void;
}

export default function FilterSidebar({
    title = 'Browse',
    filters,
    activeFilter,
    onFilterChange
}: FilterSidebarProps) {
    return (
        <aside className="hidden lg:block w-full lg:w-[273px] flex-shrink-0">
            <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] p-5 flex flex-col gap-2.5">
                <h3 className="font-hebden font-semibold text-xs leading-[14px] text-[#C7F4FA]/50 uppercase">
                    {title}
                </h3>

                <div className="flex flex-col gap-2.5">
                    {filters.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => onFilterChange(filter.id)}
                            className={`
                flex items-center px-[15px] py-2.5 rounded-full transition-all
                ${activeFilter === filter.id
                                    ? 'bg-[#032125] text-[#109EB1]'
                                    : 'bg-transparent text-[#C7F4FA] hover:bg-[#032125]/50'
                                }
              `}
                        >
                            <span className="font-abeezee text-[15.16px] leading-[18px]">
                                {filter.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    );
}
