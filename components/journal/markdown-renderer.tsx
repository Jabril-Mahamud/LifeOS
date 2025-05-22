// components/ui/markdown-renderer.tsx
"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  truncate?: boolean;
  maxLines?: number;
}

export function MarkdownRenderer({ 
  content, 
  className,
  truncate = false,
  maxLines = 3
}: MarkdownRendererProps) {
  if (!content) {
    return <p className="text-muted-foreground italic">No content</p>;
  }

  return (
    <div 
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        "prose-headings:mb-2 prose-headings:mt-4 first:prose-headings:mt-0",
        "prose-p:mb-2 prose-p:leading-relaxed",
        "prose-ul:mb-2 prose-ol:mb-2",
        "prose-li:mb-1",
        "prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground",
        "prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
        "prose-pre:bg-muted prose-pre:border",
        "prose-img:rounded-md prose-img:border",
        "prose-hr:border-border",
        "prose-a:text-primary prose-a:decoration-primary/50 hover:prose-a:decoration-primary",
        "prose-strong:text-foreground prose-em:text-foreground",
        truncate && `line-clamp-${maxLines}`,
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Customize specific elements if needed
          h1: ({ children, ...props }) => (
            <h1 className="text-2xl font-bold mb-3 mt-6 first:mt-0" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-xl font-semibold mb-2 mt-5 first:mt-0" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-lg font-medium mb-2 mt-4 first:mt-0" {...props}>
              {children}
            </h3>
          ),
          p: ({ children, ...props }) => (
            <p className="mb-3 last:mb-0 leading-relaxed" {...props}>
              {children}
            </p>
          ),
          ul: ({ children, ...props }) => (
            <ul className="mb-3 last:mb-0 ml-4 list-disc space-y-1" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="mb-3 last:mb-0 ml-4 list-decimal space-y-1" {...props}>
              {children}
            </ol>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote 
              className="border-l-4 border-primary/20 pl-4 my-3 italic text-muted-foreground" 
              {...props}
            >
              {children}
            </blockquote>
          ),
          code: ({ children, className, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            
            if (isInline) {
              return (
                <code 
                  className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" 
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className="font-mono" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children, ...props }) => (
            <pre 
              className="bg-muted border rounded-md p-4 overflow-x-auto my-3 text-sm" 
              {...props}
            >
              {children}
            </pre>
          ),
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-3">
              <table className="min-w-full border-collapse border border-border" {...props}>
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th 
              className="border border-border px-4 py-2 bg-muted font-semibold text-left" 
              {...props}
            >
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="border border-border px-4 py-2" {...props}>
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}