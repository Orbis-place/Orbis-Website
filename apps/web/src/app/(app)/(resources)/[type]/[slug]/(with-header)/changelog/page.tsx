"use client";

import { Calendar } from 'lucide-react';
import { useResource } from '@/contexts/ResourceContext';

export default function ChangelogPage() {
    const { resource } = useResource();

    if (!resource) return null;

    // Mock changelog data - will be replaced with real data from backend
    const changelog = [
        {
            version: '2.1.0',
            date: '1 week ago',
            changes: [
                'Added new feature',
                'Improved performance',
                'Fixed bugs',
                'Updated for latest version'
            ]
        },
        {
            version: '2.0.0',
            date: '1 month ago',
            changes: [
                'Major update',
                'New features',
                'Complete redesign'
            ]
        }
    ];

    return (
        <div className="flex flex-col gap-6">
            {changelog.map((entry, i) => (
                <div key={i} className="bg-[#06363D] border border-[#084B54] rounded-[25px] p-6">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#084B54]">
                        <h3 className="font-hebden font-bold text-2xl text-[#C7F4FA]">
                            Version {entry.version}
                        </h3>
                        <span className="flex items-center gap-2 font-nunito text-sm text-[#C7F4FA]/60">
                            <Calendar className="w-4 h-4" />
                            {entry.date}
                        </span>
                    </div>
                    <ul className="space-y-2">
                        {entry.changes.map((change, j) => (
                            <li key={j} className="flex items-start gap-3 font-nunito text-base text-[#C7F4FA]">
                                <span className="text-[#109EB1] mt-1">•</span>
                                <span>{change}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
