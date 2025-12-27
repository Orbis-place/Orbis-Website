'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { OrbisConfirmDialog } from '@/components/OrbisDialog';
import { toast } from 'sonner';
import { SHOWCASE_CATEGORIES, type ShowcaseCategory } from '@/lib/api/showcase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ShowcasePost {
    id: string;
    title: string;
    category: ShowcaseCategory;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    viewCount: number;
    createdAt: string;
    media: {
        id: string;
        url: string;
        type: string;
    }[];
    _count: {
        likes: number;
        comments: number;
    };
}

export default function TeamShowcasePage() {
    const params = useParams();
    const router = useRouter();
    const teamName = params.teamName as string;

    const [posts, setPosts] = useState<ShowcasePost[]>([]);
    const [loading, setLoading] = useState(true);
    const [teamId, setTeamId] = useState<string>('');
    const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

    useEffect(() => {
        fetchPosts();
    }, [teamName]);

    const fetchPosts = async () => {
        try {
            setLoading(true);

            // First, get the team ID from the team name
            const teamResponse = await fetch(`${API_URL}/teams/${teamName}`, {
                credentials: 'include',
            });

            if (!teamResponse.ok) {
                throw new Error('Failed to fetch team');
            }

            const teamData = await teamResponse.json();
            setTeamId(teamData.id);

            // Fetch showcase posts
            const postsResponse = await fetch(`${API_URL}/teams/${teamData.id}/showcase`, {
                credentials: 'include',
            });

            if (postsResponse.ok) {
                const postsData = await postsResponse.json();
                setPosts(postsData);
            }
        } catch (error) {
            console.error('Error fetching team showcase:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = async () => {
        if (!deletingPostId) return;

        try {
            const response = await fetch(`${API_URL}/showcase/${deletingPostId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                setPosts(posts.filter(post => post.id !== deletingPostId));
                toast.success('Showcase post deleted successfully');
            }
        } catch (error) {
            console.error('Failed to delete post:', error);
            toast.error('Failed to delete post');
        } finally {
            setDeletingPostId(null);
        }
    };

    const getStatusColor = (status: ShowcasePost['status']) => {
        switch (status) {
            case 'PUBLISHED': return 'text-[#10b981]';
            case 'DRAFT': return 'text-[#6b7280]';
            case 'ARCHIVED': return 'text-[#6b7280]';
            default: return 'text-muted-foreground';
        }
    };

    const getStatusIcon = (status: ShowcasePost['status']) => {
        switch (status) {
            case 'PUBLISHED': return 'mdi:check-circle';
            case 'DRAFT': return 'mdi:file-document-outline';
            case 'ARCHIVED': return 'mdi:archive';
            default: return 'mdi:help-circle';
        }
    };

    const totalPosts = posts.length;
    const totalViews = posts.reduce((acc, p) => acc + p.viewCount, 0);
    const totalLikes = posts.reduce((acc, p) => acc + p._count.likes, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Icon icon="mdi:loading" className="animate-spin text-primary" width="48" height="48" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="font-hebden text-2xl font-bold text-foreground">Team Showcase</h1>
                    <p className="text-muted-foreground mt-1 font-nunito text-sm">
                        Manage showcase posts owned by this team
                    </p>
                </div>

                <Link href={`/showcase/new?teamId=${teamId}`}>
                    <Button className="font-hebden">
                        <Icon icon="mdi:plus" width="20" height="20" />
                        Create Post
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center p-3 bg-primary/20 rounded-lg">
                            <Icon icon="mdi:image-multiple" width="24" height="24" className="text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-hebden text-foreground">{totalPosts}</p>
                            <p className="text-sm text-foreground/70 font-nunito">Total Posts</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-secondary/40 to-secondary/10 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center p-3 bg-primary/20 rounded-lg">
                            <Icon icon="mdi:eye" width="24" height="24" className="text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-hebden text-foreground">{totalViews}</p>
                            <p className="text-sm text-foreground/70 font-nunito">Total Views</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-accent/80 to-accent/40 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center p-3 bg-primary/20 rounded-lg">
                            <Icon icon="mdi:heart" width="24" height="24" className="text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-hebden text-foreground">{totalLikes}</p>
                            <p className="text-sm text-foreground/70 font-nunito">Total Likes</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts List */}
            <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="font-hebden text-xl font-semibold mb-4 text-foreground">Showcase Posts</h2>
                {posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {posts.map((post) => {
                            const categoryInfo = SHOWCASE_CATEGORIES[post.category];
                            const thumbnail = post.media[0]?.url;

                            return (
                                <div key={post.id} className="bg-accent/50 rounded-lg p-4 hover:bg-accent/70 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="w-24 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {thumbnail ? (
                                                <img src={thumbnail} alt={post.title} className="w-full h-full object-cover rounded-lg" />
                                            ) : (
                                                <Icon icon="mdi:image-off-outline" width="32" height="32" className="text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-hebden text-lg font-semibold text-foreground line-clamp-1">{post.title}</h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground font-nunito mb-2">
                                                <Icon icon={getStatusIcon(post.status)} width="16" height="16" className={getStatusColor(post.status)} />
                                                <span className={getStatusColor(post.status)}>{post.status}</span>
                                                <span>•</span>
                                                <span
                                                    className="px-2 py-0.5 rounded text-xs font-semibold"
                                                    style={{ backgroundColor: categoryInfo.color, color: '#032125' }}
                                                >
                                                    {categoryInfo.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground font-nunito">
                                                <span className="flex items-center gap-1">
                                                    <Icon icon="mdi:eye" width="16" height="16" />
                                                    {post.viewCount}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Icon icon="mdi:heart" width="16" height="16" />
                                                    {post._count.likes}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Icon icon="mdi:comment" width="16" height="16" />
                                                    {post._count.comments}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="font-nunito text-sm"
                                            onClick={() => router.push(`/showcase/${post.id}`)}
                                        >
                                            <Icon icon="mdi:eye" width="16" height="16" />
                                            View
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="font-nunito text-sm"
                                            onClick={() => router.push(`/showcase/${post.id}/edit`)}
                                        >
                                            <Icon icon="mdi:pencil" width="16" height="16" />
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="font-nunito text-sm"
                                            onClick={() => setDeletingPostId(post.id)}
                                        >
                                            <Icon icon="mdi:delete" width="16" height="16" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="p-4 bg-accent rounded-full mb-4">
                            <Icon icon="mdi:image-multiple-outline" width="48" height="48" className="text-muted-foreground" />
                        </div>
                        <p className="text-foreground font-nunito text-lg mb-2">No showcase posts yet</p>
                        <p className="text-muted-foreground font-nunito text-sm mb-6 text-center max-w-md">
                            Start sharing your team's creations with the community.
                        </p>
                        <Link href={`/showcase/new?teamId=${teamId}`}>
                            <Button className="font-hebden">
                                <Icon icon="mdi:plus" width="20" height="20" />
                                Create First Post
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <OrbisConfirmDialog
                open={!!deletingPostId}
                onOpenChange={(open) => !open && setDeletingPostId(null)}
                title="Delete Showcase Post"
                description="Are you sure you want to delete this showcase post? This action cannot be undone."
                confirmText="Delete Post"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleDeletePost}
                onCancel={() => setDeletingPostId(null)}
            >
                <></>
            </OrbisConfirmDialog>
        </div>
    );
}
