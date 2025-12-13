"use client";

import { Icon } from '@iconify/react';
import { useTeam } from '@/contexts/TeamContext';

export default function TeamOverviewPage() {
    const { team } = useTeam();

    if (!team) return null;

    return (
        <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-[#06363D]/50 border border-[#084B54] rounded-[20px] p-6">
                <h3 className="font-hebden text-xl font-bold text-[#C7F4FA] mb-4 flex items-center gap-2">
                    <Icon icon="mdi:clock-outline" width="24" height="24" className="text-[#109EB1]" />
                    Recent Activity
                </h3>
                <div className="text-center py-12 text-[#C7F4FA]/60">
                    <Icon icon="mdi:history" width="48" height="48" className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-nunito">No recent activity</p>
                </div>
            </div>
        </div>
    );
}
