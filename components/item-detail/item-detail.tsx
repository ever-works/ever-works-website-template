import { ItemBreadcrumb } from "./breadcrumb";
import { ItemIcon } from "./item-icon";
import { ItemContent } from "./item-content";

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
  const tagNames = Array.isArray(meta.tags)
    ? meta.tags.map((tag) => (typeof tag === "string" ? tag : tag.name))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black text-gray-800 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="mb-8">
              <div className="mb-6">
                <ItemBreadcrumb
                  name={meta.name}
                  category={meta.category}
                  categoryName={categoryName}
                />
              </div>

              <div className="flex items-center gap-5 mb-6">
                <div className="relative">
                  <ItemIcon iconUrl={meta.icon_url} name={meta.name} />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {meta.name}
                </h1>
              </div>

              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-3xl">
                {meta.description}
              </p>

              <div className="flex items-center space-x-4 mb-10">
                <a
                  href={meta.source_url}
                  className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg font-medium transition-all duration-200  -md hover: -lg transform hover:-translate-y-0.5 dark: -indigo-900/30"
                >
                  <span className="mr-2">🌐</span> Visit Website
                </a>
                <button className="inline-flex items-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-all duration-200 border border-gray-300 dark:border-gray-800 hover:border-indigo-500/50 dark:hover:border-indigo-700/50">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path>
                  </svg>
                  Save
                </button>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-gray-900/80 rounded-xl p-6 mb-8   border border-gray-200 dark:border-gray-800 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-70 backdrop-filter">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-indigo-400"
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
                Introduction
              </h2>
              <div className="prose prose-invert prose-lg max-w-none">
                <ItemContent
                  content={content}
                  noContentMessage={noContentMessage}
                />
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:w-96 space-y-6">
            <div className="bg-white/90 dark:bg-gray-900/80 rounded-xl p-6   border border-gray-200 dark:border-gray-800 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-70 backdrop-filter">
              <h2 className="text-xl font-bold mb-5 text-gray-800 dark:text-white flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-indigo-400"
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
                Information
              </h2>
              <div className="space-y-4 divide-y divide-gray-200 dark:divide-gray-800">
                <div className="flex justify-between items-center pb-3">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">
                    Publisher
                  </span>
                  <span className="flex items-center bg-gray-100 dark:bg-black px-3 py-1 rounded-full border border-gray-200 dark:border-gray-800  ">
                    <span className="w-4 h-4 rounded-full bg-orange-500 dark:bg-orange-600 mr-2"></span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      Fox
                    </span>
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">
                    Website
                  </span>
                  <a
                    href={meta.source_url}
                    className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200 transition-colors duration-200 font-medium"
                  >
                    {meta.source_url
                      ? new URL(meta.source_url).hostname
                      : "N/A"}
                  </a>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">
                    Published
                  </span>
                  <span className="bg-gray-100 dark:bg-black px-3 py-1 rounded-full font-medium border border-gray-200 dark:border-gray-800   text-gray-800 dark:text-white">
                    {meta.updated_at
                      ? new Date(meta.updated_at).toLocaleDateString("fr-FR")
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-gray-900/80 rounded-xl p-6   border border-gray-200 dark:border-gray-800 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-70 backdrop-filter">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-black dark:text-white flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    ></path>
                  </svg>
                  Categories
                </h2>
                <span className="text-xs text-gray-500 bg-gray-100 dark:text-gray-400 dark:bg-gray-800 px-2 py-1 rounded-full">
                  1 item
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`/category/${meta.category}`}
                  className="px-4 py-2 bg-white hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg text-sm font-medium flex items-center group border border-gray-200 dark:border-gray-700 hover:border-indigo-500"
                >
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2 group-hover:scale-125 transition-transform duration-200"></span>
                  {categoryName}
                </a>
              </div>
            </div>

            <div className="bg-dark--theme-50 dark:bg-gray-900/80 rounded-xl p-6   border border-gray-200 dark:border-gray-800 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-70 backdrop-filter">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-indigo-400"
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
                  Tags
                </h2>
                <span className="text-xs text-gray-400 bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-full">
                  {tagNames.length} items
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {tagNames.length > 0 ? (
                  tagNames.map((tag, index) => (
                    <a
                      key={index}
                      href={`/tag/${tag}`}
                      className="px-4 py-2 bg-white hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg text-sm font-medium flex items-center group border border-gray-200 dark:border-gray-700 hover:border-indigo-500"
                    >
                      <span className="mr-1.5 text-indigo-400 group-hover:text-indigo-300 transition-colors duration-200">
                        #
                      </span>
                      <span>{tag}</span>
                    </a>
                  ))
                ) : (
                  <span className="text-gray-500 dark:text-gray-400 text-sm italic px-3 py-2 bg-gray-900 dark:bg-black rounded-lg w-full text-center">
                    No tags available
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
