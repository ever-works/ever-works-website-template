import { ItemBreadcrumb } from "./breadcrumb";
import { ItemIcon } from "./item-icon";
import { ItemContent } from "./item-content";
import { useTranslations } from "next-intl";
import { slugify } from "@/lib/utils/slug";
import { ShareButton } from "./share-button";

export interface ItemDetailProps {
  meta: {
    name: string;
    description: string;
    category: any;
    icon_url?: string;
    updated_at?: string;
    source_url?: string;
    tags?: Array<string | { name: string; id: string }>;
  };
  content?: string;
  categoryName: string;
  noContentMessage: string;
}

export function ItemDetail({
  meta,
  content,
  categoryName,
  noContentMessage,
}: ItemDetailProps) {
  const t = useTranslations();
  const tagNames = Array.isArray(meta.tags)
    ? meta.tags.map((tag) => (typeof tag === "string" ? tag : tag.name))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 text-gray-800 dark:text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_50%)]"></div>

      <div className="relative z-10 container max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="mb-8">
              <div className="mb-8 transform transition-all duration-500 hover:scale-[1.01]">
                <ItemBreadcrumb
                  name={meta.name}
                  category={meta.category}
                  categoryName={categoryName}
                />
              </div>

              <div className="flex items-center gap-6 mb-8 group">
                <div className="relative transform transition-all duration-300 group-hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative">
                    <ItemIcon iconUrl={meta.icon_url} name={meta.name} />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white dark:border-gray-900 shadow-lg animate-pulse" />
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent tracking-tight leading-tight mb-2">
                    {meta.name}
                  </h1>
                  <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transform transition-all duration-500 group-hover:w-32"></div>
                </div>
              </div>

              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-4xl font-medium">
                {meta.description}
              </p>

              <div className="flex items-center space-x-4 mb-12">
                <a
                  target="_blank"
                  href={meta.source_url}
                  className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-700 dark:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-0.5 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="mr-2 text-lg">🌐</span>
                  <span className="relative">{t("common.VISIT_WEBSITE")}</span>
                </a>
                <button className="group inline-flex items-center px-6 py-3 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  <svg
                    className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:scale-110"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path>
                  </svg>
                  {t("common.SAVE")}
                </button>
                <ShareButton url={meta.source_url || ""} title={meta.name} />
              </div>
            </div>

            <div className="bg-white/95 dark:bg-gray-900/95 rounded-2xl p-8 mb-8 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {t("itemDetail.ABOUT_THIS_TOOL")}
                </h2>
              </div>
              <div className="prose prose-gray dark:prose-invert prose-lg max-w-none">
                <ItemContent
                  content={content}
                  noContentMessage={noContentMessage}
                />
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:w-96 space-y-6">
            <div className="bg-white/95 dark:bg-gray-900/95 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl">
                  <svg
                    className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {t("itemDetail.INFORMATION")}
                </h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/50 transition-all duration-300 group">
                  <span className="text-gray-600 dark:text-gray-300 font-medium flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    {t("itemDetail.PUBLISHER")}
                  </span>
                  <span className="flex items-center bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 px-4 py-2 rounded-full border border-orange-200 dark:border-orange-700/50 group-hover:scale-105 transition-transform duration-300">
                    <span className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 mr-2 animate-pulse"></span>
                    <span className="font-semibold text-orange-700 dark:text-orange-300">
                      Fox
                    </span>
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/50 transition-all duration-300 group">
                  <span className="text-gray-600 dark:text-gray-300 font-medium flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                      />
                    </svg>
                    {t("itemDetail.WEBSITE")}
                  </span>
                  <a
                    href={meta.source_url}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 duration-300 font-semibold hover:underline group-hover:scale-105 transition-transform"
                  >
                    {meta.source_url
                      ? (() => {
                          try {
                            return new URL(meta.source_url).hostname;
                          } catch {
                            return "N/A";
                          }
                        })()
                      : "N/A"}
                  </a>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/50 transition-all duration-300 group">
                  <span className="text-gray-600 dark:text-gray-300 font-medium flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {t("itemDetail.PUBLISHED")}
                  </span>
                  <span className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 px-4 py-2 rounded-full font-semibold border border-green-200 dark:border-green-700/50 text-green-700 dark:text-green-300 group-hover:scale-105 transition-transform duration-300">
                    {meta.updated_at
                      ? new Date(meta.updated_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/95 dark:bg-gray-900/95 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl">
                    <svg
                      className="w-6 h-6 text-purple-600 dark:text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-label={t("listing.CATEGORIES")}
                      role="img"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {t("common.CATEGORY")}
                  </h2>
                </div>
                <span className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full font-semibold border border-purple-200 dark:border-purple-700/50">
                  1 {t("common.ITEM")}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`/categories/${slugify(categoryName)}`}
                  className="group relative lowercase px-5 py-3 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-300 rounded-xl text-sm font-semibold flex items-center border border-purple-200/50 dark:border-purple-700/50 hover:border-purple-300 dark:hover:border-purple-600 transform hover:scale-105 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-200/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3 group-hover:scale-125 transition-transform duration-300 relative z-10" />
                  <span className="text-purple-700 dark:text-purple-300 relative z-10">
                    {categoryName}
                  </span>
                </a>
              </div>
            </div>

            <div className="bg-white/95 dark:bg-gray-900/95 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-xl">
                    <svg
                      className="w-6 h-6 text-cyan-600 dark:text-cyan-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                      ></path>
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {t("listing.TAGS")}
                  </h2>
                </div>
                <span className="text-xs bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 text-cyan-700 dark:text-cyan-300 px-3 py-1 rounded-full font-semibold border border-cyan-200 dark:border-cyan-700/50">
                  {tagNames.length}{" "}
                  {tagNames.length === 1 ? t("common.ITEM") : t("common.ITEMS")}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {tagNames.length > 0 ? (
                  tagNames.map((tag, index) => (
                    <a
                      key={index}
                      href={`/tags/${tag}`}
                      className="group relative px-4 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 dark:from-cyan-900/20 dark:to-blue-900/20 dark:hover:from-cyan-900/30 dark:hover:to-blue-900/30 transition-all duration-300 rounded-lg text-sm font-semibold flex items-center border border-cyan-200/50 dark:border-cyan-700/50 hover:border-cyan-300 dark:hover:border-cyan-600 transform hover:scale-105 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-200/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      <span className="mr-2 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform duration-300 relative z-10">
                        #
                      </span>
                      <span className="text-cyan-700 dark:text-cyan-300 relative z-10">
                        {tag}
                      </span>
                    </a>
                  ))
                ) : (
                  <div className="w-full text-center py-4 sm:py-6 text-gray-500 dark:text-gray-400">
                    <svg
                      className="w-8 h-8 mx-auto mb-3 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                      />
                    </svg>
                    <p className="text-sm italic font-medium">
                      {t("itemDetail.NO_TAGS_AVAILABLE")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
