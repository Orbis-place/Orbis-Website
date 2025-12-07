'use client';

interface MarketplaceHeaderProps {
    title: string;
    count: number;
}

export default function MarketplaceHeader({ title, count }: MarketplaceHeaderProps) {
    return (
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <h1 className="font-hebden font-semibold text-2xl sm:text-[34.15px] leading-tight sm:leading-[41px] text-[#C7F4FA]">
                {title}
            </h1>
            <span className="font-hebden font-semibold text-sm sm:text-[17.36px] leading-tight sm:leading-[21px] text-[#C7F4FA]/50 mt-1 sm:mt-2">
                • {count}
            </span>
        </div>
    );
}
