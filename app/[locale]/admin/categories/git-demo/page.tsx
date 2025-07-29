"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import { GitBranch, Github, RefreshCw, Plus } from "lucide-react";

interface GitStatus {
  repoUrl: string;
  branch: string;
  lastSync: string;
  categoriesCount: number;
}

interface GitDemoResponse {
  success: boolean;
  status?: GitStatus;
  categories?: any[];
  message?: string;
  error?: string;
}

export default function GitDemoPage() {
  const [loading, setLoading] = useState(true);
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchGitStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/categories/git');
      const data: GitDemoResponse = await response.json();

      if (data.success) {
        setGitStatus(data.status || null);
        setCategories(data.categories || []);
      } else {
        setError(data.error || 'Failed to fetch Git status');
      }
    } catch (error) {
      setError('Failed to connect to Git service');
      console.error('Git status fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGitStatus();
  }, []);

  const handleRefresh = () => {
    fetchGitStatus();
  };

  const handleCreateDemoCategory = async () => {
    try {
      setLoading(true);
      
      const demoCategory = {
        id: `demo-category-${Date.now()}`,
        name: `Demo Category ${new Date().toLocaleTimeString()}`,
      };

      const response = await fetch('/api/admin/categories/git', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(demoCategory),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the status
        await fetchGitStatus();
      } else {
        setError(data.error || 'Failed to create demo category');
      }
    } catch (error) {
      setError('Failed to create demo category');
      console.error('Create category error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-gray-500">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading Git repository status...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Github className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Git-Based Category Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage categories through GitHub repositories with version control
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-0 bg-red-50 dark:bg-red-900/20 mb-6">
          <CardBody className="p-4">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <span className="text-sm font-medium">⚠️ {error}</span>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Git Status */}
      {gitStatus && (
        <Card className="border-0 shadow-lg mb-6">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Repository Status
              </h2>
              <Button
                size="sm"
                variant="ghost"
                onPress={handleRefresh}
                startContent={<RefreshCw size={16} />}
              >
                Refresh
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                               <div className="flex items-center space-x-2">
                 <Github size={16} className="text-gray-500" />
                 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                   Repository
                 </span>
               </div>
                <a 
                  href={gitStatus.repoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  {gitStatus.repoUrl}
                </a>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <GitBranch size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Branch
                  </span>
                </div>
                <Chip size="sm" variant="flat" color="primary">
                  {gitStatus.branch}
                </Chip>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Categories Count
                </span>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {gitStatus.categoriesCount}
                </div>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Sync
                </span>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(gitStatus.lastSync).toLocaleString()}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Actions */}
      <Card className="border-0 shadow-lg mb-6">
        <CardBody className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Git Operations
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Test Git-based category management
              </p>
            </div>
            <Button
              color="primary"
              onPress={handleCreateDemoCategory}
              startContent={<Plus size={16} />}
              isLoading={loading}
            >
              Create Demo Category
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Categories List */}
      {categories.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardBody className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Categories from Git Repository
            </h3>
            <div className="space-y-3">
              {categories.map((category) => (
                <div 
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                      ID: {category.id}
                    </div>
                  </div>
                  <Chip size="sm" variant="flat" color="success">
                    Active
                  </Chip>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Setup Instructions */}
      <Card className="border-0 shadow-lg mt-6">
        <CardBody className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Setup Instructions
          </h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p>
              1. Create a GitHub repository for your categories
            </p>
            <p>
              2. Set environment variables in your <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">.env.local</code>:
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-xs">
              GITHUB_OWNER=your-username<br/>
              GITHUB_REPO=your-repo<br/>
              GITHUB_TOKEN=your-github-token<br/>
              GITHUB_BRANCH=main
            </div>
            <p>
              3. The system will automatically sync categories with your Git repository
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
} 