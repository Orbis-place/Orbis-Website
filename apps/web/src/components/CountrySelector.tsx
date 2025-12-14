'use client';

import { Icon } from '@iconify/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CountrySelectorProps {
    value?: string;
    onChange: (country: string) => void;
}

// List of common countries for server hosting
const COUNTRIES = [
    'France',
    'United States',
    'United Kingdom',
    'Germany',
    'Netherlands',
    'Canada',
    'Australia',
    'Japan',
    'Singapore',
    'Brazil',
    'Spain',
    'Italy',
    'Sweden',
    'Poland',
    'Belgium',
    'Switzerland',
    'Austria',
    'Norway',
    'Denmark',
    'Finland',
    'Russia',
    'India',
    'South Korea',
    'China',
    'Mexico',
    'Argentina',
    'Chile',
    'South Africa',
    'New Zealand',
    'Ireland',
].sort();

export function CountrySelector({ value, onChange }: CountrySelectorProps) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="bg-[#032125] border-[#084B54] text-[#C7F4FA] hover:bg-[#06363D] hover:border-[#109EB1]">
                <SelectValue placeholder="Select country..." />
            </SelectTrigger>
            <SelectContent className="bg-[#032125] border-[#084B54] max-h-64">
                {COUNTRIES.map((country) => (
                    <SelectItem
                        key={country}
                        value={country}
                        className="text-[#C7F4FA] focus:bg-[#06363D] focus:text-[#C7F4FA]"
                    >
                        {country}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
