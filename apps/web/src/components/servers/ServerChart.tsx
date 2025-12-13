"use client";

import { useState } from 'react';
import { Icon } from '@iconify/react';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { cn } from '@/lib/utils';

interface DataPoint {
    timestamp: string;
    value: number;
    label: string;
}

interface ServerChartProps {
    title: string;
    icon: string;
    data: DataPoint[];
    color?: string;
    gradientColor?: string;
    valueFormatter?: (value: number) => string;
}

type TimeRange = '7' | '30' | '90';

export default function ServerChart({
    title,
    icon,
    data,
    color = "#109EB1",
    gradientColor = "#109EB1",
    valueFormatter = (value) => value.toString()
}: ServerChartProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>('7');

    // Filter data based on selected time range
    const filteredData = data.slice(-parseInt(timeRange));

    const chartConfig = {
        value: {
            label: title,
            color: color,
        },
    };

    return (
        <div className="bg-[#06363D]/50 border border-[#084B54] rounded-[20px] p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#084B54]/50">
                        <Icon
                            icon={icon}
                            width="24"
                            height="24"
                            style={{ color: color }}
                        />
                    </div>
                    <h3 className="font-hebden text-xl font-bold text-[#C7F4FA]">
                        {title}
                    </h3>
                </div>

                {/* Time range selector */}
                <div className="flex items-center gap-2 p-1 bg-[#084B54]/30 rounded-lg">
                    {(['7', '30', '90'] as TimeRange[]).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={cn(
                                "px-3 py-1.5 rounded-md font-nunito text-xs font-medium transition-all duration-200",
                                timeRange === range
                                    ? "bg-[#109EB1] text-white"
                                    : "text-[#C7F4FA]/60 hover:text-[#C7F4FA] hover:bg-[#084B54]/50"
                            )}
                        >
                            {range}D
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <AreaChart
                    data={filteredData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={gradientColor} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={gradientColor} stopOpacity={0.0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#084B54"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="label"
                        tick={{ fill: '#C7F4FA', opacity: 0.6, fontSize: 12 }}
                        tickLine={{ stroke: '#084B54' }}
                        axisLine={{ stroke: '#084B54' }}
                    />
                    <YAxis
                        tick={{ fill: '#C7F4FA', opacity: 0.6, fontSize: 12 }}
                        tickLine={{ stroke: '#084B54' }}
                        axisLine={{ stroke: '#084B54' }}
                        tickFormatter={valueFormatter}
                    />
                    <ChartTooltip
                        content={
                            <ChartTooltipContent
                                className="bg-[#06363D] border-[#109EB1]/30"
                                formatter={(value) => valueFormatter(value as number)}
                            />
                        }
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        fill={`url(#gradient-${title})`}
                        dot={false}
                    />
                </AreaChart>
            </ChartContainer>

            {/* Summary stats */}
            {filteredData.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#084B54] grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-[#C7F4FA]/40 font-nunito text-xs mb-1">Current</p>
                        <p className="text-[#109EB1] font-hebden text-lg font-bold">
                            {valueFormatter(filteredData[filteredData.length - 1]?.value || 0)}
                        </p>
                    </div>
                    <div>
                        <p className="text-[#C7F4FA]/40 font-nunito text-xs mb-1">Average</p>
                        <p className="text-[#109EB1] font-hebden text-lg font-bold">
                            {valueFormatter(
                                Math.round(
                                    filteredData.reduce((sum, d) => sum + d.value, 0) / filteredData.length
                                )
                            )}
                        </p>
                    </div>
                    <div>
                        <p className="text-[#C7F4FA]/40 font-nunito text-xs mb-1">Peak</p>
                        <p className="text-[#109EB1] font-hebden text-lg font-bold">
                            {valueFormatter(Math.max(...filteredData.map(d => d.value)))}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
