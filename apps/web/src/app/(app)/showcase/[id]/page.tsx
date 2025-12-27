'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import {
    fetchShowcasePost,
    fetchShowcaseComments,
    likeShowcasePost,
    unlikeShowcasePost,
    createShowcaseComment,
    SHOWCASE_CATEGORIES,
    type ShowcasePost,
    type ShowcaseComment,
} from '@/lib/api/showcase';
import { useSessionStore } from '@/stores/useSessionStore';
import { TiptapViewer } from '@/components/TiptapViewer';

export default function ShowcaseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { session } = useSessionStore();
    const postId = params.id as string;

    const [post, setPost] = useState<ShowcasePost | null>(null);
    const [comments, setComments] = useState<ShowcaseComment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasLiked, setHasLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [replyToId, setReplyToId] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');

    useEffect(() => {
        async function loadPost() {
            try {
                const data = await fetchShowcasePost(postId);
                setPost(data);
                setHasLiked(data.hasLiked || false);
                setLikeCount(data.likeCount);
            } catch (error) {
                console.error('Failed to load post:', error);
                router.push('/showcase');
            } finally {
                setIsLoading(false);
            }
        }

        async function loadComments() {
            try {
                const response = await fetchShowcaseComments(postId);
                setComments(response.data);
            } catch (error) {
                console.error('Failed to load comments:', error);
            }
        }

        loadPost();
        loadComments();
    }, [postId, router]);

    const handleLike = async () => {
        if (!session) return;

        try {
            if (hasLiked) {
                await unlikeShowcasePost(postId);
                setHasLiked(false);
                setLikeCount((c) => c - 1);
            } else {
                await likeShowcasePost(postId);
                setHasLiked(true);
                setLikeCount((c) => c + 1);
            }
        } catch (error) {
            console.error('Failed to toggle like:', error);
        }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !session) return;

        setIsSubmittingComment(true);
        try {
            const comment = await createShowcaseComment(postId, newComment.trim());
            setComments((prev) => [...prev, comment]);
            setNewComment('');
        } catch (error) {
            console.error('Failed to submit comment:', error);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleSubmitReply = async (parentId: string) => {
        if (!replyContent.trim() || !session) return;

        setIsSubmittingComment(true);
        try {
            const reply = await createShowcaseComment(postId, replyContent.trim(), parentId);
            // Add reply to the parent comment's replies array
            setComments((prev) => prev.map(c =>
                c.id === parentId
                    ? { ...c, replies: [...(c.replies || []), reply] }
                    : c
            ));
            setReplyContent('');
            setReplyToId(null);
        } catch (error) {
            console.error('Failed to submit reply:', error);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin">
                    <Icon icon="mdi:loading" className="text-4xl text-[#109EB1]" />
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Icon icon="mdi:alert-circle-outline" className="text-6xl text-[#C7F4FA]/30 mx-auto mb-4" />
                    <h2 className="font-hebden text-xl text-[#C7F4FA]">Post not found</h2>
                </div>
            </div>
        );
    }

    const categoryInfo = SHOWCASE_CATEGORIES[post.category];
    const media = post.media || [];

    return (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Button */}
            <Link
                href="/showcase"
                className="inline-flex items-center gap-2 text-[#C7F4FA]/70 hover:text-[#C7F4FA] transition-colors mb-6"
            >
                <Icon icon="mdi:arrow-left" />
                <span className="font-nunito">Back to Showcase</span>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Media Gallery */}
                    {media.length > 0 && (
                        <div className="space-y-4">
                            {/* Main Image/Video */}
                            <div className="relative aspect-video bg-[#032125] rounded-xl overflow-hidden">
                                {media[currentMediaIndex]?.type === 'VIDEO' ? (
                                    <video
                                        src={media[currentMediaIndex].url}
                                        controls
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <img
                                        src={media[currentMediaIndex]?.url}
                                        alt={media[currentMediaIndex]?.caption || post.title}
                                        className="w-full h-full object-contain"
                                    />
                                )}

                                {/* Navigation Arrows */}
                                {media.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setCurrentMediaIndex((i) => (i - 1 + media.length) % media.length)}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#032125]/80 border border-[#109EB1]/30 flex items-center justify-center text-[#C7F4FA] hover:bg-[#109EB1]/20 transition-colors"
                                        >
                                            <Icon icon="mdi:chevron-left" className="text-2xl" />
                                        </button>
                                        <button
                                            onClick={() => setCurrentMediaIndex((i) => (i + 1) % media.length)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#032125]/80 border border-[#109EB1]/30 flex items-center justify-center text-[#C7F4FA] hover:bg-[#109EB1]/20 transition-colors"
                                        >
                                            <Icon icon="mdi:chevron-right" className="text-2xl" />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {media.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {media.map((m, i) => (
                                        <button
                                            key={m.id}
                                            onClick={() => setCurrentMediaIndex(i)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${i === currentMediaIndex
                                                ? 'border-[#109EB1]'
                                                : 'border-transparent opacity-60 hover:opacity-100'
                                                }`}
                                        >
                                            <img
                                                src={m.url}
                                                alt={m.caption || `Media ${i + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    {post.description && (
                        <div className="bg-[#06363D]/50 backdrop-blur-sm border border-[#109EB1]/10 rounded-xl p-6">
                            <h3 className="font-hebden text-lg text-[#C7F4FA] mb-4">Description</h3>
                            <div className="prose prose-invert prose-sm max-w-none text-[#C7F4FA]/80">
                                <TiptapViewer content={post.description} />
                            </div>
                        </div>
                    )}

                    {/* Comments Section */}
                    <div className="bg-[#06363D]/50 backdrop-blur-sm border border-[#109EB1]/10 rounded-xl p-6">
                        <h3 className="font-hebden text-lg text-[#C7F4FA] mb-6">
                            Comments ({comments.length})
                        </h3>

                        {/* Comment Form */}
                        {session ? (
                            <form onSubmit={handleSubmitComment} className="mb-6">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Share your thoughts..."
                                    className="w-full px-4 py-3 bg-[#032125] border border-[#109EB1]/20 rounded-lg text-[#C7F4FA] placeholder:text-[#C7F4FA]/40 focus:outline-none focus:border-[#109EB1]/40 resize-none font-nunito"
                                    rows={3}
                                />
                                <div className="flex justify-end mt-3">
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim() || isSubmittingComment}
                                        className="px-4 py-2 bg-[#109EB1] text-white rounded-lg font-nunito font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#109EB1]/80 transition-colors"
                                    >
                                        {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="mb-6 p-4 bg-[#032125] rounded-lg text-center">
                                <p className="text-[#C7F4FA]/60 font-nunito">
                                    <Link href="/login" className="text-[#109EB1] hover:underline">Sign in</Link>
                                    {' '}to leave a comment
                                </p>
                            </div>
                        )}

                        {/* Comments List */}
                        <div className="space-y-4">
                            {comments.length === 0 ? (
                                <p className="text-[#C7F4FA]/50 font-nunito text-center py-4">
                                    No comments yet. Be the first to share your thoughts!
                                </p>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="space-y-3">
                                        {/* Main Comment */}
                                        <div className="flex gap-3">
                                            <Link href={`/users/${comment.user.username}`} className="flex-shrink-0">
                                                {comment.user.image ? (
                                                    <img
                                                        src={comment.user.image}
                                                        alt={comment.user.displayName || comment.user.username}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-[#109EB1]/20 flex items-center justify-center">
                                                        <span className="font-hebden text-[#109EB1]">
                                                            {(comment.user.displayName || comment.user.username).slice(0, 1).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                            </Link>
                                            <div className="flex-1">
                                                <div className="bg-[#032125] rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Link
                                                            href={`/users/${comment.user.username}`}
                                                            className="font-semibold text-[#C7F4FA] hover:text-[#109EB1] transition-colors font-nunito"
                                                        >
                                                            {comment.user.displayName || comment.user.username}
                                                        </Link>
                                                        <span className="text-xs text-[#C7F4FA]/40">
                                                            {new Date(comment.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-[#C7F4FA]/80 font-nunito text-sm">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                                {/* Reply button */}
                                                {session && (
                                                    <button
                                                        onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
                                                        className="mt-2 text-xs text-[#C7F4FA]/50 hover:text-[#109EB1] transition-colors font-nunito flex items-center gap-1"
                                                    >
                                                        <Icon icon="mdi:reply" />
                                                        Reply
                                                    </button>
                                                )}
                                                {/* Reply form */}
                                                {replyToId === comment.id && (
                                                    <div className="mt-3 flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={replyContent}
                                                            onChange={(e) => setReplyContent(e.target.value)}
                                                            placeholder={`Reply to ${comment.user.displayName || comment.user.username}...`}
                                                            className="flex-1 px-3 py-2 bg-[#032125] border border-[#109EB1]/20 rounded-lg text-[#C7F4FA] placeholder:text-[#C7F4FA]/40 focus:outline-none focus:border-[#109EB1]/40 text-sm font-nunito"
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                                    e.preventDefault();
                                                                    handleSubmitReply(comment.id);
                                                                }
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => handleSubmitReply(comment.id)}
                                                            disabled={!replyContent.trim() || isSubmittingComment}
                                                            className="px-3 py-2 bg-[#109EB1] text-white rounded-lg text-sm font-nunito disabled:opacity-50 hover:bg-[#109EB1]/80 transition-colors"
                                                        >
                                                            <Icon icon="mdi:send" />
                                                        </button>
                                                        <button
                                                            onClick={() => { setReplyToId(null); setReplyContent(''); }}
                                                            className="px-3 py-2 text-[#C7F4FA]/50 hover:text-[#C7F4FA] transition-colors"
                                                        >
                                                            <Icon icon="mdi:close" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Replies */}
                                        {comment.replies && comment.replies.length > 0 && (
                                            <div className="ml-12 space-y-3 border-l-2 border-[#109EB1]/10 pl-4">
                                                {comment.replies.map((reply) => (
                                                    <div key={reply.id} className="flex gap-3">
                                                        <Link href={`/users/${reply.user.username}`} className="flex-shrink-0">
                                                            {reply.user.image ? (
                                                                <img
                                                                    src={reply.user.image}
                                                                    alt={reply.user.displayName || reply.user.username}
                                                                    className="w-8 h-8 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-[#109EB1]/20 flex items-center justify-center">
                                                                    <span className="font-hebden text-xs text-[#109EB1]">
                                                                        {(reply.user.displayName || reply.user.username).slice(0, 1).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </Link>
                                                        <div className="flex-1 bg-[#032125]/50 rounded-lg p-3">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Link
                                                                    href={`/users/${reply.user.username}`}
                                                                    className="font-semibold text-[#C7F4FA] hover:text-[#109EB1] transition-colors font-nunito text-sm"
                                                                >
                                                                    {reply.user.displayName || reply.user.username}
                                                                </Link>
                                                                <span className="text-xs text-[#C7F4FA]/40">
                                                                    {new Date(reply.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-[#C7F4FA]/80 font-nunito text-sm">
                                                                {reply.content}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Post Info */}
                    <div className="bg-[#06363D]/50 backdrop-blur-sm border border-[#109EB1]/10 rounded-xl p-6 space-y-4">
                        {/* Category */}
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-nunito font-semibold"
                            style={{ backgroundColor: categoryInfo.color, color: '#032125' }}
                        >
                            <Icon icon={categoryInfo.icon} />
                            {categoryInfo.label}
                        </div>

                        {/* Title */}
                        <h1 className="font-hebden text-2xl text-[#C7F4FA]">{post.title}</h1>

                        {/* Owner (Team or User) */}
                        {post.ownerTeam ? (
                            <Link
                                href={`/team/${post.ownerTeam.slug}`}
                                className="flex items-center gap-3 p-3 bg-[#032125] rounded-lg hover:bg-[#032125]/80 transition-colors"
                            >
                                {post.ownerTeam.logo ? (
                                    <img
                                        src={post.ownerTeam.logo}
                                        alt={post.ownerTeam.name}
                                        className="w-12 h-12 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-lg bg-[#109EB1]/20 flex items-center justify-center">
                                        <Icon icon="mdi:account-group" className="text-2xl text-[#109EB1]" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-[#C7F4FA] font-nunito">
                                        {post.ownerTeam.name}
                                    </p>
                                    <p className="text-sm text-[#C7F4FA]/60 font-nunito">Team</p>
                                </div>
                            </Link>
                        ) : (
                            <Link
                                href={`/users/${post.author.username}`}
                                className="flex items-center gap-3 p-3 bg-[#032125] rounded-lg hover:bg-[#032125]/80 transition-colors"
                            >
                                {post.author.image ? (
                                    <img
                                        src={post.author.image}
                                        alt={post.author.displayName || post.author.username}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-[#109EB1]/20 flex items-center justify-center">
                                        <span className="font-hebden text-xl text-[#109EB1]">
                                            {(post.author.displayName || post.author.username).slice(0, 1).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-[#C7F4FA] font-nunito">
                                        {post.author.displayName || post.author.username}
                                    </p>
                                    <p className="text-sm text-[#C7F4FA]/60 font-nunito">@{post.author.username}</p>
                                </div>
                            </Link>
                        )}

                        {/* Stats & Like Button */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleLike}
                                disabled={!session}
                                className={`flex-1 py-3 rounded-lg font-nunito font-semibold transition-all flex items-center justify-center gap-2 ${hasLiked
                                    ? 'bg-[#E9735B] text-white'
                                    : 'bg-[#032125] text-[#C7F4FA] hover:bg-[#032125]/80'
                                    } disabled:cursor-not-allowed`}
                            >
                                <Icon icon={hasLiked ? 'mdi:heart' : 'mdi:heart-outline'} className="text-xl" />
                                {likeCount}
                            </button>
                            <div className="flex items-center gap-2 text-[#C7F4FA]/60">
                                <Icon icon="mdi:eye-outline" />
                                <span className="font-nunito">{post.viewCount}</span>
                            </div>
                        </div>

                        {/* Date */}
                        <p className="text-sm text-[#C7F4FA]/50 font-nunito">
                            Posted {new Date(post.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>

                        {/* Edit Button - Only for owner (author or ownerUser) */}
                        {(session?.user?.id === post.author.id || session?.user?.id === post.ownerUser?.id) && (
                            <Link
                                href={`/showcase/${post.id}/edit`}
                                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#032125] text-[#C7F4FA] rounded-lg font-nunito font-semibold hover:bg-[#109EB1]/20 hover:text-[#109EB1] transition-colors border border-[#109EB1]/20"
                            >
                                <Icon icon="mdi:pencil-outline" />
                                Edit Post
                            </Link>
                        )}
                    </div>

                    {/* Linked Resource */}
                    {post.linkedResource && (
                        <div className="bg-[#06363D]/50 backdrop-blur-sm border border-[#109EB1]/10 rounded-xl p-6">
                            <h3 className="font-hebden text-sm text-[#C7F4FA]/70 mb-3 uppercase tracking-wider">
                                Related Resource
                            </h3>
                            <Link
                                href={`/${post.linkedResource.type.toLowerCase()}/${post.linkedResource.slug}`}
                                className="flex items-center gap-3 p-3 bg-[#032125] rounded-lg hover:bg-[#032125]/80 transition-colors"
                            >
                                {post.linkedResource.iconUrl ? (
                                    <img
                                        src={post.linkedResource.iconUrl}
                                        alt={post.linkedResource.name}
                                        className="w-12 h-12 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-lg bg-[#109EB1]/20 flex items-center justify-center">
                                        <Icon icon="mdi:package-variant" className="text-2xl text-[#109EB1]" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-[#C7F4FA] font-nunito truncate">
                                        {post.linkedResource.name}
                                    </p>
                                    <p className="text-xs text-[#C7F4FA]/60 font-nunito uppercase">
                                        {post.linkedResource.type.replace('_', ' ')}
                                    </p>
                                </div>
                                <Icon icon="mdi:arrow-right" className="text-[#C7F4FA]/40" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
