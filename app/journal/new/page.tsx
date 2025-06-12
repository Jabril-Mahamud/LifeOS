"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FileEdit, ArrowLeft, Save, Smile, Frown, Meh, NotebookPen, Eye, EyeOff } from "lucide-react";
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

import { Habit, JournalFormData, MoodType, MOOD_OPTIONS } from "@/lib/types";

const PRODUCTIVITY_TEMPLATE = `# Daily Focus - ${new Date().toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}

## 🎯 Today's Priorities
- [ ] Priority 1: [Specific outcome expected]
- [ ] Priority 2: [Specific outcome expected]  
- [ ] Priority 3: [Specific outcome expected]

## ✅ Completed
**What I accomplished:**
- Finished [specific task/project]
- Made progress on [specific area]
- Resolved [specific issue]

**Key wins:** [1-2 notable achievements]

## 📊 Progress Check
**Project/Goal:** [Name]
- **Current status:** [Brief update]
- **Next milestone:** [Specific target]
- **Blockers:** [What's holding me back]

## 🧠 Learning & Insights
**Today I learned:**
- [Specific insight or skill gained]
- [Process improvement discovered]

**What worked well:**
- [Strategy/approach that was effective]

**What didn't work:**
- [Challenge faced and why it happened]

## 🔄 Tomorrow's Setup
**Top 3 priorities:**
1. [Specific action item]
2. [Specific action item]  
3. [Specific action item]

**Preparation needed:**
- [Resource/tool required]
- [Information to gather]
- [Person to contact]

## 📈 Weekly/Monthly View
**This week's focus:** [Main objective]
**This month's goal:** [Larger outcome]

---
**Energy level:** [1-10] | **Focus time:** [Hours of deep work]`;

const SIMPLE_TEMPLATE = `# ${new Date().toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}

## What happened today?


## How am I feeling?


## What did I learn?


## Tomorrow's focus:
`;

const WORKOUT_TEMPLATE = `# ${new Date().toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})} - Fitness Log

## 🏃 Today's Workout
**Type:** [Cardio/Strength/Yoga/Rest Day]
**Duration:** [Time spent]
**Intensity:** [Light/Moderate/High]

### Exercises:
- [ ] Exercise 1 - [Sets x Reps or Duration]
- [ ] Exercise 2 - [Sets x Reps or Duration]
- [ ] Exercise 3 - [Sets x Reps or Duration]

## 💪 How I Felt
**Energy Level:** [1-10]
**Motivation:** [1-10]
**Physical feeling:** 

## 🥗 Nutrition Notes
**Water intake:** [Glasses/Liters]
**Meals:** 
- Breakfast: 
- Lunch: 
- Dinner: 
- Snacks: 

## 🎯 Tomorrow's Plan
**Planned activity:** 
**Focus area:** 
**Goal:** `;

const WORK_TEMPLATE = `# ${new Date().toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})} - Work Journal

## 🎯 Today's Priorities
- [ ] [High priority task]
- [ ] [Medium priority task]
- [ ] [Low priority task]

## ✅ Completed Tasks
- [Task completed]
- [Another completed task]

## 💡 Key Insights & Learning
**What I learned:**

**Problem I solved:**

**Skills I developed:**

## 🤝 Meetings & Collaborations
**Important meetings:**
- Meeting 1: [Key outcomes]
- Meeting 2: [Action items]

**Team interactions:**

## 📊 Progress & Metrics
**Goals worked toward:**

**Metrics/Numbers:**

## 🔄 Tomorrow's Setup
**Top 3 priorities:**
1. 
2. 
3. 

**Preparation needed:**

## 💭 Reflection
**What went well:**

**What could improve:**

**Energy & mood:** [1-10]`;

const TEMPLATES = [
  {
    id: 'daily',
    name: 'Daily Reflection',
    icon: '📋',
    description: 'Simple daily check-in',
    content: SIMPLE_TEMPLATE
  },
  {
    id: 'productivity',
    name: 'Productivity & Goals',
    icon: '🎯',
    description: 'Detailed planning and tracking',
    content: PRODUCTIVITY_TEMPLATE
  },
  {
    id: 'workout',
    name: 'Workout & Health',
    icon: '🏃',
    description: 'Fitness and wellness tracking',
    content: WORKOUT_TEMPLATE
  },
  {
    id: 'work',
    name: 'Work & Career',
    icon: '💼',
    description: 'Professional development',
    content: WORK_TEMPLATE
  }
];

export default function NewJournal() {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedMood, setSelectedMood] = useState<MoodType>("neutral");
  const [existingEntry, setExistingEntry] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("write");
  const [localHabitCompletions, setLocalHabitCompletions] = useState<Record<string, boolean>>({});
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

  const useTemplate = useCallback((template: string) => {
    setValue("content", template);
    toast({
      description: "Template loaded! Feel free to customize it.",
    });
  }, [setValue]);

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
                          <PopoverContent className="w-64" align="end">
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">📝 Choose a Template</h4>
                              <div className="space-y-1">
                                {TEMPLATES.map((template) => (
                                  <Button
                                    key={template.id}
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => useTemplate(template.content)}
                                    className="w-full justify-start text-left h-auto p-2"
                                  >
                                    <span className="mr-2">{template.icon}</span>
                                    <div>
                                      <div className="font-medium text-sm">{template.name}</div>
                                      <div className="text-xs text-muted-foreground">{template.description}</div>
                                    </div>
                                  </Button>
                                ))}
                                <div className="border-t pt-1 mt-2">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setValue("content", "")}
                                    className="w-full justify-start text-left h-auto p-2"
                                  >
                                    <span className="mr-2">+</span>
                                    <div>
                                      <div className="font-medium text-sm">Create new</div>
                                      <div className="text-xs text-muted-foreground">Start with blank template</div>
                                    </div>
                                  </Button>
                                </div>
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
    </div>
  );
}