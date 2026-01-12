'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from '@repo/auth/client';
import { useResource } from '@/contexts/ResourceContext';
import { fetchResourceComments, createResourceComment, deleteResourceComment, type ResourceComment } from '@/lib/api/resources';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Reply, Trash2, Send, LogIn, Flag } from 'lucide-react';
import { ReportDialog } from '@/components/ReportDialog';

export default function ResourceComments() {
    const { resource, isOwner } = useResource();
    const { data: session } = useSession();
    const [comments, setComments] = useState<ResourceComment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [commentToReport, setCommentToReport] = useState<ResourceComment | null>(null);

    const MAX_COMMENT_LENGTH = 500;

    const loadComments = useCallback(async () => {
        if (!resource?.id) return;

        try {
            setIsLoading(true);
            const response = await fetchResourceComments(resource.id, page);
            setComments(response.data);
            setTotalPages(response.meta.totalPages);
            setTotal(response.meta.total);
        } catch (error) {
            console.error('Failed to load comments:', error);
        } finally {
            setIsLoading(false);
        }
    }, [resource?.id, page]);

    useEffect(() => {
        loadComments();
    }, [loadComments]);

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resource?.id || !newComment.trim() || isSubmitting) return;

        try {
            setIsSubmitting(true);
            const comment = await createResourceComment(resource.id, newComment.trim());
            setComments(prev => [comment, ...prev]);
            setNewComment('');
            setTotal(prev => prev + 1);
        } catch (error) {
            console.error('Failed to create comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitReply = async (parentId: string) => {
        if (!resource?.id || !replyContent.trim() || isSubmitting) return;

        try {
            setIsSubmitting(true);
            const reply = await createResourceComment(resource.id, replyContent.trim(), parentId);
            setComments(prev => prev.map(comment => {
                if (comment.id === parentId) {
                    return {
                        ...comment,
                        replies: [...(comment.replies || []), reply],
                    };
                }
                return comment;
            }));
            setReplyingTo(null);
            setReplyContent('');
        } catch (error) {
            console.error('Failed to create reply:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string, parentId?: string) => {
        if (!resource?.id) return;

        try {
            await deleteResourceComment(resource.id, commentId);
            if (parentId) {
                setComments(prev => prev.map(comment => {
                    if (comment.id === parentId) {
                        return {
                            ...comment,
                            replies: (comment.replies || []).filter(r => r.id !== commentId),
                        };
                    }
                    return comment;
                }));
            } else {
                setComments(prev => prev.filter(c => c.id !== commentId));
                setTotal(prev => prev - 1);
            }
        } catch (error) {
            console.error('Failed to delete comment:', error);
        }
    };

    const canDelete = (userId: string) => {
        return session?.user?.id === userId || isOwner;
    };

    const renderComment = (comment: ResourceComment, isReply = false, parentId?: string) => (
        <div
            key={comment.id}
            className={`${isReply ? 'ml-8 mt-3' : 'mb-4'} bg-background rounded-lg border border-border p-4`}
        >
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <Link href={`/user/${comment.user.username}`} className="flex-shrink-0">
                    <Avatar className="size-9">
                        <AvatarImage src={comment.user.image || undefined} alt={comment.user.displayName || comment.user.username} />
                        <AvatarFallback className="bg-primary text-white font-medium text-sm">
                            {(comment.user.displayName ?? comment.user.username)[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                </Link>

                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Link
                            href={`/user/${comment.user.username}`}
                            className="font-nunito font-semibold text-foreground hover:text-primary transition-colors"
                        >
                            {comment.user.displayName || comment.user.username}
                        </Link>
                        <span className="text-muted-foreground text-sm">·</span>
                        <span className="text-muted-foreground text-sm">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                        {/* Version badge - only for main comments */}
                        {!isReply && comment.version && (
                            <>
                                <span className="text-muted-foreground text-sm">·</span>
                                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-nunito">
                                    v{comment.version.versionNumber}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Content */}
                    {(() => {
                        const isExpanded = expandedComments.has(comment.id);
                        const shouldTruncate = comment.content.length > MAX_COMMENT_LENGTH && !isExpanded;
                        const displayContent = shouldTruncate
                            ? comment.content.slice(0, MAX_COMMENT_LENGTH) + '...'
                            : comment.content;

                        return (
                            <>
                                <p className="text-foreground/80 mt-1 whitespace-pre-wrap break-words overflow-hidden font-nunito" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                                    {displayContent}
                                </p>
                                {comment.content.length > MAX_COMMENT_LENGTH && (
                                    <button
                                        onClick={() => {
                                            setExpandedComments(prev => {
                                                const newSet = new Set(prev);
                                                if (isExpanded) {
                                                    newSet.delete(comment.id);
                                                } else {
                                                    newSet.add(comment.id);
                                                }
                                                return newSet;
                                            });
                                        }}
                                        className="text-primary hover:text-primary/80 text-sm font-nunito mt-1 transition-colors"
                                    >
                                        {isExpanded ? 'See less' : 'See more'}
                                    </button>
                                )}
                            </>
                        );
                    })()}

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-2">
                        {/* Reply button - only for main comments */}
                        {!isReply && session?.user && (
                            <button
                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors text-sm font-nunito"
                            >
                                <Reply className="w-4 h-4" />
                                Reply
                            </button>
                        )}
                        {/* Delete button */}
                        {canDelete(comment.userId) && (
                            <button
                                onClick={() => handleDeleteComment(comment.id, parentId)}
                                className="flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors text-sm font-nunito"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        )}
                        {/* Report button - only if not the comment author */}
                        {session?.user && session.user.id !== comment.userId && (
                            <button
                                onClick={() => {
                                    setCommentToReport(comment);
                                    setReportDialogOpen(true);
                                }}
                                className="flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors text-sm font-nunito"
                            >
                                <Flag className="w-4 h-4" />
                                Report
                            </button>
                        )}
                    </div>

                    {/* Reply form */}
                    {replyingTo === comment.id && (
                        <div className="mt-3 flex gap-2">
                            <Input
                                type="text"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write a reply..."
                                className="flex-1 font-nunito"
                                maxLength={2000}
                            />
                            <Button
                                onClick={() => handleSubmitReply(comment.id)}
                                disabled={!replyContent.trim() || isSubmitting}
                                size="sm"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Replies */}
            {!isReply && comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 border-t border-border pt-3">
                    {comment.replies.map(reply => renderComment(reply, true, comment.id))}
                </div>
            )}
        </div>
    );

    if (!resource) return null;

    return (
        <div className="bg-secondary/30 rounded-lg p-6 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h2 className="font-hebden text-xl font-semibold text-foreground">
                    Comments {total > 0 && <span className="text-muted-foreground">({total})</span>}
                </h2>
            </div>

            {/* Comment form */}
            {session?.user ? (
                <form onSubmit={handleSubmitComment} className="mb-6">
                    <div className="flex gap-3">
                        <Avatar className="size-10 flex-shrink-0">
                            <AvatarImage src={session.user.image || undefined} alt={session.user.name || 'You'} />
                            <AvatarFallback className="bg-primary text-white font-medium">
                                {(session.user.name ?? 'U')[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <Textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                rows={3}
                                maxLength={2000}
                                className="font-nunito resize-none"
                            />
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-sm text-muted-foreground">
                                    {newComment.length}/2000
                                </span>
                                <Button
                                    type="submit"
                                    disabled={!newComment.trim() || isSubmitting}
                                    className="font-hebden"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    {isSubmitting ? 'Sending...' : 'Send'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="mb-6 bg-background rounded-lg border border-border p-4 text-center">
                    <p className="text-muted-foreground mb-3 font-nunito">Log in to leave a comment</p>
                    <Button asChild>
                        <Link href="/login">
                            <LogIn className="w-4 h-4 mr-2" />
                            Log in
                        </Link>
                    </Button>
                </div>
            )}

            {/* Comments list */}
            {isLoading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-40" />
                    <p className="font-nunito">No comments yet</p>
                    {session?.user && <p className="text-sm mt-1 font-nunito">Be the first to comment!</p>}
                </div>
            ) : (
                <div>
                    {comments.map(comment => renderComment(comment))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <span className="px-3 py-1 text-muted-foreground font-nunito">
                                {page} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Report Dialog */}
            {commentToReport && (
                <ReportDialog
                    type="resource_comment"
                    targetId={commentToReport.id}
                    targetName={`Comment by ${commentToReport.user.displayName || commentToReport.user.username}`}
                    open={reportDialogOpen}
                    onOpenChange={(open) => {
                        setReportDialogOpen(open);
                        if (!open) setCommentToReport(null);
                    }}
                />
            )}
        </div>
    );
}
