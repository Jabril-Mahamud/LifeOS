// components/ui/markdown-help.tsx
"use client";

import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function MarkdownHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const markdownExamples = [
    {
      title: "Headers",
      syntax: "# Header 1\n## Header 2\n### Header 3",
      description: "Create headers using # symbols"
    },
    {
      title: "Text Formatting",
      syntax: "**Bold text**\n*Italic text*\n~~Strikethrough~~",
      description: "Make text bold, italic, or strikethrough"
    },
    {
      title: "Lists",
      syntax: "- Bullet point\n- Another point\n\n1. Numbered list\n2. Second item",
      description: "Create bulleted or numbered lists"
    },
    {
      title: "Links",
      syntax: "[Link text](https://example.com)",
      description: "Create clickable links"
    },
    {
      title: "Quotes",
      syntax: "> This is a quote\n> It can span multiple lines",
      description: "Add blockquotes for emphasis"
    },
    {
      title: "Code",
      syntax: "`inline code`\n\n```\ncode block\nmultiple lines\n```",
      description: "Include inline code or code blocks"
    },
    {
      title: "Tables",
      syntax: "| Column 1 | Column 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |",
      description: "Create tables with pipes"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Markdown help</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Markdown Formatting Guide</DialogTitle>
          <DialogDescription>
            Use these Markdown syntax examples to format your journal entries with rich text.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {markdownExamples.map((example, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{example.title}</CardTitle>
                <p className="text-xs text-muted-foreground">{example.description}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <pre className="bg-muted p-3 rounded text-xs font-mono overflow-x-auto">
                  {example.syntax}
                </pre>
              </CardContent>
            </Card>
          ))}
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Press Enter twice to create a new paragraph</li>
                <li>• Use two spaces at the end of a line for a line break</li>
                <li>• Preview your formatting by viewing the saved entry</li>
                <li>• You can mix different formatting styles</li>
                <li>• Leave blank lines between different elements for better readability</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Compact inline help component for smaller spaces
export function MarkdownHelpInline() {
  return (
    <div className="text-xs text-muted-foreground">
      <p className="mb-2">
        <strong>Markdown supported:</strong> Use **bold**, *italic*, # headers, - lists, {`>`} quotes, `code`, and more.
      </p>
      <div className="flex items-center gap-2">
        <span>Need help?</span>
        <MarkdownHelp />
      </div>
    </div>
  );
}