"use client";

import { Icon } from '@iconify/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useTeam } from '@/contexts/TeamContext';

export default function TeamMembersPage() {
    const { team } = useTeam();

    if (!team) return null;

    const getInitials = (name: string) => {
        if (!name) return '??';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    return (
        <div className="space-y-6">
            {team.members.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {team.members.map((member) => (
                        <Link
                            key={member.user.id}
                            href={`/user/${member.user.username}`}
                            className="bg-[#06363D]/50 border border-[#084B54] rounded-[15px] p-4 hover:border-[#109EB1]/50 hover:bg-[#084B54]/30 transition-all"
                        >
                            <div className="flex items-start gap-3">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={member.user.image || undefined} alt={member.user.username} />
                                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 font-hebden">
                                        {getInitials(member.user.displayName || member.user.username)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="font-hebden font-bold text-[#C7F4FA] truncate">
                                        {member.user.displayName || member.user.username}
                                    </div>
                                    <div className="text-sm text-[#C7F4FA]/60 truncate">@{member.user.username}</div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#109EB1]/20 text-[#109EB1]">
                                            {member.role}
                                        </span>
                                        <span className="text-xs text-[#C7F4FA]/50">
                                            {formatDate(member.joinedAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border border-dashed border-[#084B54] rounded-[20px]">
                    <Icon ssr={true} icon="mdi:account-group-outline" width="64" height="64" className="mx-auto mb-4 text-[#C7F4FA]/30" />
                    <h3 className="font-hebden text-lg font-bold text-[#C7F4FA] mb-2">No members</h3>
                    <p className="text-sm text-[#C7F4FA]/60 font-nunito">
                        This team doesn't have any members yet.
                    </p>
                </div>
            )}
        </div>
    );
}
