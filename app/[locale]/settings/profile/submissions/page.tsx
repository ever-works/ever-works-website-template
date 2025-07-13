import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiFileText, FiArrowLeft, FiEye, FiEdit, FiTrash2, FiClock, FiCheck, FiX, FiAlertCircle } from "react-icons/fi";
import Link from "next/link";

const dummySubmissions = [
  {
    id: "1",
    title: "React Component Library",
    description: "A comprehensive component library for React applications",
    status: "approved" as const,
    submittedAt: "2024-01-15T10:30:00Z",
    approvedAt: "2024-01-18T14:20:00Z",
    category: "Libraries & Tools",
    tags: ["React", "TypeScript", "Components"],
    views: 1247,
    likes: 89,
  },
  {
    id: "2",
    title: "Next.js Boilerplate",
    description: "Production-ready Next.js starter with TypeScript and Tailwind CSS",
    status: "pending" as const,
    submittedAt: "2024-01-20T09:15:00Z",
    category: "Templates & Starters",
    tags: ["Next.js", "TypeScript", "Tailwind"],
    views: 0,
    likes: 0,
  },
  {
    id: "3",
    title: "E-commerce Dashboard",
    description: "Admin dashboard for e-commerce management",
    status: "rejected" as const,
    submittedAt: "2024-01-10T16:45:00Z",
    rejectedAt: "2024-01-12T11:30:00Z",
    rejectionReason: "Similar to existing submissions. Please add more unique features.",
    category: "Dashboards",
    tags: ["React", "Dashboard", "E-commerce"],
    views: 0,
    likes: 0,
  },
  {
    id: "4",
    title: "Weather App API",
    description: "RESTful API for weather data with caching",
    status: "draft" as const,
    submittedAt: null,
    category: "APIs",
    tags: ["Node.js", "Express", "Weather"],
    views: 0,
    likes: 0,
  },
];

const statusConfig = {
  approved: {
    label: "Approved",
    icon: FiCheck,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  pending: {
    label: "Pending Review",
    icon: FiClock,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  rejected: {
    label: "Rejected",
    icon: FiX,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  draft: {
    label: "Draft",
    icon: FiAlertCircle,
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-800",
  },
};

export default async function SubmissionsPage() {

  const stats = {
    total: dummySubmissions.length,
    approved: dummySubmissions.filter(s => s.status === "approved").length,
    pending: dummySubmissions.filter(s => s.status === "pending").length,
    rejected: dummySubmissions.filter(s => s.status === "rejected").length,
    draft: dummySubmissions.filter(s => s.status === "draft").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Container maxWidth="7xl" padding="default">
        <div className="space-y-8 pb-16">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link
              href="/settings/profile"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Settings
            </Link>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Submissions Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              Track and manage your directory submissions. Monitor their status and performance.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Submissions</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submissions List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <FiFileText className="w-5 h-5 text-theme-primary-500" />
                  Your Submissions
                </CardTitle>
                <Link
                  href="/submit"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-theme-primary-600 hover:bg-theme-primary-700 text-white rounded-lg transition-colors"
                >
                  <FiFileText className="w-4 h-4" />
                  New Submission
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dummySubmissions.map((submission) => (
                  <SubmissionItem key={submission.id} submission={submission} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}

interface SubmissionItemProps {
  submission: {
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
  };
}

function SubmissionItem({ submission }: SubmissionItemProps) {
  const status = statusConfig[submission.status];
  const StatusIcon = status.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{submission.title}</h3>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${status.bgColor} ${status.color}`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{submission.description}</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {submission.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span>Category: {submission.category}</span>
              {submission.submittedAt && (
                <span>Submitted: {formatDate(submission.submittedAt)}</span>
              )}
              {submission.status === "approved" && submission.views > 0 && (
                <>
                  <span>{submission.views} views</span>
                  <span>{submission.likes} likes</span>
                </>
              )}
            </div>
            {submission.status === "rejected" && submission.rejectionReason && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300">
                <strong>Rejection Reason:</strong> {submission.rejectionReason}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <button
              className="p-2 text-gray-400 hover:text-theme-primary-600 dark:hover:text-theme-primary-400 transition-colors"
              title="View submission"
            >
              <FiEye className="w-4 h-4" />
            </button>
            <button
              className="p-2 text-gray-400 hover:text-theme-primary-600 dark:hover:text-theme-primary-400 transition-colors"
              title="Edit submission"
            >
              <FiEdit className="w-4 h-4" />
            </button>
            <button
              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Delete submission"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 