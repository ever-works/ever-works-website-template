"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PricingPlan } from "@/components/pricing/plan-card";
import {
  Check,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Tag,
  Type,
  FileText,
  Grid3X3,
  Star,
  Plus,
  X,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ProductLink {
  id: string;
  url: string;
  label: string;
  type: "main" | "secondary";
  icon?: string;
}

interface FormData {
  name: string;
  link: string;
  links: ProductLink[];
  category: string;
  tags: string[];
  description: string;
  introduction: string;
  [key: string]: any;
}

interface DetailsFormProps {
  initialData?: Partial<FormData>;
  selectedPlan: PricingPlan | null;
  onSubmit: (data: FormData) => void;
  onBack: () => void;
}

const CATEGORIES = [
  "AI Tools",
  "Analytics",
  "API",
  "Automation",
  "Business",
  "Content",
  "Design",
  "Development",
  "E-commerce",
  "Education",
  "Finance",
  "Health",
  "Marketing",
  "Productivity",
  "Security",
  "Social",
  "Other",
];

const TAGS = [
  "Free",
  "Paid",
  "Open Source",
  "SaaS",
  "Mobile",
  "Desktop",
  "Web",
  "API",
  "AI",
  "Machine Learning",
  "Automation",
  "No-Code",
  "Low-Code",
  "Developer Tools",
  "Business Tools",
];

export function DetailsForm({
  initialData = {},
  selectedPlan,
  onSubmit,
  onBack,
}: DetailsFormProps) {
  const t = useTranslations("directory");
  const [formData, setFormData] = useState<FormData>(() => {
    const defaultData = {
      name: "",
      link: "",
      links: [
        {
          id: "main-link",
          url: "",
          label: "Main Website",
          type: "main" as const,
          icon: "Globe",
        },
      ],
      category: "",
      tags: [],
      description: "",
      introduction: "",
    };

    // Merge with initialData and sync link field with main link
    const mergedData = { ...defaultData, ...initialData };

    // If initialData has a link field, sync it with the main link
    if (initialData.link && mergedData.links[0]) {
      mergedData.links[0].url = initialData.link;
    }

    // Ensure link field is synced with main link URL
    const mainLink = mergedData.links.find((l) => l.type === "main");
    mergedData.link = mainLink?.url || "";

    return mergedData;
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [completedFields, setCompletedFields] = useState<Set<string>>(
    new Set()
  );
  const [animatingLinkId, setAnimatingLinkId] = useState<string | null>(null);

  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Track completed fields with debouncing
      if (value.trim()) {
        setCompletedFields((prev) => new Set([...prev, name]));
      } else {
        setCompletedFields((prev) => {
          const newSet = new Set([...prev]);
          newSet.delete(name);
          return newSet;
        });
      }
    },
    []
  );

  const handleLinkChange = useCallback(
    (id: string, field: "url" | "label", value: string) => {
      setFormData((prev) => {
        const updatedLinks = prev.links.map((link) =>
          link.id === id ? { ...link, [field]: value } : link
        );

        // Sync main link URL with backward compatibility field
        const mainLink = updatedLinks.find((l) => l.type === "main");
        // const syncedLink = field === 'url' && mainLink?.id === id ? value : prev.link;

        return {
          ...prev,
          links: updatedLinks,
          link: mainLink?.url || "", // Always sync with main link URL
        };
      });

      // Track main link completion
      const mainLink = formData.links.find((l) => l.type === "main");
      if (mainLink?.id === id && field === "url") {
        if (value.trim()) {
          setCompletedFields((prev) => new Set([...prev, "mainLink"]));
        } else {
          setCompletedFields((prev) => {
            const newSet = new Set([...prev]);
            newSet.delete("mainLink");
            return newSet;
          });
        }
      }
    },
    [formData.links]
  );

  const addLink = useCallback(() => {
    const newId = `link-${Date.now()}`;
    setAnimatingLinkId(newId);

    setFormData((prev) => ({
      ...prev,
      links: [
        ...prev.links,
        {
          id: newId,
          url: "",
          label: "Additional Link",
          type: "secondary" as const,
          icon: "Globe",
        },
      ],
    }));
    setTimeout(() => setAnimatingLinkId(null), 500);
  }, []);

  const removeLink = useCallback(
    (id: string) => {
      const linkToRemove = formData.links.find((l) => l.id === id);
      if (linkToRemove?.type === "main") return; // Don't remove main link

      setAnimatingLinkId(id);

      // Delay removal for exit animation
      setTimeout(() => {
        setFormData((prev) => ({
          ...prev,
          links: prev.links.filter((link) => link.id !== id),
        }));
        setAnimatingLinkId(null);
      }, 300);
    },
    [formData.links]
  );

  const handleTagToggle = useCallback((tag: string) => {
    setFormData((prev) => {
      const currentTags = [...prev.tags];
      if (currentTags.includes(tag)) {
        return { ...prev, tags: currentTags.filter((t) => t !== tag) };
      } else {
        return { ...prev, tags: [...currentTags, tag] };
      }
    });
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const mainLink = formData.links.find((l) => l.type === "main");
      const transformedData = {
        ...formData,
        link: mainLink?.url || "",
        links: formData.links,
      };

      onSubmit(transformedData);
    },
    [formData, onSubmit]
  );

  // Memoized calculations
  const stepNumber = useMemo(
    () => (selectedPlan === "free" ? 1 : 2),
    [selectedPlan]
  );
  const { progressPercentage, completedRequiredFields, requiredFieldsCount } =
    useMemo(() => {
      const required = 4; // name, mainLink, category, description
      const completed = ["name", "mainLink", "category", "description"].filter(
        (field) => {
          if (field === "mainLink") {
            return formData.links.find((l) => l.type === "main")?.url?.trim();
          }
          return formData[field] && formData[field].toString().trim();
        }
      ).length;

      return {
        requiredFieldsCount: required,
        completedRequiredFields: completed,
        progressPercentage: (completed / required) * 100,
      };
    }, [formData]);

  const getIconComponent = () => {
    return Globe; // Simplified to always use Globe icon
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Advanced gradient orbs with better positioning */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 dark:from-blue-600/20 dark:via-purple-600/20 dark:to-cyan-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 dark:from-purple-600/20 dark:via-pink-600/20 dark:to-orange-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/4 w-96 h-96 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-indigo-500/10 dark:from-green-600/20 dark:via-blue-600/20 dark:to-indigo-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

        {/* Floating geometric elements */}
        <div className="absolute top-1/4 right-1/4 w-20 h-20 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 dark:from-yellow-400/30 dark:to-orange-400/30 rounded-2xl rotate-45 blur-lg animate-float"></div>
        <div className="absolute bottom-1/3 left-1/5 w-16 h-16 bg-gradient-to-r from-green-400/20 to-blue-400/20 dark:from-green-400/30 dark:to-blue-400/30 rounded-full blur-lg animate-float-slower"></div>
        <div className="absolute top-2/3 right-1/3 w-12 h-12 bg-gradient-to-r from-pink-400/20 to-purple-400/20 dark:from-pink-400/30 dark:to-purple-400/30 rounded-lg rotate-12 blur-sm animate-pulse"></div>
      </div>

      <div className="relative z-10 container max-w-7xl px-6 py-12">
        {/* Enhanced Header Section */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 mb-6 shadow-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t("DETAILS_FORM.STEP_INDICATOR", { step: stepNumber })}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {t("DETAILS_FORM.TITLE")}
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {t("DETAILS_FORM.DESCRIPTION")}
          </p>
        </div>

        {/* Enhanced Progress Section */}
        <div
          className="mb-12 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t("DETAILS_FORM.FORM_COMPLETION")}
                </span>
              </div>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {t("DETAILS_FORM.REQUIRED_FIELDS", {
                  completed: completedRequiredFields,
                  total: requiredFieldsCount,
                })}
              </span>
            </div>

            <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-full transition-all duration-700 ease-out shadow-lg"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 rounded-full animate-shimmer"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div
            className="relative group animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-400/30 dark:to-purple-400/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <Type className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t("DETAILS_FORM.BASIC_INFORMATION")}
                </h3>
              </div>

              <div className="grid gap-8">
                {/* Product Name */}
                <div className="space-y-3">
                  <label
                    htmlFor="name"
                    className="block text-sm font-bold text-gray-700 dark:text-gray-300"
                  >
                    {t("DETAILS_FORM.PRODUCT_NAME")} *
                  </label>
                  <div className="relative">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      placeholder={t("DETAILS_FORM.PRODUCT_NAME_PLACEHOLDER")}
                      required
                      className={cn(
                        "w-full h-14 px-6 pr-14 text-lg bg-gray-50/80 dark:bg-gray-900/50 border-2 border-gray-200/60 dark:border-gray-600/50 rounded-2xl transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 hover:border-gray-300 dark:hover:border-gray-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400",
                        focusedField === "name" &&
                          "scale-[1.02] shadow-xl ring-4 ring-blue-500/20",
                        completedFields.has("name") &&
                          "border-green-500/70 bg-green-50/40 dark:bg-green-900/20 ring-2 ring-green-500/20"
                      )}
                    />
                    {completedFields.has("name") && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center animate-scale-in">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Links */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                      {t("DETAILS_FORM.PRODUCT_LINK")} *
                    </label>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formData.links.length} {t("DETAILS_FORM.LINKS_ADDED")}
                    </div>
                  </div>

                  {/* Links Container */}
                  <div className="space-y-4">
                    {formData.links.map((link, index) => {
                      const IconComponent = getIconComponent();
                      const isAnimating = animatingLinkId === link.id;
                      const isMain = link.type === "main";

                      return (
                        <div
                          key={index}
                          className={cn(
                            "group relative overflow-hidden rounded-2xl border-2",
                            isMain
                              ? "border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10"
                              : "border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50",
                            isAnimating && "animate-pulse",
                            "hover:border-blue-300 dark:hover:border-blue-600"
                          )}
                        >
                          {/* Link Type Badge */}
                          {isMain && (
                            <div className="absolute top-3 right-3 z-10">
                              <div className="px-2 py-1 text-xs font-semibold bg-blue-500 text-white rounded-full">
                                {t("DETAILS_FORM.PRIMARY_BADGE")}
                              </div>
                            </div>
                          )}

                          <div className="p-4 space-y-3">
                            {/* Link Label Row */}
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 dark:group-hover:from-blue-900 dark:group-hover:to-blue-800 transition-all duration-300">
                                <IconComponent className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                              </div>

                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={link.label}
                                  onChange={(e) =>
                                    handleLinkChange(
                                      link.id,
                                      "label",
                                      e.target.value
                                    )
                                  }
                                  placeholder={
                                    isMain
                                      ? t("DETAILS_FORM.MAIN_WEBSITE_LABEL")
                                      : t("DETAILS_FORM.LINK_LABEL_PLACEHOLDER")
                                  }
                                  className="w-full h-10 px-3 text-sm font-medium bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                />
                              </div>

                              {!isMain && (
                                <button
                                  type="button"
                                  onClick={() => removeLink(link.id)}
                                  className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200 opacity-0 group-hover:opacity-100 flex items-center justify-center"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>

                            {/* URL Input */}
                            <div className="relative">
                              <input
                                type="url"
                                value={link.url}
                                onChange={(e) =>
                                  handleLinkChange(
                                    link.id,
                                    "url",
                                    e.target.value
                                  )
                                }
                                onFocus={() =>
                                  setFocusedField(`link-${link.id}`)
                                }
                                onBlur={() => setFocusedField(null)}
                                placeholder={
                                  isMain
                                    ? t("DETAILS_FORM.MAIN_WEBSITE_PLACEHOLDER")
                                    : t(
                                        "DETAILS_FORM.ADDITIONAL_LINK_PLACEHOLDER"
                                      )
                                }
                                pattern="^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)$"
                                required={isMain}
                                className={cn(
                                  "w-full h-12 px-4 pr-12 text-base bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl transition-all duration-300 outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400",
                                  focusedField === `link-${link.id}` &&
                                    "border-blue-500 dark:border-blue-400 ring-4 ring-blue-500/20 scale-[1.01]",
                                  isMain &&
                                    completedFields.has("mainLink") &&
                                    "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20",
                                  "focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20"
                                )}
                              />

                              {/* Validation Icon */}
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                {isMain && completedFields.has("mainLink") && (
                                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center animate-scale-in">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                )}
                                {link.url &&
                                  !link.url.match(/^https?:\/\//) && (
                                    <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                                      <span className="text-white text-xs">
                                        !
                                      </span>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>

                          {/* Hover Effect Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Link Section */}
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={addLink}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <Plus className="w-4 h-4" />
                      {t("DETAILS_FORM.ADD_MORE_LINKS")}
                    </button>
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-3">
                  <label
                    htmlFor="category"
                    className="block text-sm font-bold text-gray-700 dark:text-gray-300"
                  >
                    {t("DETAILS_FORM.CATEGORY")} *
                  </label>
                  <div className="relative">
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("category")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={cn(
                        "w-full h-14 px-6 pr-14 text-lg bg-gray-50/80 dark:bg-gray-900/50 border-2 border-gray-200/60 dark:border-gray-600/50 rounded-2xl transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 hover:border-gray-300 dark:hover:border-gray-500 appearance-none cursor-pointer outline-none text-gray-900 dark:text-white",
                        focusedField === "category" &&
                          "scale-[1.02] shadow-xl ring-4 ring-blue-500/20",
                        completedFields.has("category") &&
                          "border-green-500/70 bg-green-50/40 dark:bg-green-900/20 ring-2 ring-green-500/20"
                      )}
                    >
                      <option value="" disabled className="text-gray-500">
                        {t("DETAILS_FORM.CATEGORY_PLACEHOLDER")}
                      </option>
                      {CATEGORIES.map((category) => (
                        <option
                          key={category}
                          value={category}
                          className="py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          {category}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-3 pointer-events-none">
                      {completedFields.has("category") && (
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center animate-scale-in">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <Grid3X3 className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div
            className="relative group animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 dark:from-purple-400/30 dark:to-pink-400/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Tag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t("DETAILS_FORM.TAGS_LABELS")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t("DETAILS_FORM.TAGS_DESCRIPTION")}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 border-2",
                      formData.tags.includes(tag)
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-purple-600"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {formData.tags.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      {t("DETAILS_FORM.SELECTED_TAGS", {
                        count: formData.tags.length,
                      })}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-xs font-medium bg-blue-500 text-white rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div
            className="relative group animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 dark:from-green-400/30 dark:to-emerald-400/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t("DETAILS_FORM.PRODUCT_DESCRIPTION")}
                </h3>
              </div>

              <div className="grid gap-8">
                {/* Short Description */}
                <div className="space-y-3">
                  <label
                    htmlFor="description"
                    className="block text-sm font-bold text-gray-700 dark:text-gray-300"
                  >
                    {t("DETAILS_FORM.SHORT_DESCRIPTION")} *
                  </label>
                  <div className="relative">
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("description")}
                      onBlur={() => setFocusedField(null)}
                      placeholder={t(
                        "DETAILS_FORM.SHORT_DESCRIPTION_PLACEHOLDER"
                      )}
                      maxLength={150}
                      required
                      rows={3}
                      className={cn(
                        "w-full px-6 py-4 text-lg bg-gray-50/80 dark:bg-gray-900/50 border-2 border-gray-200/60 dark:border-gray-600/50 rounded-2xl transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 hover:border-gray-300 dark:hover:border-gray-500 resize-none outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400",
                        focusedField === "description" &&
                          "scale-[1.02] shadow-xl ring-4 ring-blue-500/20",
                        completedFields.has("description") &&
                          "border-green-500/70 bg-green-50/40 dark:bg-green-900/20 ring-2 ring-green-500/20"
                      )}
                    />
                    <div className="absolute top-4 right-4 flex items-center gap-3">
                      {completedFields.has("description") && (
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center animate-scale-in">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-4 right-6 text-xs text-gray-500 dark:text-gray-400">
                      {formData.description.length}/150
                    </div>
                  </div>
                </div>

                {/* Introduction */}
                <div className="space-y-3">
                  <label
                    htmlFor="introduction"
                    className="block text-sm font-bold text-gray-700 dark:text-gray-300"
                  >
                    {t("DETAILS_FORM.DETAILED_INTRODUCTION")}
                  </label>
                  <div className="relative">
                    <textarea
                      id="introduction"
                      name="introduction"
                      value={formData.introduction}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("introduction")}
                      onBlur={() => setFocusedField(null)}
                      placeholder={t(
                        "DETAILS_FORM.DETAILED_INTRODUCTION_PLACEHOLDER"
                      )}
                      rows={6}
                      className={cn(
                        "w-full px-6 py-4 text-lg bg-gray-50/80 dark:bg-gray-900/50 border-2 border-gray-200/60 dark:border-gray-600/50 rounded-2xl transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 hover:border-gray-300 dark:hover:border-gray-500 resize-none outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400",
                        focusedField === "introduction" &&
                          "scale-[1.02] shadow-xl ring-4 ring-blue-500/20",
                        formData.introduction.trim() &&
                          "border-green-500/70 bg-green-50/40 dark:bg-green-900/20 ring-2 ring-green-500/20"
                      )}
                    />
                    {formData.introduction.trim() && (
                      <div className="absolute top-4 right-4">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center animate-scale-in">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <FileText className="w-3 h-3" />
                    {t("DETAILS_FORM.MARKDOWN_SUPPORT")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div
            className="flex flex-col sm:flex-row justify-between gap-6 pt-8 animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="h-14 px-8 rounded-2xl border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl text-lg font-semibold"
            >
              <ArrowLeft className="w-5 h-5 mr-3" />
              {t("DETAILS_FORM.GO_BACK")}
            </Button>

            <Button
              type="submit"
              disabled={completedRequiredFields < requiredFieldsCount}
              className={cn(
                "h-14 px-12 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl min-w-[200px]",
                completedRequiredFields < requiredFieldsCount
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 hover:from-blue-600 hover:via-purple-600 hover:to-blue-700 text-white hover:shadow-blue-500/30"
              )}
            >
              <div className="flex items-center gap-3">
                <span>{t("DETAILS_FORM.CONTINUE_NEXT_STEP")}</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
