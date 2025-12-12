import Image from 'next/image';
import { cn } from '@/lib/utils';

interface TopVoter {
    username: string;
    displayName?: string;
    avatar?: string;
    votes: number;
    rank: number;
}

interface VoterLeaderboardProps {
    voters: TopVoter[];
    currentMonth: string;
}

export default function VoterLeaderboard({ voters, currentMonth }: VoterLeaderboardProps) {
    const getMedalIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return "🥇";
            case 2:
                return "🥈";
            case 3:
                return "🥉";
            default:
                return null;
        }
    };

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1:
                return "text-yellow-400";
            case 2:
                return "text-gray-400";
            case 3:
                return "text-orange-400";
            default:
                return "text-[#C7F4FA]/60";
        }
    };

    return (
        <div className="bg-[#06363D]/50 border border-[#084B54] rounded-[20px] p-6">
            <h3 className="font-hebden text-xl font-bold text-[#C7F4FA] mb-4">
                🏆 Top Voters - {currentMonth}
            </h3>

            <div className="space-y-3">
                {voters.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-[#C7F4FA]/40 font-nunito text-sm">
                            No votes yet this month
                        </p>
                    </div>
                ) : (
                    voters.map((voter) => (
                        <div
                            key={voter.username}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                                voter.rank <= 3
                                    ? "bg-[#109EB1]/10 border border-[#109EB1]/30"
                                    : "bg-[#084B54]/30 hover:bg-[#084B54]/50"
                            )}
                        >
                            {/* Rank */}
                            <div className="flex items-center justify-center w-8 h-8">
                                {getMedalIcon(voter.rank) ? (
                                    <span className="text-2xl">{getMedalIcon(voter.rank)}</span>
                                ) : (
                                    <span className={cn("font-hebden text-lg font-bold", getRankColor(voter.rank))}>
                                        #{voter.rank}
                                    </span>
                                )}
                            </div>

                            {/* Avatar */}
                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#084B54] border-2 border-[#109EB1]/30">
                                {voter.avatar ? (
                                    <Image
                                        src={voter.avatar}
                                        alt={voter.displayName || voter.username}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#C7F4FA]/40 font-hebden text-sm">
                                        {(voter.displayName || voter.username).charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Username */}
                            <div className="flex-1 min-w-0">
                                <p className="font-hebden text-sm font-medium text-[#C7F4FA] truncate">
                                    {voter.displayName || voter.username}
                                </p>
                                <p className="font-nunito text-xs text-[#C7F4FA]/40 truncate">
                                    @{voter.username}
                                </p>
                            </div>

                            {/* Vote count */}
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#06363D]/60 rounded-lg border border-[#084B54]">
                                <span className="text-[#109EB1] font-hebden text-sm font-bold">
                                    {voter.votes}
                                </span>
                                <span className="text-[#C7F4FA]/40 font-nunito text-xs">
                                    votes
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
