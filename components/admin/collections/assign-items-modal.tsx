"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input, Checkbox } from "@heroui/react";
import { Search, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { UniversalPagination } from "@/components/universal-pagination";
import { useAdminItems } from "@/hooks/use-admin-items";
import { Button } from "@/components/ui/button";

interface AssignItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionName: string;
  initialSelected: string[]; // Array of item slugs
  onSave: (itemSlugs: string[]) => Promise<void>;
}

export function AssignItemsModal({ isOpen, onClose, collectionName, initialSelected, onSave }: AssignItemsModalProps) {
  const PageSize = 50;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelected));
  const [saving, setSaving] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  const { items, total, totalPages, isLoading, isSubmitting, refetch } = useAdminItems({ page, limit: PageSize, search });

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set(initialSelected));
    }
  }, [initialSelected, isOpen]);

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, page, search, refetch]);

  const selectedCount = useMemo(() => selectedIds.size, [selectedIds]);

  const toggleSelection = (slug: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(Array.from(selectedIds));
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save items";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" title={`Assign items to ${collectionName}`}> 
      <ModalContent>
        <ModalHeader>
          <div className="flex w-full items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Assign items</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Select which items belong to this collection.</p>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {selectedCount} selected
            </span>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <Input
                placeholder="Search items"
                startContent={<Search size={16} />}
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                className="sm:w-80"
              />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {items.length} of {total} items
              </div>
            </div>

            <div
              ref={listRef}
              className="border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-100 dark:divide-gray-800 max-h-[420px] overflow-auto"
            >
              {isLoading ? (
                <div className="p-6 text-center text-sm text-gray-500">Loading items…</div>
              ) : items.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500">No items found.</div>
              ) : (
                items.map((item) => (
                  <label
                    key={item.slug}
                    className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                  >
                    <Checkbox
                      isSelected={selectedIds.has(item.slug)}
                      onValueChange={() => toggleSelection(item.slug)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white truncate">{item.name}</span>
                        <span className="text-xs text-gray-500">{item.status}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{item.slug}</p>
                    </div>
                  </label>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div className="pt-2">
                <UniversalPagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={(next) => {
                    setPage(next);
                    const target = listRef.current;
                    if (target) {
                      target.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                />
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <div className="flex w-full justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex items-center gap-2"
              disabled={saving || isSubmitting}
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={handleSave}
              className="flex items-center gap-2 bg-linear-to-r from-theme-primary to-theme-accent text-white"
              disabled={saving || isSubmitting}
            >
              <Save className="h-4 w-4" />
              Save changes
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
