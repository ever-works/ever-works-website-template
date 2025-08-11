"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardBody, Chip, Input } from "@heroui/react";
import { Trash2, MessageSquare, Search } from "lucide-react";
import { toast } from "sonner";

interface AdminCommentUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface AdminCommentItem {
  id: string;
  content: string;
  rating: number | null;
  userId: string;
  itemId: string;
  createdAt: string | null;
  updatedAt: string | null;
  user: AdminCommentUser;
}

interface ListResponse {
  comments: AdminCommentItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminCommentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchComments = async (targetPage: number = page) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: "10",
        ...(debouncedSearch && { search: debouncedSearch }),
      });
      const res = await fetch(`/api/admin/comments?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load comments");
      const data: ListResponse = await res.json();
      setComments(data.comments);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (e) {
      toast.error("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const confirmAndDelete = async (id: string) => {
    if (!id) return;
    try {
      setIsDeleting(id);
      const res = await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Delete failed");
      toast.success("Comment deleted");
      // Refresh current page
      fetchComments();
    } catch (e) {
      toast.error("Failed to delete comment");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Manage Comments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">View and delete user comments</p>
        </div>
        <Chip color="primary" variant="flat" startContent={<MessageSquare className="h-4 w-4" />}>{total} total</Chip>
      </div>

      <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardBody className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative w-full max-w-md">
              <Input
                startContent={<Search className="h-4 w-4 text-gray-400" />}
                value={search}
                onValueChange={setSearch}
                placeholder="Search by content, author name or email"
                variant="bordered"
              />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardBody className="p-0">
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {isLoading ? (
              <div className="p-6 text-sm text-gray-500">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">No comments found.</div>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="p-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {c.user.name || c.user.email || "Unknown User"}
                        </p>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-500 truncate">{new Date(c.createdAt || '').toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {typeof c.rating === "number" && (
                          <Chip size="sm" variant="flat" color="warning">{c.rating} / 5</Chip>
                        )}
                        <Button
                          color="danger"
                          variant="flat"
                          size="sm"
                          isDisabled={isDeleting === c.id}
                          onPress={() => confirmAndDelete(c.id)}
                          startContent={<Trash2 className="h-4 w-4" />}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">{c.content}</p>
                    <div className="mt-2 text-xs text-gray-400">Item ID: {c.itemId}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 flex items-center justify-between">
              <Button
                variant="bordered"
                onPress={() => {
                  const next = Math.max(1, page - 1);
                  setPage(next);
                  fetchComments(next);
                }}
                isDisabled={page <= 1}
              >
                Previous
              </Button>
              <div className="text-sm text-gray-500">Page {page} of {totalPages}</div>
              <Button
                variant="bordered"
                onPress={() => {
                  const next = Math.min(totalPages, page + 1);
                  setPage(next);
                  fetchComments(next);
                }}
                isDisabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}


