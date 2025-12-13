"use client";

import { Icon } from '@iconify/react';
import { useTeam } from '@/contexts/TeamContext';

export default function TeamResourcesPage() {
    const { team } = useTeam();

    if (!team) return null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {team.resources && team.resources.length > 0 ? (
                    team.resources.map((resource) => (
                        <a
                            key={resource.id}
                            href={`/${resource.type.toLowerCase().replace('_', '-')}/${resource.slug}`}
                            className="bg-[#06363D]/50 border border-[#084B54] rounded-[15px] p-4 hover:border-[#109EB1]/50 hover:bg-[#084B54]/30 transition-all"
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <div className="h-12 w-12 rounded-lg bg-[#032125] flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {resource.iconUrl ? (
                                        <img src={resource.iconUrl} alt={resource.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Icon icon="mdi:package-variant" width="24" height="24" className="text-[#C7F4FA]/60" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-hebden font-bold text-[#C7F4FA] truncate">{resource.name}</h3>
                                    <p className="text-xs text-[#C7F4FA]/60 font-nunito">{resource.type.replace(/_/g, ' ')}</p>
                                </div>
                            </div>
                            <p className="text-sm text-[#C7F4FA]/70 font-nunito line-clamp-2 mb-3">
                                {resource.tagline}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-[#C7F4FA]/60 font-nunito">
                                <span className="flex items-center gap-1">
                                    <Icon icon="mdi:download" width="14" height="14" />
                                    {resource.downloadCount}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Icon icon="mdi:heart" width="14" height="14" />
                                    {resource.likeCount}
                                </span>
                            </div>
                        </a>
                    ))
                ) : (
                    <div className="col-span-full text-center py-16 border border-dashed border-[#084B54] rounded-[20px]">
                        <Icon icon="mdi:package-variant-closed" width="64" height="64" className="mx-auto mb-4 text-[#C7F4FA]/30" />
                        <h3 className="font-hebden text-lg font-bold text-[#C7F4FA] mb-2">No resources yet</h3>
                        <p className="text-sm text-[#C7F4FA]/60 font-nunito">
                            This team hasn't published any resources.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
