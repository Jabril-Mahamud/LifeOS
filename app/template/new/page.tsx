"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { ArrowLeft, Save, FileEdit } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/journal/markdown-renderer";
import { TemplateFormData, CustomTemplate } from "@/lib/types";

export default function NewTemplatePage() {
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get content from URL params if coming from journal page
  const initialContent = searchParams.get('content') || '';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TemplateFormData>({
    defaultValues: {
      name: "",
      description: "",
      content: initialContent,
    },
  });

  const watchedContent = watch("content");

  const onSubmit = async (data: TemplateFormData) => {
    if (!data.content.trim()) {
      toast({
        title: "Error",
        description: "Please add some content to save as a template.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get existing templates from localStorage
      const existingTemplates = localStorage.getItem('journal-custom-templates');
      const templates: CustomTemplate[] = existingTemplates 
        ? JSON.parse(existingTemplates) 
        : [];

      // Create new template
      const newTemplate: CustomTemplate = {
        id: Date.now().toString(),
        name: data.name.trim(),
        description: data.description.trim() || "Custom template",
        content: data.content,
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage
      const updatedTemplates = [...templates, newTemplate];
      localStorage.setItem('journal-custom-templates', JSON.stringify(updatedTemplates));

      toast({
        title: "Success",
        description: "Template saved successfully!",
      });

      // Navigate back to journal creation
      router.push('/journal/new');
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold ml-2">Save as Template</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl flex items-center">
              <FileEdit className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Template Details
            </CardTitle>
            <CardDescription className="text-sm">
              Give your template a name and description so you can easily find it later.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {/* Template Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Template Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Weekly Review, Morning Pages, Daily Standup..."
                  {...register("name", { required: "Template name is required" })}
                  className="text-sm sm:text-base"
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  placeholder="Brief description of when to use this template"
                  {...register("description")}
                  className="text-sm sm:text-base"
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">
                  Template Content <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  placeholder="Write your template content here...

You can use Markdown formatting:
- **Bold text** and *italic text*
- # Headers and ## Subheaders
- - Bullet points and 1. Numbered lists
- > Quotes for emphasis"
                  className="min-h-[300px] sm:min-h-[400px] text-sm sm:text-base"
                  {...register("content", { required: "Template content is required" })}
                />
                {errors.content && (
                  <p className="text-xs text-red-500">{errors.content.message}</p>
                )}
              </div>

              {/* Preview Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Preview your template formatting
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </Button>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row justify-between gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.back()}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Template"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Preview Section */}
        <Card className={showPreview ? "block" : "hidden lg:block"}>
          <CardHeader>
            <CardTitle className="text-lg">Template Preview</CardTitle>
            <CardDescription className="text-sm">
              See how your template will look when rendered
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-h-[300px] p-4 border rounded-md bg-muted/30">
              {watchedContent ? (
                <MarkdownRenderer content={watchedContent} />
              ) : (
                <p className="text-muted-foreground italic">
                  Start writing to see a preview...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}