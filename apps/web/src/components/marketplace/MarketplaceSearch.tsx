'use client';

import { Search } from 'lucide-react';

interface MarketplaceSearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function MarketplaceSearch({ value, onChange, placeholder = 'Search...' }: MarketplaceSearchProps) {
    return (
        <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C7F4FA]/50" />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-[#06363D] border border-[#084B54] rounded-full px-12 py-3 text-[#C7F4FA] placeholder:text-[#C7F4FA]/50 focus:outline-none focus:border-[#109EB1] transition-colors"
            />
        </div>
    );
}
