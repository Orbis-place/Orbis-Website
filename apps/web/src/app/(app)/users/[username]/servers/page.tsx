"use client";

import { Icon } from '@iconify/react';
import { useUser } from '@/contexts/UserContext';

export default function UserServersPage() {
    const { user } = useUser();

    if (!user) return null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.ownedServers.length > 0 ? (
                    user.ownedServers.map((server) => (
                        <a
                            key={server.id}
                            href={`/servers/${server.slug}`}
                            className="bg-[#06363D]/50 border border-[#084B54] rounded-[15px] p-4 hover:border-[#109EB1]/50 hover:bg-[#084B54]/30 transition-all"
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <div className="h-12 w-12 rounded-lg bg-[#032125] flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {server.logo ? (
                                        <img src={server.logo} alt={server.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Icon icon="mdi:server" width="24" height="24" className="text-[#C7F4FA]/60" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-hebden font-bold text-[#C7F4FA] truncate">{server.name}</h3>
                                        {server.isOnline && (
                                            <span className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-xs text-[#C7F4FA]/60 font-nunito">{server.serverIp}:{server.port}</p>
                                </div>
                            </div>
                            {server.shortDesc && (
                                <p className="text-sm text-[#C7F4FA]/70 font-nunito line-clamp-2 mb-3">
                                    {server.shortDesc}
                                </p>
                            )}
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-4 text-[#C7F4FA]/60 font-nunito">
                                    <span className="flex items-center gap-1">
                                        <Icon icon="mdi:account" width="14" height="14" />
                                        {server.currentPlayers}/{server.maxPlayers}
                                    </span>
                                    <span className={server.isOnline ? 'text-green-500' : 'text-red-500'}>
                                        {server.isOnline ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                            </div>
                        </a>
                    ))
                ) : (
                    <div className="col-span-full text-center py-16 border border-dashed border-[#084B54] rounded-[20px]">
                        <Icon icon="mdi:server-off" width="64" height="64" className="mx-auto mb-4 text-[#C7F4FA]/30" />
                        <h3 className="font-hebden text-lg font-bold text-[#C7F4FA] mb-2">No servers</h3>
                        <p className="text-sm text-[#C7F4FA]/60 font-nunito">
                            This user doesn't own any servers.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
