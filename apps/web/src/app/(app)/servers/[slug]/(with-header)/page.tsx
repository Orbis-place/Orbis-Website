"use client";

import { useServer } from '@/contexts/ServerContext';
import { Icon } from '@iconify-icon/react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import ServerStatCard from '@/components/servers/ServerStatCard';
import ServerChart from '@/components/servers/ServerChart';
import VoterLeaderboard from '@/components/servers/VoterLeaderboard';

export default function ServerDetailPage() {
    const { server } = useServer();

    if (!server) return null;

    // Get current month name
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });

    // Mock data for votes (will be replaced with real data later)
    const mockMonthlyVotes = Math.floor(server.voteCount * 0.3); // 30% of total votes this month
    const mockTotalVotes = server.voteCount;

    // Mock voter leaderboard data
    const mockTopVoters = [
        { username: 'player1', displayName: 'SuperGamer', avatar: undefined, votes: 45, rank: 1 },
        { username: 'player2', displayName: 'MinecraftPro', avatar: undefined, votes: 38, rank: 2 },
        { username: 'player3', displayName: 'BuildMaster', avatar: undefined, votes: 32, rank: 3 },
        { username: 'player4', displayName: 'Redstone_Wizard', avatar: undefined, votes: 28, rank: 4 },
        { username: 'player5', displayName: 'PvPKing', avatar: undefined, votes: 24, rank: 5 },
    ];

    // Mock player history data (generate last 90 days)
    const generateMockPlayerHistory = () => {
        const data = [];
        const now = new Date();
        for (let i = 89; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const baseValue = server.currentPlayers || 50;
            const variance = Math.random() * 30 - 15;
            data.push({
                timestamp: date.toISOString(),
                value: Math.max(0, Math.round(baseValue + variance)),
                label: i % 7 === 0 ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
            });
        }
        return data;
    };

    // Mock vote history data
    const generateMockVoteHistory = () => {
        const data = [];
        const now = new Date();
        let cumulativeVotes = 0;
        for (let i = 89; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dailyVotes = Math.floor(Math.random() * 20) + 5;
            cumulativeVotes += dailyVotes;
            data.push({
                timestamp: date.toISOString(),
                value: dailyVotes,
                label: i % 7 === 0 ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
            });
        }
        return data;
    };

    const playerHistoryData = generateMockPlayerHistory();
    const voteHistoryData = generateMockVoteHistory();

    return (
        <div className="space-y-6">
            {/* Statistics Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <ServerStatCard
                    icon="mdi:vote"
                    label="Total Votes"
                    value={mockTotalVotes.toLocaleString()}
                    description="All-time votes received from the community"
                    iconColor="#109EB1"
                />
                <ServerStatCard
                    icon="mdi:calendar-month"
                    label={`Votes (${currentMonth})`}
                    value={mockMonthlyVotes.toLocaleString()}
                    description={`Votes received in ${currentMonth}`}
                    iconColor="#69a024"
                    trend={{ value: 12, isPositive: true }}
                />
                <ServerStatCard
                    icon="mdi:account-multiple"
                    label="Players Online"
                    value={server.onlineStatus ? `${server.currentPlayers}/${server.maxPlayers}` : 'Offline'}
                    description="Current players connected to the server"
                    iconColor="#109EB1"
                />
                <ServerStatCard
                    icon="mdi:check-circle"
                    label="Uptime"
                    value={server.onlineStatus ? '99.2%' : '0.0%'}
                    description="Server availability over the last 30 days"
                    iconColor={server.onlineStatus ? '#69a024' : '#ef4444'}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ServerChart
                    title="Player Activity"
                    icon="mdi:chart-line"
                    data={playerHistoryData}
                    color="#109EB1"
                    gradientColor="#109EB1"
                    valueFormatter={(value) => `${value} players`}
                />
                <ServerChart
                    title="Vote History"
                    icon="mdi:chart-bar"
                    data={voteHistoryData}
                    color="#69a024"
                    gradientColor="#69a024"
                    valueFormatter={(value) => `${value} votes`}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Primary Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Categories & Tags */}
                    {((server.categories && server.categories.length > 0) || (server.tags && server.tags.length > 0)) && (
                        <div className="bg-[#06363D]/50 border border-[#084B54] rounded-[20px] p-6">
                            <h3 className="font-hebden text-xl font-bold text-[#C7F4FA] mb-4 flex items-center gap-2">
                                <Icon icon="mdi:tag-multiple" width="24" height="24" className="text-[#109EB1]" />
                                Categories & Tags
                            </h3>
                            <div className="space-y-4">
                                {server.categories && server.categories.length > 0 && (
                                    <div>
                                        <h4 className="font-hebden font-semibold text-sm text-[#C7F4FA]/60 mb-3">Categories</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {server.categories.map(({ category, isPrimary }) => (
                                                <div
                                                    key={category.id}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 hover:scale-105"
                                                    style={{
                                                        backgroundColor: isPrimary
                                                            ? `${category.color || '#109EB1'}20`
                                                            : '#084B54',
                                                        borderColor: isPrimary
                                                            ? `${category.color || '#109EB1'}60`
                                                            : '#084B54'
                                                    }}
                                                >
                                                    {category.icon && (
                                                        <Icon
                                                            icon={category.icon}
                                                            width="18"
                                                            height="18"
                                                            style={{ color: category.color || '#109EB1' }}
                                                        />
                                                    )}
                                                    <span
                                                        className="font-nunito text-sm font-medium"
                                                        style={{
                                                            color: isPrimary
                                                                ? (category.color || '#109EB1')
                                                                : '#C7F4FA'
                                                        }}
                                                    >
                                                        {category.name}
                                                    </span>
                                                    {isPrimary && (
                                                        <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-[#C7F4FA]/60">
                                                            PRIMARY
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {server.tags && server.tags.length > 0 && (
                                    <div>
                                        <h4 className="font-hebden font-semibold text-sm text-[#C7F4FA]/60 mb-3">Tags</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {server.tags.map(({ tag }) => (
                                                <span
                                                    key={tag.id}
                                                    className="px-3 py-1.5 rounded-full text-sm font-nunito bg-[#084B54] text-[#C7F4FA] border border-[#084B54] hover:border-[#109EB1]/30 transition-all duration-200"
                                                >
                                                    {tag.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Server Description */}
                    <div className="bg-[#06363D]/50 border border-[#084B54] rounded-[20px] p-6">
                        <h3 className="font-hebden text-xl font-bold text-[#C7F4FA] mb-4 flex items-center gap-2">
                            <Icon icon="mdi:information-outline" width="24" height="24" className="text-[#109EB1]" />
                            About {server.name}
                        </h3>
                        <p className="text-[#C7F4FA]/80 font-nunito whitespace-pre-wrap leading-relaxed">
                            {server.description || 'No description available.'}
                        </p>
                    </div>

                    {/* FAQ Accordion */}
                    <div className="bg-[#06363D]/50 border border-[#084B54] rounded-[20px] p-6">
                        <h3 className="font-hebden text-xl font-bold text-[#C7F4FA] mb-4 flex items-center gap-2">
                            <Icon icon="mdi:help-circle-outline" width="24" height="24" className="text-[#109EB1]" />
                            Frequently Asked Questions
                        </h3>
                        <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="font-hebden text-[#C7F4FA]">
                                    What is the IP Address of {server.name}?
                                </AccordionTrigger>
                                <AccordionContent className="text-[#C7F4FA]/80 font-nunito">
                                    <p>
                                        The IP Address of {server.name} is{' '}
                                        <span className="font-bold text-[#109EB1]">
                                            {server.serverIp}:{server.port}
                                        </span>
                                        . You can join the server by logging into Hytale, going to the server browser and using the IP Address.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>

                            {server.categories && server.categories.length > 0 && (
                                <AccordionItem value="item-2">
                                    <AccordionTrigger className="font-hebden text-[#C7F4FA]">
                                        What kind of content is there on {server.name}?
                                    </AccordionTrigger>
                                    <AccordionContent className="text-[#C7F4FA]/80 font-nunito">
                                        <p>
                                            {server.name} hosts a wide list of different content. Some of these include{' '}
                                            {server.categories.map(({ category }, index) => (
                                                <span key={category.id}>
                                                    <a href={`/servers?category=${category.slug}`} className="underline hover:opacity-80 text-[#109EB1]">
                                                        {category.name}
                                                    </a>
                                                    {index < server.categories!.length - 1 ? ', ' : ''}
                                                </span>
                                            ))}.
                                        </p>
                                    </AccordionContent>
                                </AccordionItem>
                            )}

                            <AccordionItem value="item-3">
                                <AccordionTrigger className="font-hebden text-[#C7F4FA]">
                                    Is {server.name} online right now?
                                </AccordionTrigger>
                                <AccordionContent className="text-[#C7F4FA]/80 font-nunito">
                                    {server.onlineStatus ? (
                                        <p>
                                            Yes, {server.name} is currently online with {server.currentPlayers} out of {server.maxPlayers} players!
                                        </p>
                                    ) : (
                                        <p>
                                            No, {server.name} is currently offline. You can check back later to see if the server is back online!
                                            We try to have the latest information on server availability on our website.
                                        </p>
                                    )}
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-4">
                                <AccordionTrigger className="font-hebden text-[#C7F4FA]">
                                    How do I vote for {server.name}?
                                </AccordionTrigger>
                                <AccordionContent className="text-[#C7F4FA]/80 font-nunito">
                                    <p>
                                        Click the "Vote for Server" button at the top of the page to cast your vote. You can vote once every 24 hours to support {server.name} and help it climb the rankings!
                                    </p>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Top Voters Leaderboard */}
                    <VoterLeaderboard
                        voters={mockTopVoters}
                        currentMonth={currentMonth}
                    />

                    {/* Server Information Table */}
                    <div className="bg-[#06363D]/50 border border-[#084B54] rounded-[20px] p-6">
                        <h3 className="font-hebden text-xl font-bold text-[#C7F4FA] mb-4 flex items-center gap-2">
                            <Icon icon="mdi:server" width="24" height="24" className="text-[#109EB1]" />
                            Server Information
                        </h3>
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-b border-[#084B54]">
                                    <th className="text-left py-3 font-hebden font-medium text-[#C7F4FA]/60">Name</th>
                                    <td className="text-right py-3 font-nunito text-[#C7F4FA]">{server.name}</td>
                                </tr>
                                <tr className="border-b border-[#084B54]">
                                    <th className="text-left py-3 font-hebden font-medium text-[#C7F4FA]/60">IP Address</th>
                                    <td className="text-right py-3 font-nunito text-[#C7F4FA]">{server.serverIp}:{server.port}</td>
                                </tr>
                                {server.websiteUrl && (
                                    <tr className="border-b border-[#084B54]">
                                        <th className="text-left py-3 font-hebden font-medium text-[#C7F4FA]/60">Website</th>
                                        <td className="text-right py-3 font-nunito">
                                            <a href={server.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-[#109EB1] hover:text-[#109EB1]/80 transition-colors">
                                                Visit
                                            </a>
                                        </td>
                                    </tr>
                                )}
                                <tr className="border-b border-[#084B54]">
                                    <th className="text-left py-3 font-hebden font-medium text-[#C7F4FA]/60">Status</th>
                                    <td className="text-right py-3 font-nunito text-[#C7F4FA]">
                                        {server.onlineStatus ? (
                                            <span className="text-[#69a024]">● Online</span>
                                        ) : (
                                            <span className="text-red-400">● Offline</span>
                                        )}
                                    </td>
                                </tr>
                                <tr className="border-b border-[#084B54]">
                                    <th className="text-left py-3 font-hebden font-medium text-[#C7F4FA]/60">Version</th>
                                    <td className="text-right py-3 font-nunito text-[#C7F4FA]">{server.gameVersion}</td>
                                </tr>
                                {server.verified && (
                                    <tr className="border-b border-[#084B54]">
                                        <th className="text-left py-3 font-hebden font-medium text-[#C7F4FA]/60">Verified</th>
                                        <td className="text-right py-3 font-nunito">
                                            <Icon icon="mdi:check-decagram" width="20" height="20" className="text-[#109EB1] inline" />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Social Links */}
                    {(server.websiteUrl || server.discordUrl || server.youtubeUrl || server.twitterUrl || server.tiktokUrl) && (
                        <div className="bg-[#06363D]/50 border border-[#084B54] rounded-[20px] p-6">
                            <h3 className="font-hebden text-xl font-bold text-[#C7F4FA] mb-4 flex items-center gap-2">
                                <Icon icon="mdi:link-variant" width="24" height="24" className="text-[#109EB1]" />
                                Social Links
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {server.discordUrl && (
                                    <a
                                        href={server.discordUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-[#084B54] border border-[#084B54] rounded-lg hover:bg-[#109EB1]/10 hover:border-[#109EB1] transition-all text-[#C7F4FA]"
                                    >
                                        <Icon icon="ic:baseline-discord" width="20" height="20" />
                                        <span className="font-nunito text-sm">Discord</span>
                                    </a>
                                )}
                                {server.youtubeUrl && (
                                    <a
                                        href={server.youtubeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-[#084B54] border border-[#084B54] rounded-lg hover:bg-[#109EB1]/10 hover:border-[#109EB1] transition-all text-[#C7F4FA]"
                                    >
                                        <Icon icon="mdi:youtube" width="20" height="20" />
                                        <span className="font-nunito text-sm">YouTube</span>
                                    </a>
                                )}
                                {server.twitterUrl && (
                                    <a
                                        href={server.twitterUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-[#084B54] border border-[#084B54] rounded-lg hover:bg-[#109EB1]/10 hover:border-[#109EB1] transition-all text-[#C7F4FA]"
                                    >
                                        <Icon icon="mdi:twitter" width="20" height="20" />
                                        <span className="font-nunito text-sm">Twitter</span>
                                    </a>
                                )}
                                {server.tiktokUrl && (
                                    <a
                                        href={server.tiktokUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-[#084B54] border border-[#084B54] rounded-lg hover:bg-[#109EB1]/10 hover:border-[#109EB1] transition-all text-[#C7F4FA]"
                                    >
                                        <Icon icon="ic:baseline-tiktok" width="20" height="20" />
                                        <span className="font-nunito text-sm">TikTok</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Share Section */}
                    <div className="bg-[#06363D]/50 border border-[#084B54] rounded-[20px] p-6">
                        <h3 className="font-hebden text-xl font-bold text-[#C7F4FA] mb-4 flex items-center gap-2">
                            <Icon icon="mdi:share-variant" width="24" height="24" className="text-[#109EB1]" />
                            Share Server
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="font-hebden text-sm font-medium text-[#C7F4FA]/60 mb-2">
                                    Server URL:
                                </p>
                                <div className="px-3 py-2 relative rounded-lg bg-[#084B54]/50 border border-[#084B54] overflow-x-auto">
                                    <pre className="text-xs text-[#C7F4FA]/80 font-mono">
                                        {`https://orbis.com/servers/${server.slug}`}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
