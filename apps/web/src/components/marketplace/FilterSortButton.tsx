'use client';

import { ChevronDown } from 'lucide-react';

interface FilterSortButtonProps {
    label: string;
    icon: React.ReactNode;
    onClick?: () => void;
}

export default function FilterSortButton({ label, icon, onClick }: FilterSortButtonProps) {
    return (
        <button
            onClick={onClick}
            className="flex items-center justify-center gap-1.5 sm:gap-2.5 px-3 sm:px-[15px] py-2 sm:py-2.5 bg-[#06363D] border border-[#084B54] rounded-full h-9 sm:h-11 hover:bg-[#084B54] transition-colors"
        >
            <span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">{icon}</span>
            <span className="font-abeezee text-sm sm:text-[15.16px] leading-tight sm:leading-[18px] text-[#C7F4FA]">
                {label}
            </span>
            <ChevronDown className="w-4 h-4 sm:w-6 sm:h-6 text-[#C7F4FA]" />
        </button>
    );
}
