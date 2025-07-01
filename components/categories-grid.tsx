import { Category } from "@/lib/content";
import LayoutGrid from "@/components/layouts/LayoutGrid";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { FiFolder } from "react-icons/fi";
import React, { useState } from "react";
import { Pagination, cn } from "@heroui/react";

const PAGE_SIZE = 10;

export default function CategoriesGrid({ categories }: { categories: Category[] }) {
  // Sort categories by count descending (most items first)
  const sortedCategories = [...categories].sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(sortedCategories.length / PAGE_SIZE);
  const pagedCategories = sortedCategories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <LayoutGrid>
        {pagedCategories.map((category) => (
          <Link
            href={`/categories/category/${category.id}`}
            key={category.id}
            className="focus:outline-none focus:ring-2 focus:ring-theme-primary rounded-lg transition group"
          >
            <Card
              className="group relative border-0 rounded-lg transition-all duration-700 transform hover:-translate-y-2 backdrop-blur-xl overflow-hidden h-full
                bg-white/80 dark:bg-gray-900/80 shadow-lg hover:shadow-2xl
                ring-1 ring-gray-200/50 dark:ring-gray-700/50 hover:ring-theme-primary/70
                before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-gray-50/40
                dark:before:from-gray-800/60 dark:before:via-transparent dark:before:to-gray-900/40
                hover:before:from-blue-50/30 hover:before:to-purple-50/20 dark:hover:before:from-blue-900/20 dark:hover:before:to-purple-900/10
                px-6 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10
              "
            >
              {/* Subtle background pattern */}
              <div
                className="absolute inset-0 opacity-10 dark:opacity-20"
                style={{
                  backgroundImage:
                    "url('data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 0h40v40H0V0zm1 1h38v38H1V1z\' /%3E%3C/g%3E%3C/svg%3E')",
                }}
              />
              {/* Icon with animated background */}
              <div className="relative flex flex-col items-center justify-center pt-2 pb-4">
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 flex items-center justify-center rounded-lg transition-all duration-500 bg-gradient-to-br from-theme-primary-10 to-indigo-100 border border-theme-primary-500 group-hover:from-theme-primary-10 group-hover:to-indigo-200 dark:from-theme-primary-10 dark:to-indigo-900/30 dark:border-theme-primary-700/30 dark:group-hover:from-theme-primary-800/40 dark:group-hover:to-indigo-800/40 group-hover:scale-110 group-hover:rotate-3 shadow-sm group-hover:shadow-md">
                    {category.icon_url ? (
                      <Image
                        src={category.icon_url}
                        alt={category.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 object-contain transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <FiFolder className="w-8 h-8 text-theme-primary dark:text-theme-primary transition-transform duration-500 group-hover:scale-110" />
                    )}
                  </div>
                  {/* Pulse effect */}
                  <div className="absolute inset-0 rounded-lg bg-theme-primary-10 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300" />
                </div>
              </div>
              <CardHeader className="items-center text-center p-0 mb-3">
                <CardTitle className="text-lg font-semibold group-hover:text-theme-primary transition-colors mb-1">
                  {category.name}
                </CardTitle>
              </CardHeader>
              {category.count !== undefined && (
                <CardContent className="text-xs text-gray-500 dark:text-gray-400 p-0 mb-1">
                  {category.count} items
                </CardContent>
              )}
              {/* Enhanced hover indicator */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0">
                <div className="w-8 h-8 rounded-full bg-theme-primary-500/10 dark:bg-theme-primary-400/10 flex items-center justify-center backdrop-blur-sm border border-theme-primary-10 dark:border-theme-primary">
                  <svg className="w-4 h-4 text-theme-primary-600 dark:text-theme-primary-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 7l-10 10M7 7h10v10" /></svg>
                </div>
              </div>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            </Card>
          </Link>
        ))}
      </LayoutGrid>
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-6 mt-16 mb-12">
          {/* Page info */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page <span className="font-semibold text-theme-primary dark:text-theme-primary">{page}</span> of <span className="font-semibold text-theme-primary dark:text-theme-primary">{totalPages}</span>
            </p>
          </div>
          {/* Enhanced Pagination */}
          <div className="relative group">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-primary-600/5 to-primary-500/10 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
            <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-2 shadow-lg hover:shadow-xl transition-all duration-300 dark:shadow-lg dark:shadow-theme-primary-500/20 dark:shadow-theme-primary-500/20">
              <Pagination
                showControls
                total={totalPages}
                page={page}
                onChange={handlePageChange}
                radius="lg"
                size="lg"
                classNames={{
                  wrapper: "flex justify-center items-center gap-2",
                  item: cn(
                    "min-w-10 h-10 text-sm font-medium transition-all duration-300 ease-out",
                    "bg-transparent hover:bg-theme-primary hover:bg-theme-primary hover:to-theme-primary",
                    "dark:hover:bg-theme-primary dark:hover:to-theme-primary",
                    "text-gray-700 dark:text-gray-300 hover:text-theme-primary dark:hover:text-theme-primary",
                    "border border-transparent hover:border-theme-primary dark:hover:border-theme-primary",
                    "hover:shadow-md hover:scale-105 active:scale-95",
                    "data-[hover=true]:bg-theme-primary data-[hover=true]:bg-theme-primary data-[hover=true]:bg-theme-primary",
                    "dark:data-[hover=true]:bg-theme-primary dark:data-[hover=true]:bg-theme-primary",
                    "cursor-pointer relative overflow-hidden"
                  ),
                  cursor: cn(
                    "bg-theme-primary text-white font-semibold",
                    "shadow-lg shadow-theme-primary dark:shadow-theme-primary",
                    "border-2 border-theme-primary dark:border-theme-primary",
                    "relative overflow-hidden"
                  ),
                  prev: cn(
                    "min-w-10 h-10 font-medium transition-all duration-300",
                    " from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700",
                    "text-gray-600 dark:text-gray-300 hover:text-theme-primary dark:hover:text-theme-primary",
                    "border border-gray-200 dark:border-gray-600 hover:border-theme-primary dark:hover:border-theme-primary",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  ),
                  next: cn(
                    "min-w-10 h-10 font-medium transition-all duration-300",
                    " from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700",
                    "text-gray-600 dark:text-gray-300 hover:text-theme-primary dark:hover:text-theme-primary",
                    "border border-gray-200 dark:border-gray-600 hover:border-theme-primary  dark:hover:border-theme-primary",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  ),
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
} 