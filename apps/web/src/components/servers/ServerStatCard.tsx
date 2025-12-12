import { Icon } from '@iconify-icon/react';
import { cn } from '@/lib/utils';

interface ServerStatCardProps {
    icon: string;
    label: string;
    value: string | number;
    description: string;
    iconColor?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export default function ServerStatCard({
    icon,
    label,
    value,
    description,
    iconColor = "#109EB1",
    trend
}: ServerStatCardProps) {
    return (
        <div className="w-full px-5 py-5 rounded-[15px] bg-[#06363D]/50 border border-[#084B54] hover:border-[#109EB1]/30 transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#084B54]/50">
                        <Icon
                            icon={icon}
                            width="24"
                            height="24"
                            style={{ color: iconColor }}
                        />
                    </div>
                    <p className="font-hebden text-base font-medium text-[#C7F4FA]/60">
                        {label}
                    </p>
                </div>
                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-nunito",
                        trend.isPositive
                            ? "bg-[#69a024]/10 text-[#69a024]"
                            : "bg-red-500/10 text-red-400"
                    )}>
                        <Icon
                            icon={trend.isPositive ? "mdi:arrow-up" : "mdi:arrow-down"}
                            width="14"
                            height="14"
                        />
                        {Math.abs(trend.value)}%
                    </div>
                )}
            </div>

            <p className="font-hebden text-4xl font-bold text-[#109EB1] mb-2">
                {value}
            </p>

            <p className="font-nunito text-sm text-[#C7F4FA]/60 leading-relaxed">
                {description}
            </p>
        </div>
    );
}
