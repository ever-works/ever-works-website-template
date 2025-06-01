"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PricingPlan } from "@/components/pricing/plan-card";
import { Check, ArrowLeft, ArrowRight, Sparkles, Tag, Link, Type, FileText, Grid3X3, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormData {
  name: string;
  link: string;
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
  const [formData, setFormData] = useState<FormData>({
    name: "",
    link: "",
    category: "",
    tags: [],
    description: "",
    introduction: "",
    ...initialData,
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set());

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Track completed fields
    if (value.trim()) {
      setCompletedFields(prev => new Set([...prev, name]));
    } else {
      setCompletedFields(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(name);
        return newSet;
      });
    }
  };

  const handleTagToggle = (tag: string) => {
    setFormData((prev) => {
      const currentTags = [...prev.tags];
      if (currentTags.includes(tag)) {
        return { ...prev, tags: currentTags.filter((t) => t !== tag) };
      } else {
        return { ...prev, tags: [...currentTags, tag] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getStepNumber = () => selectedPlan === "free" ? 1 : 2;
  const requiredFieldsCount = 4; // name, link, category, description
  const completedRequiredFields = ['name', 'link', 'category', 'description'].filter(field => 
    formData[field]?.toString().trim()
  ).length;
  const progressPercentage = (completedRequiredFields / requiredFieldsCount) * 100;

  return (
    <div >
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs matching other sections */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-600/20 dark:to-purple-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-600/20 dark:to-pink-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-600/20 dark:to-cyan-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Additional floating elements */}
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 dark:from-yellow-400/30 dark:to-orange-400/30 rounded-full blur-lg animate-float"></div>
        <div className="absolute bottom-1/3 left-1/3 w-24 h-24 bg-gradient-to-r from-green-500/15 to-blue-500/15 dark:from-green-400/25 dark:to-blue-400/25 rounded-full blur-xl animate-float-slower"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 max-w-4xl">
        {/* Enhanced Header Section */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 mb-6 shadow-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Step {getStepNumber()} of 3 · Product Details
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Tell Us About Your Product
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Share the details that will help users discover and understand your amazing product
          </p>
        </div>

        {/* Enhanced Progress Section */}
        <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Form Completion
                </span>
              </div>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {completedRequiredFields}/{requiredFieldsCount} required fields
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
          <div className="relative group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-400/30 dark:to-purple-400/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <Type className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Basic Information
                </h3>
              </div>

              <div className="grid gap-8">
                {/* Product Name */}
                <div className="space-y-3">
                  <label htmlFor="name" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Product Name *
                  </label>
                  <div className="relative">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Enter your amazing product name"
                      required
                      className={cn(
                        "w-full h-14 px-6 pr-14 text-lg bg-gray-50/80 dark:bg-gray-900/50 border-2 border-gray-200/60 dark:border-gray-600/50 rounded-2xl transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 hover:border-gray-300 dark:hover:border-gray-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400",
                        focusedField === 'name' && "scale-[1.02] shadow-xl ring-4 ring-blue-500/20",
                        completedFields.has('name') && "border-green-500/70 bg-green-50/40 dark:bg-green-900/20 ring-2 ring-green-500/20"
                      )}
                    />
                    {completedFields.has('name') && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center animate-scale-in">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Link */}
                <div className="space-y-3">
                  <label htmlFor="link" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Product Link *
                  </label>
                  <div className="relative">
                    <input
                      id="link"
                      name="link"
                      type="url"
                      value={formData.link}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('link')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="https://yourproduct.com"
                      pattern="https?://.*"
                      required
                      className={cn(
                        "w-full h-14 px-6 pr-14 text-lg bg-gray-50/80 dark:bg-gray-900/50 border-2 border-gray-200/60 dark:border-gray-600/50 rounded-2xl transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 hover:border-gray-300 dark:hover:border-gray-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400",
                        focusedField === 'link' && "scale-[1.02] shadow-xl ring-4 ring-blue-500/20",
                        completedFields.has('link') && "border-green-500/70 bg-green-50/40 dark:bg-green-900/20 ring-2 ring-green-500/20"
                      )}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-3">
                      {completedFields.has('link') && (
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center animate-scale-in">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <Link className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-3">
                  <label htmlFor="category" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Category *
                  </label>
                  <div className="relative">
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('category')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={cn(
                        "w-full h-14 px-6 pr-14 text-lg bg-gray-50/80 dark:bg-gray-900/50 border-2 border-gray-200/60 dark:border-gray-600/50 rounded-2xl transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 hover:border-gray-300 dark:hover:border-gray-500 appearance-none cursor-pointer outline-none text-gray-900 dark:text-white",
                        focusedField === 'category' && "scale-[1.02] shadow-xl ring-4 ring-blue-500/20",
                        completedFields.has('category') && "border-green-500/70 bg-green-50/40 dark:bg-green-900/20 ring-2 ring-green-500/20"
                      )}
                    >
                      <option value="" disabled className="text-gray-500">
                        Select a category for your product
                      </option>
                      {CATEGORIES.map((category) => (
                        <option key={category} value={category} className="py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                          {category}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-3 pointer-events-none">
                      {completedFields.has('category') && (
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
          <div className="relative group animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 dark:from-purple-400/30 dark:to-pink-400/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Tag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Tags & Labels
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Select relevant tags to help users find your product
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
                      Selected Tags ({formData.tags.length})
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
          <div className="relative group animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 dark:from-green-400/30 dark:to-emerald-400/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Product Description
                </h3>
              </div>

              <div className="grid gap-8">
                {/* Short Description */}
                <div className="space-y-3">
                  <label htmlFor="description" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Short Description *
                  </label>
                  <div className="relative">
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('description')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="A compelling description that captures what makes your product special (max 150 characters)"
                      maxLength={150}
                      required
                      rows={3}
                      className={cn(
                        "w-full px-6 py-4 text-lg bg-gray-50/80 dark:bg-gray-900/50 border-2 border-gray-200/60 dark:border-gray-600/50 rounded-2xl transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 hover:border-gray-300 dark:hover:border-gray-500 resize-none outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400",
                        focusedField === 'description' && "scale-[1.02] shadow-xl ring-4 ring-blue-500/20",
                        completedFields.has('description') && "border-green-500/70 bg-green-50/40 dark:bg-green-900/20 ring-2 ring-green-500/20"
                      )}
                    />
                    <div className="absolute top-4 right-4 flex items-center gap-3">
                      {completedFields.has('description') && (
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
                  <label htmlFor="introduction" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Detailed Introduction
                  </label>
                  <div className="relative">
                    <textarea
                      id="introduction"
                      name="introduction"
                      value={formData.introduction}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('introduction')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Tell the full story of your product. What problem does it solve? What makes it unique? How does it help users?"
                      rows={6}
                      className={cn(
                        "w-full px-6 py-4 text-lg bg-gray-50/80 dark:bg-gray-900/50 border-2 border-gray-200/60 dark:border-gray-600/50 rounded-2xl transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 hover:border-gray-300 dark:hover:border-gray-500 resize-none outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400",
                        focusedField === 'introduction' && "scale-[1.02] shadow-xl ring-4 ring-blue-500/20",
                        formData.introduction.trim() && "border-green-500/70 bg-green-50/40 dark:bg-green-900/20 ring-2 ring-green-500/20"
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
                    Markdown formatting supported for rich text styling
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pt-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onBack}
              className="h-14 px-8 rounded-2xl border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl text-lg font-semibold"
            >
              <ArrowLeft className="w-5 h-5 mr-3" />
              Go Back
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
                <span>Continue to Next Step</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
