'use client';
import { useState, memo, useCallback } from 'react';
import { useComments } from '@/hooks/use-comments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/header/avatar';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rating } from '@/components/ui/rating';
import { useCurrentUser } from '@/hooks/use-current-user';
import type { CommentWithUser } from '@/lib/types/comment';
import { toast } from 'sonner';

// Extracted loading skeleton component
const CommentSkeleton = memo(() => (
	<div className="space-y-4">
		{[1, 2, 3].map((i) => (
			<div key={i} className="flex gap-4 animate-pulse">
				<div className="w-10 h-10 bg-muted rounded-full" />
				<div className="flex-1 space-y-2">
					<div className="h-4 bg-muted rounded w-1/4" />
					<div className="h-4 bg-muted rounded w-3/4" />
				</div>
			</div>
		))}
	</div>
));
CommentSkeleton.displayName = 'CommentSkeleton';

// Extracted comment form component
const CommentForm = memo(
	({
		onSubmit,
		isCreating
	}: {
		onSubmit: (content: string, rating: number) => Promise<void>;
		isCreating: boolean;
	}) => {
		const [content, setContent] = useState('');
		const [rating, setRating] = useState(5);

		const handleSubmit = async (e: React.FormEvent) => {
			e.preventDefault();
			if (!content.trim()) return;

			await onSubmit(content, rating);
			setContent('');
			setRating(5);
		};

		return (
			<div className="bg-gradient-to-r from-theme-primary-50/50 to-theme-secondary-50/50 p-6 rounded-xl border border-theme-primary-100 dark:from-theme-primary-950/10 dark:to-theme-secondary-950/10 dark:border-theme-primary-800/20">
				<div className="flex items-center gap-2 mb-6">
					<MessageCircle className="w-5 h-5 text-theme-primary-500" aria-hidden="true" />
					<h2 className="text-xl font-semibold text-theme-primary-900 dark:text-theme-primary-100">
						Add Your Comment
					</h2>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="flex items-center gap-2">
						<label htmlFor="rating" className="text-sm text-muted-foreground">
							Rating:
						</label>
						<Rating value={rating} onChange={setRating} size="md" />
					</div>
					<Textarea
						id="comment"
						placeholder="Share your thoughts..."
						value={content}
						onChange={(e) => setContent(e.target.value)}
						className="min-h-[100px] bg-white dark:bg-gray-900 resize-none focus:ring-theme-primary-500"
						maxLength={1000}
						required
					/>
					<div className="flex justify-end">
						<Button
							type="submit"
							disabled={isCreating || !content.trim()}
							className="bg-theme-primary-500 hover:bg-theme-primary-600 text-white"
						>
							{isCreating ? (
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									<span>Posting...</span>
								</div>
							) : (
								'Post Comment'
							)}
						</Button>
					</div>
				</form>
			</div>
		);
	}
);
CommentForm.displayName = 'CommentForm';

// Extracted single comment component
const Comment = memo(
	({
		comment,
		onDelete,
		currentUserId,
		isDeleting
	}: {
		comment: CommentWithUser;
		onDelete: (id: string) => Promise<void>;
		currentUserId?: string;
		isDeleting: boolean;
	}) => (
		<motion.div
			layout
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			className="group flex gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
		>
			<Avatar
				src={comment.user.image}
				alt={comment.user.name || 'Anonymous'}
				fallback={comment.user.name?.[0] || 'A'}
				size="md"
				className="w-10 h-10 ring-2 ring-theme-primary-100 dark:ring-theme-primary-800"
			/>
			<div className="flex-1">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="font-medium text-theme-primary-900 dark:text-theme-primary-100">
							{comment.user.name || 'Anonymous'}
						</span>
						<time dateTime={comment.createdAt.toString()} className="text-sm text-muted-foreground">
							{formatDistanceToNow(new Date(comment.createdAt), {
								addSuffix: true
							})}
						</time>
					</div>
					<div className="flex items-center gap-4">
						{currentUserId === comment.userId && (
							<Button
								variant="ghost"
								size="sm"
								className="opacity-0 group-hover:opacity-100 transition-opacity 
                text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
								onClick={() => onDelete(comment.id)}
								disabled={isDeleting}
								aria-label="Delete comment"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						)}
						<Rating value={comment.rating} readOnly size="sm" />
					</div>
				</div>
				<p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
			</div>
		</motion.div>
	)
);
Comment.displayName = 'Comment';

// Empty state component
const EmptyState = memo(() => (
	<div className="text-center py-8" role="status">
		<MessageCircle className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-3" aria-hidden="true" />
		<p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
	</div>
));
EmptyState.displayName = 'EmptyState';

interface CommentsSectionProps {
	itemId: string;
}

export function CommentsSection({ itemId }: CommentsSectionProps) {
	const { comments, isLoading, createComment, isCreating, deleteComment, isDeleting } = useComments(itemId);
	const { user } = useCurrentUser();
	const handleSubmit = useCallback(
		async (content: string, rating: number) => {
			try {
				await createComment({ content, itemId, rating });
			} catch (error) {
				toast.error(error instanceof Error ? error.message : 'Failed to post comment');
			}
		},
		[createComment, itemId]
	);

	const handleDelete = useCallback(
		async (commentId: string) => {
			try {
				await deleteComment(commentId);
				toast.success('Comment deleted successfully');
			} catch (error) {
				toast.error(error instanceof Error ? error.message : 'Failed to delete comment');
			}
		},
		[deleteComment]
	);

	if (isLoading) {
		return <CommentSkeleton />;
	}

	return (
		<div className="space-y-8">
			<CommentForm onSubmit={handleSubmit} isCreating={isCreating} />

			<div className="space-y-6">
				<h2 className="text-xl font-semibold text-theme-primary-900 dark:text-theme-primary-100">
					Comments ({comments.length} {user?.email})
				</h2>

				<AnimatePresence mode="popLayout">
					{comments.length > 0 ? (
						comments.map((comment: CommentWithUser) => (
							<Comment
								key={comment.id}
								comment={comment}
								onDelete={handleDelete}
								currentUserId={user?.id}
								isDeleting={isDeleting}
							/>
						))
					) : (
						<EmptyState />
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
