"use client";

import { useState } from "react";
import { Copy, Check, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeExampleProps {
  code: string;
  language?: string;
  title?: string;
  filename?: string;
  className?: string;
  showLineNumbers?: boolean;
}

export function CodeExample({ 
  code, 
  language = "bash", 
  title, 
  filename,
  className,
  showLineNumbers = false 
}: CodeExampleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const lines = code.split('\n');

  return (
    <div className={cn(
      "bg-gray-900 dark:bg-gray-950 rounded-xl border border-gray-700 overflow-hidden",
      className
    )}>
      {/* Header */}
      {(title || filename) && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800 dark:bg-gray-900 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-gray-400" />
            {filename && (
              <span className="text-sm font-mono text-gray-300">{filename}</span>
            )}
            {title && !filename && (
              <span className="text-sm text-gray-300">{title}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {language}
            </span>
          </div>
        </div>
      )}

      {/* Code Content */}
      <div className="relative">
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors duration-200 z-10"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>

        <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
          <code className={`language-${language}`}>
            {showLineNumbers ? (
              <div className="grid grid-cols-[auto_1fr] gap-4">
                <div className="text-gray-500 text-right select-none">
                  {lines.map((_, index) => (
                    <div key={index} className="leading-6">
                      {index + 1}
                    </div>
                  ))}
                </div>
                <div>
                  {lines.map((line, index) => (
                    <div key={index} className="leading-6">
                      {line || '\u00A0'}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              code
            )}
          </code>
        </pre>
      </div>
    </div>
  );
}

interface MultiCodeExampleProps {
  examples: Array<{
    title: string;
    code: string;
    language?: string;
    filename?: string;
  }>;
  className?: string;
}

export function MultiCodeExample({ examples, className }: MultiCodeExampleProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={cn("border border-gray-700 rounded-xl overflow-hidden", className)}>
      {/* Tabs */}
      <div className="flex bg-gray-800 dark:bg-gray-900 border-b border-gray-700">
        {examples.map((example, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={cn(
              "px-4 py-3 text-sm font-medium transition-colors duration-200",
              activeTab === index
                ? "text-theme-primary-400 bg-gray-900 dark:bg-gray-950 border-b-2 border-theme-primary-400"
                : "text-gray-400 hover:text-gray-200"
            )}
          >
            {example.title}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-gray-900 dark:bg-gray-950">
        <CodeExample
          code={examples[activeTab].code}
          language={examples[activeTab].language}
          filename={examples[activeTab].filename}
          className="border-0 rounded-none"
        />
      </div>
    </div>
  );
} 