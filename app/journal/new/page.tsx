"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FileEdit, ArrowLeft, Save, Smile, Frown, Meh, NotebookPen, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
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
import { HabitTracker } from "@/components/habits/habit-tracker";
import { toast } from "@/hooks/use-toast";
import { MarkdownHelpInline } from "@/components/journal/markdown-help";
import { MarkdownRenderer } from "@/components/journal/markdown-renderer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Habit, JournalFormData, MoodType, MOOD_OPTIONS, CustomTemplate, TemplateFormData } from "@/lib/types";
import { BUILT_IN_TEMPLATES, generateFreshTemplate } from "@/lib/constants/templates";

export default function NewJournal() {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedMood, setSelectedMood] = useState<MoodType>("neutral");
  const [existingEntry, setExistingEntry] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("write");
  const [localHabitCompletions, setLocalHabitCompletions] = useState<Record<string, boolean>>({});
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JournalFormData>({
    defaultValues: {
      title: `Journal for ${new Date().toLocaleDateString()}`,
      content: "",
      mood: "neutral",
    },
  });

  const watchedContent = watch("content");

  // Fetch habits and check for existing entry
  useEffect(() => {
    const fetchData = async () => {
      setFetchingData(true);
      try {
        // Check if a journal entry already exists for today
        const journalResponse = await fetch("/api/journal");
        if (!journalResponse.ok) {
          throw new Error("Failed to fetch journal data");
        }
        const journalData = await journalResponse.json();

        if (journalData.todayEntry) {
          // If entry exists, pre-fill form
          setExistingEntry(journalData.todayEntry);
          setValue("title", journalData.todayEntry.title);
          setValue("content", journalData.todayEntry.content || "");
          setValue("mood", journalData.todayEntry.mood || "neutral");
          setSelectedMood(journalData.todayEntry.mood || "neutral");

          toast({
            description:
              "You already have a journal entry for today. You can edit it here.",
          });
        }

        // Fetch habits
        const habitsResponse = await fetch("/api/habits");
        if (!habitsResponse.ok) {
          throw new Error("Failed to fetch habits");
        }
        const habitsData = await habitsResponse.json();

        // Only use active habits
        setHabits(habitsData.habits.filter((habit: any) => habit.active));
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, [setValue]);

  // Load custom templates from localStorage
  useEffect(() => {
    const savedTemplates = localStorage.getItem('journal-custom-templates');
    if (savedTemplates) {
      try {
        setCustomTemplates(JSON.parse(savedTemplates));
      } catch (error) {
        console.error('Error loading custom templates:', error);
      }
    }
  }, []);

  // Memoize the journal data object to prevent unnecessary re-renders
  const journalData = useMemo(() => {
    return {
      id: "today",
      hasEntryToday: Boolean(existingEntry),
      todayEntry: existingEntry
        ? {
            id: existingEntry.id,
            habitLogs: existingEntry.habitLogs || [],
          }
        : {
            id: "temp-id",
            habitLogs: [],
          },
    };
  }, [existingEntry]);

  // Stable callback for handling local habit changes
  const handleLocalHabitsChange = useCallback((habitCompletions: Record<string, boolean>) => {
    setLocalHabitCompletions(habitCompletions);
  }, []);

  // Handle form submission
  const onSubmit = async (data: JournalFormData) => {
    // Update data with current mood
    data.mood = selectedMood;

    setLoading(true);
    try {
      const url = existingEntry
        ? `/api/journal/${existingEntry.id}`
        : "/api/journal";

      const method = existingEntry ? "PATCH" : "POST";

      // Include local habit completions for new entries
      const submitData = {
        ...data,
        habitCompletions: !existingEntry ? localHabitCompletions : undefined
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save journal entry");
      }

      const responseData = await response.json();

      toast({
        title: "Success",
        description: existingEntry
          ? "Journal entry updated successfully!"
          : "Journal entry created successfully!",
      });

      // Redirect to journal page
      router.push("/journal");
    } catch (error) {
      console.error("Error saving journal entry:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save journal entry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const useTemplate = useCallback((templateIdOrContent: string, isCustom = false) => {
    let content: string;
    
    if (isCustom) {
      // For custom templates, use the content directly
      content = templateIdOrContent;
    } else {
      // For built-in templates, generate fresh content with current date
      content = generateFreshTemplate(templateIdOrContent);
    }
    
    setValue("content", content);
    toast({
      description: "Template loaded! Feel free to customize it.",
    });
  }, [setValue]);

  // Save a custom template
  const saveCustomTemplate = useCallback(() => {
    const content = watchedContent || "";
    
    if (!templateName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a template name.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Error", 
        description: "Please write some content before saving as a template.",
        variant: "destructive",
      });
      return;
    }

    const templateData: TemplateFormData = {
      name: templateName.trim(),
      description: templateDescription.trim() || "Custom template",
      content: content,
    };

    const newTemplate: CustomTemplate = {
      id: Date.now().toString(),
      ...templateData,
      createdAt: new Date().toISOString(),
    };

    const updatedTemplates = [...customTemplates, newTemplate];
    setCustomTemplates(updatedTemplates);
    localStorage.setItem('journal-custom-templates', JSON.stringify(updatedTemplates));

    // Reset dialog state
    setIsTemplateDialogOpen(false);
    setTemplateName("");
    setTemplateDescription("");

    toast({
      description: "Custom template saved successfully!",
    });
  }, [templateName, templateDescription, watchedContent, customTemplates]);

  // Delete a custom template
  const deleteCustomTemplate = useCallback((templateId: string) => {
    const updatedTemplates = customTemplates.filter(t => t.id !== templateId);
    setCustomTemplates(updatedTemplates);
    localStorage.setItem('journal-custom-templates', JSON.stringify(updatedTemplates));
    
    toast({
      description: "Template deleted successfully.",
    });
  }, [customTemplates]);

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold ml-2">
          {existingEntry ? "Edit Journal Entry" : "New Journal Entry"}
        </h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl flex items-center">
                <FileEdit className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {existingEntry ? "Edit Your Journal" : "Write Your Journal"}
              </CardTitle>
              <CardDescription className="text-sm">
                Record your thoughts, experiences, and reflections for today.
                You can use Markdown for rich formatting.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter a title for your journal entry"
                    {...register("title", { required: "Title is required" })}
                    className="text-sm sm:text-base"
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Mood Selection */}
                <div className="space-y-2">
                  <Label>Mood</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {MOOD_OPTIONS.map((mood) => (
                      <Button
                        key={mood.value}
                        type="button"
                        variant={
                          selectedMood === mood.value ? "default" : "outline"
                        }
                        className="flex-1 text-sm touch-manipulation"
                        onClick={() => setSelectedMood(mood.value)}
                      >
                        <span className="mr-1 sm:mr-2">{mood.icon}</span>
                        <span className="hidden xs:inline">{mood.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Content with Template Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="content">Journal Entry</Label>
                    <div className="flex items-center gap-2">
                      {/* Template Selector */}
                      {!existingEntry && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs sm:text-sm"
                            >
                              <NotebookPen className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Templates</span>
                              <span className="sm:hidden">📝</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 sm:w-80" align="end">
                            <div className="space-y-3">
                              <h4 className="font-medium text-sm">📝 Choose a Template</h4>
                              
                              {/* Built-in templates */}
                              <div className="space-y-1">
                                {BUILT_IN_TEMPLATES.map((template) => (
                                  <Button
                                    key={template.id}
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => useTemplate(template.id)}
                                    className="w-full justify-start text-left h-auto p-2"
                                  >
                                    <span className="mr-2">{template.icon}</span>
                                    <div>
                                      <div className="font-medium text-sm">{template.name}</div>
                                      <div className="text-xs text-muted-foreground">{template.description}</div>
                                    </div>
                                  </Button>
                                ))}
                              </div>

                              {/* Custom templates */}
                              {customTemplates.length > 0 && (
                                <div className="space-y-2">
                                  <div className="border-t pt-2">
                                    <div className="text-xs font-medium text-muted-foreground mb-2">Your Templates</div>
                                  </div>
                                  <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {customTemplates.map((template) => (
                                      <div key={template.id} className="group flex items-center">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => useTemplate(template.content, true)}
                                          className="flex-1 justify-start text-left h-auto p-2"
                                        >
                                          <span className="mr-2">📄</span>
                                          <div>
                                            <div className="font-medium text-sm">{template.name}</div>
                                            <div className="text-xs text-muted-foreground">{template.description}</div>
                                          </div>
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => deleteCustomTemplate(template.id)}
                                          className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Save template action */}
                              <div className="border-t pt-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setIsTemplateDialogOpen(true)}
                                  className="w-full justify-start text-left h-auto p-2"
                                >
                                  <span className="mr-2">💾</span>
                                  <div>
                                    <div className="font-medium text-sm">Save as Template</div>
                                    <div className="text-xs text-muted-foreground">Save current content for reuse</div>
                                  </div>
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                        className="text-xs sm:text-sm"
                      >
                        {showPreview ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Hide Preview</span>
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Show Preview</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {showPreview ? (
                    <div className="min-h-[400px] sm:min-h-[500px] p-4 border rounded-md bg-muted/30">
                      {watchedContent ? (
                        <MarkdownRenderer content={watchedContent} />
                      ) : (
                        <p className="text-muted-foreground italic">
                          Start writing to see a preview...
                        </p>
                      )}
                    </div>
                  ) : (
                    <Textarea
                      id="content"
                      placeholder="Start writing your thoughts, experiences, and reflections...

Use Markdown formatting:
- **Bold text** and *italic text*
- # Headers and ## Subheaders  
- - Bullet points and 1. Numbered lists
- > Quotes for emphasis
- `code snippets` and [links](https://example.com)"
                      className="min-h-[400px] sm:min-h-[500px] text-sm sm:text-base"
                      {...register("content")}
                    />
                  )}

                  <MarkdownHelpInline />
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
                  {loading ? "Saving..." : "Save Journal Entry"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Habits Section */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Track Your Habits</CardTitle>
              <CardDescription className="text-sm">
                Which habits did you complete today?
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fetchingData ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Loading habits...</p>
                </div>
              ) : habits.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    No active habits to track
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full sm:w-auto"
                    onClick={() => router.push("/habits/new")}
                  >
                    Create a habit
                  </Button>
                </div>
              ) : (
                <HabitTracker
                  habits={habits}
                  journalData={journalData}
                  showTitle={false}
                  inJournalContext={true}
                  onLocalHabitsChange={handleLocalHabitsChange}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Custom Template Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Save your current journal content as a reusable template.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                placeholder="e.g., Weekly Review, Morning Pages..."
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template-description">Description (optional)</Label>
              <Input
                id="template-description"
                placeholder="Brief description of when to use this template"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Preview of content */}
            <div className="space-y-2">
              <Label>Content Preview</Label>
              <div className="max-h-32 overflow-y-auto p-3 bg-muted rounded-md text-sm">
                {watchedContent ? (
                  <pre className="whitespace-pre-wrap font-sans">{watchedContent.slice(0, 200)}{watchedContent.length > 200 ? '...' : ''}</pre>
                ) : (
                  <span className="text-muted-foreground italic">No content to save</span>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsTemplateDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={saveCustomTemplate}
              disabled={!templateName.trim() || !watchedContent?.trim()}
              className="w-full sm:w-auto"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}