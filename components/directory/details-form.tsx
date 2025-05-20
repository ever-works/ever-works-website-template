"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PricingPlan } from "@/components/pricing/plan-card";

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
  "Other"
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
  "Business Tools"
];

export function DetailsForm({
  initialData = {},
  selectedPlan,
  onSubmit,
  onBack
}: DetailsFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    link: "",
    category: "",
    tags: [],
    description: "",
    introduction: "",
    ...initialData
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => {
      const currentTags = [...prev.tags];
      if (currentTags.includes(tag)) {
        return { ...prev, tags: currentTags.filter(t => t !== tag) };
      } else {
        return { ...prev, tags: [...currentTags, tag] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {selectedPlan === "free" ? "1" : "2"} / 3 · Product details
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="block font-medium">
            Product Name *
          </label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Your product name"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="link" className="block font-medium">
            Product Link *
          </label>
          <Input
            id="link"
            name="link"
            value={formData.link}
            onChange={handleInputChange}
            placeholder="https://yourproduct.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="block font-medium">
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="" disabled>
              Select a category
            </option>
            {CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block font-medium">Tags</label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 text-sm rounded-full ${
                  formData.tags.includes(tag)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block font-medium">
            Short Description *
          </label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="A brief description of your product (max 150 characters)"
            maxLength={150}
            required
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="introduction" className="block font-medium">
            Introduction
          </label>
          <Textarea
            id="introduction"
            name="introduction"
            value={formData.introduction}
            onChange={handleInputChange}
            placeholder="A more detailed introduction to your product"
            rows={6}
          />
          <p className="text-xs text-muted-foreground">
            You can use Markdown for formatting
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>

        <Button type="submit">
          Continue
        </Button>
      </div>
    </form>
  );
}
