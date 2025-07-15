import { MessageSquare, ThumbsUp, ThumbsDown, Star } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getItemPath } from "@/lib/utils";

interface ActivityItemProps {
  itemId: string;
  type: "comment" | "vote";
  content?: string;
  rating?: number;
  voteType?: string;
  createdAt: Date;
}

export function ActivityItem({
  itemId,
  type,
  content,
  rating,
  voteType,
  createdAt,
}: ActivityItemProps) {
  const getActivityIcon = () => {
    if (type === "comment") {
      return <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    }
    if (type === "vote") {
      return voteType === "upvote" ? (
        <ThumbsUp className="h-4 w-4 text-green-600 dark:text-green-400" />
      ) : (
        <ThumbsDown className="h-4 w-4 text-red-600 dark:text-red-400" />
      );
    }
    return null;
  };

  const getActivityText = () => {
    if (type === "comment") {
      return `Commented on ${itemId}`;
    }
    if (type === "vote") {
      const action = voteType === "upvote" ? "upvoted" : "downvoted";
      return `${action} ${itemId}`;
    }
    return `Interacted with ${itemId}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {getActivityIcon()}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {getActivityText()}
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(createdAt)}
            </span>
          </div>
          
          {type === "comment" && content && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {content}
            </p>
          )}
          
          {type === "comment" && rating && (
            <div className="mt-2 flex items-center space-x-1">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {rating}/5 rating
              </span>
            </div>
          )}
          
          <div className="mt-3">
            <Link
              href={getItemPath(itemId)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Item →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 