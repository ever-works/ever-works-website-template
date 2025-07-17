"use client";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FiBriefcase, FiArrowLeft, FiPlus, FiEdit, FiTrash2, FiStar, FiExternalLink } from "react-icons/fi";
import Link from "next/link";
import { dummyPortfolio } from "@/lib/dummy-data";
import React, { useState } from "react";
import Image from "next/image";

export default function PortfolioPage() {
  const [projects, setProjects] = useState<any[]>(dummyPortfolio);

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [tags, setTags] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState("");

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = "Project title is required.";
    if (!imageUrl.trim()) newErrors.imageUrl = "Image URL is required.";
    else if (!isValidUrl(imageUrl.trim())) newErrors.imageUrl = "Please enter a valid image URL.";
    if (!description.trim()) newErrors.description = "Description is required.";
    if (!externalUrl.trim()) newErrors.externalUrl = "Project URL is required.";
    else if (!isValidUrl(externalUrl.trim())) newErrors.externalUrl = "Please enter a valid project URL.";
    return newErrors;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setSuccess("Project added");
    setTitle("");
    setImageUrl("");
    setDescription("");
    setExternalUrl("");
    setTags("");
    setIsFeatured(false);
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
              Portfolio Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              Add, edit, and organize your portfolio projects. Showcase your best work to potential clients and collaborators.
            </p>
          </div>

          {/* Add New Project */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FiPlus className="w-5 h-5 text-theme-primary-500" />
                Add New Project
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Project Title
                    </label>
                    <input
                      id="title"
                      name="title"
                      placeholder="Enter project title"
                      className="w-full h-14 px-6 pr-14 text-lg bg-gray-50/80 dark:bg-gray-900/50 border-2 border-gray-200/60 dark:border-gray-600/50 rounded-2xl transition-all duration-300 focus:ring-4 focus:ring-theme-primary-500/20 focus:border-theme-primary-500 dark:theme-primary:border-blue-400 hover:border-gray-300 dark:hover:border-gray-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      aria-invalid={!!errors.title}
                      aria-describedby="title-error"
                    />
                    {errors.title && <p className="text-red-600 text-xs mt-1" id="title-error">{errors.title}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="imageUrl" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Image URL
                    </label>
                    <input
                      id="imageUrl"
                      name="imageUrl"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      className="w-full h-14 px-6 pr-14 text-lg bg-gray-50/80 dark:bg-gray-900/50 border-2 border-gray-200/60 dark:border-gray-600/50 rounded-2xl transition-all duration-300 focus:ring-4 focus:ring-theme-primary-500/20 focus:border-theme-primary-500 dark:theme-primary:border-blue-400 hover:border-gray-300 dark:hover:border-gray-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      aria-invalid={!!errors.imageUrl}
                      aria-describedby="imageUrl-error"
                    />
                    {errors.imageUrl && <p className="text-red-600 text-xs mt-1" id="imageUrl-error">{errors.imageUrl}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    placeholder="Describe your project..."
                    className="w-full px-6 py-4 text-lg bg-gray-50/80 dark:bg-gray-900/50 border-2 border-gray-200/60 dark:border-gray-600/50 rounded-2xl transition-all duration-300 focus:ring-4 focus:ring-theme-primary-500/20 focus:border-theme-primary-500 dark:focus:border-theme-primary-400 hover:border-gray-300 dark:hover:border-gray-500 resize-none outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    aria-invalid={!!errors.description}
                    aria-describedby="description-error"
                  />
                  {errors.description && <p className="text-red-600 text-xs mt-1" id="description-error">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="externalUrl" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Project URL
                    </label>
                    <input
                      id="externalUrl"
                      name="externalUrl"
                      type="url"
                      placeholder="https://yourproject.com"
                      className="w-full h-14 px-6 pr-14 text-lg bg-gray-50/80 dark:bg-gray-900/50 border-2 border-gray-200/60 dark:border-gray-600/50 rounded-2xl transition-all duration-300 focus:ring-4 focus:ring-theme-primary-500/20 focus:border-theme-primary-500 dark:theme-primary:border-blue-400 hover:border-gray-300 dark:hover:border-gray-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      value={externalUrl}
                      onChange={e => setExternalUrl(e.target.value)}
                      aria-invalid={!!errors.externalUrl}
                      aria-describedby="externalUrl-error"
                    />
                    {errors.externalUrl && <p className="text-red-600 text-xs mt-1" id="externalUrl-error">{errors.externalUrl}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="tags" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tags (comma separated)
                    </label>
                    <input
                      id="tags"
                      name="tags"
                      placeholder="React, TypeScript, Next.js"
                      className="w-full h-14 px-6 pr-14 text-lg bg-gray-50/80 dark:bg-gray-900/50 border-2 border-gray-200/60 dark:border-gray-600/50 rounded-2xl transition-all duration-300 focus:ring-4 focus:ring-theme-primary-500/20 focus:border-theme-primary-500 dark:theme-primary:border-blue-400 hover:border-gray-300 dark:hover:border-gray-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      value={tags}
                      onChange={e => setTags(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      className="rounded border-gray-300 text-theme-primary-600 focus:ring-theme-primary-500"
                      checked={isFeatured}
                      onChange={e => setIsFeatured(e.target.checked)}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Featured Project</span>
                  </label>
                </div>

                {success && <p className="text-green-600 text-sm font-medium">{success}</p>}

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button type="submit" className="inline-flex items-center gap-2">
                    <FiPlus className="w-4 h-4" />
                    Add Project
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Existing Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FiBriefcase className="w-5 h-5 text-theme-primary-500" />
                Your Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project) => (
                  <PortfolioItem
                    key={project.id}
                    project={project}
                    onEdit={() => alert(`Edit project: ${project.title}`)}
                    onDelete={() => {
                      if (window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
                        setProjects(prev => prev.filter(p => p.id !== project.id));
                      }
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}

interface PortfolioItemProps {
  project: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    externalUrl: string;
    tags: string[];
    isFeatured: boolean;
  };
  onEdit: () => void;
  onDelete: () => void;
}

function PortfolioItem({ project, onEdit, onDelete }: PortfolioItemProps) {
  return (
    <div className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex-shrink-0">
        <ProjectImage imageUrl={project.imageUrl} title={project.title} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{project.title}</h3>
              {project.isFeatured && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 rounded text-xs">
                  <FiStar className="w-3 h-3" />
                  Featured
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{project.description}</p>
            <div className="flex flex-wrap gap-1">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <a
              href={project.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-theme-primary-600 dark:hover:text-theme-primary-400 transition-colors"
              title="View project"
            >
              <FiExternalLink className="w-4 h-4" />
            </a>
            <button
              className="p-2 text-gray-400 hover:text-theme-primary-600 dark:hover:text-theme-primary-400 transition-colors"
              title="Edit project"
              onClick={onEdit}
            >
              <FiEdit className="w-4 h-4" />
            </button>
            <button
              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Delete project"
              onClick={onDelete}
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 

// Helper component for image with error handling
function ProjectImage({ imageUrl, title }: { imageUrl: string; title: string }) {
  const [imgSrc, setImgSrc] = useState(imageUrl);
  return (
    <Image
      src={imgSrc}
      alt={title}
      width={64}
      height={64}
      className="w-16 h-16 object-cover rounded-lg"
      onError={() => setImgSrc("/images/placeholder-project.jpg")}
      unoptimized
    />
  );
} 