import { FiActivity, FiClock, FiEye, FiEdit, FiTrash2, FiTrendingUp, FiCheck, FiX, FiAlertCircle } from "react-icons/fi";
import { IconType } from "react-icons";

export interface Submission {
  id: string;
  title: string;
  description: string;
  status: "approved" | "pending" | "rejected" | "draft";
  submittedAt: string | null;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  category: string;
  tags: string[];
  views: number;
  likes: number;
}

interface StatusConfig {
  [key: string]: {
    label: string;
    icon: IconType;
    color: string;
    bgColor: string;
    borderColor: string;
  };
}

const statusConfig: StatusConfig = {
  approved: {
    label: "Approved",
    icon: FiCheck,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    borderColor: "border-green-200 dark:border-green-800",
  },
  pending: {
    label: "Pending Review",
    icon: FiClock,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    borderColor: "border-yellow-200 dark:border-yellow-800",
  },
  rejected: {
    label: "Rejected",
    icon: FiX,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    borderColor: "border-red-200 dark:border-red-800",
  },
  draft: {
    label: "Draft",
    icon: FiAlertCircle,
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    borderColor: "border-gray-200 dark:border-gray-700",
  },
};

export interface SubmissionItemProps {
  submission: Submission;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

export function SubmissionItem({ submission, onEdit, onDelete, onView }: SubmissionItemProps) {
  const status = statusConfig[submission.status];
  const StatusIcon = status.icon;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  return (
    <div className="group p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-theme-primary-300 dark:hover:border-theme-primary-600 hover:shadow-lg hover:shadow-theme-primary-500/10 transition-all duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xs">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg group-hover:text-theme-primary-700 dark:group-hover:text-theme-primary-400 transition-colors">
                  {submission.title}
                </h3>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color} ${status.borderColor} border`}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 leading-relaxed">{submission.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {submission.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-6 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <FiActivity className="w-3 h-3" />
                  {submission.category}
                </span>
                {submission.submittedAt && (
                  <span className="flex items-center gap-1">
                    <FiClock className="w-3 h-3" />
                    Submitted: {formatDate(submission.submittedAt)}
                  </span>
                )}
                {submission.status === "approved" && submission.views > 0 && (
                  <>
                    <span className="flex items-center gap-1">
                      <FiEye className="w-3 h-3" />
                      {submission.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <FiTrendingUp className="w-3 h-3" />
                      {submission.likes} likes
                    </span>
                  </>
                )}
              </div>
              {submission.status === "rejected" && submission.rejectionReason && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300">
                  <strong>Rejection Reason:</strong> {submission.rejectionReason}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <button
                className="p-2 text-gray-400 hover:text-theme-primary-600 dark:hover:text-theme-primary-400 transition-colors rounded-lg hover:bg-theme-primary-50 dark:hover:bg-theme-primary-900/20"
                title="View submission"
                onClick={onView ? () => onView(submission.id) : undefined}
              >
                <FiEye className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-gray-400 hover:text-theme-primary-600 dark:hover:text-theme-primary-400 transition-colors rounded-lg hover:bg-theme-primary-50 dark:hover:bg-theme-primary-900/20"
                title="Edit submission"
                onClick={onEdit ? () => onEdit(submission.id) : undefined}
              >
                <FiEdit className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Delete submission"
                onClick={onDelete ? () => onDelete(submission.id) : undefined}
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 