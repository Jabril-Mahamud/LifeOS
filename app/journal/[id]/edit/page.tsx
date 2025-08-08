"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FileEdit, ArrowLeft, Save, Smile, Frown, Meh } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { HabitTracker } from "@/components/habits/habit-tracker";
import { toast } from "@/hooks/use-toast";
import { MarkdownHelpInline } from "@/components/journal/markdown-help";
import { Habit, JournalFormData, MOOD_OPTIONS, MoodType, JournalWithHabitLogs } from "@/lib/types";




interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditJournal({ params }: PageProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedMood, setSelectedMood] = useState<MoodType>("neutral");
  const [journalId, setJournalId] = useState<string | null>(null);
  const [journalData, setJournalData] = useState<JournalWithHabitLogs | null>(null);
  const router = useRouter();
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<JournalFormData>({
    defaultValues: {
      title: "",
      content: "",
      mood: "neutral",
    },
  });

  // Resolve params and extract id
  useEffect(() => {
    const resolveParams = async () => {
      const { id } = await params;
      setJournalId(id);
    };
    resolveParams();
  }, [params]);

  // Fetch journal data and habits
  useEffect(() => {
    if (!journalId) return;

    const fetchData = async () => {
      setFetchingData(true);
      try {
        // Fetch journal entry
        const journalResponse = await fetch(`/api/journal/${journalId}`);
        if (!journalResponse.ok) {
          throw new Error("Failed to fetch journal entry");
        }
        
        const journalData = await journalResponse.json();
        setJournalData(journalData.entry);
        
        // Set form values
        setValue("title", journalData.entry.title);
        setValue("content", journalData.entry.content || "");
        setValue("mood", journalData.entry.mood || "neutral");
        setSelectedMood(journalData.entry.mood || "neutral");
        
        // Fetch habits
        const habitsResponse = await fetch("/api/habits");
        if (!habitsResponse.ok) {
          throw new Error("Failed to fetch habits");
        }
        
        const habitsData = await habitsResponse.json();
        // Only use active habits
        setHabits(habitsData.habits.filter((habit: Habit) => habit.active));
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
  }, [journalId, setValue]);

  // Handle form submission
  const onSubmit = async (data: JournalFormData) => {
    if (!journalId) return;

    // Update data with current selections
    data.mood = selectedMood;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/journal/${journalId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update journal entry");
      }
      
      toast({
        title: "Success",
        description: "Journal entry updated successfully!",
      });
      
      router.push(`/journal/${journalId}`);
    } catch (error) {
      console.error("Error updating journal entry:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update journal entry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Loading journal data...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Edit Journal Entry</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <FileEdit className="h-5 w-5 mr-2" />
                Edit Your Journal
              </CardTitle>
              <CardDescription>
                Update your thoughts, experiences, and reflections. You can use Markdown for rich formatting.
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    placeholder="Enter a title for your journal entry"
                    {...register("title", { required: "Title is required" })}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500">{errors.title.message}</p>
                  )}
                </div>
                
                {/* Mood Selection */}
                <div className="space-y-2">
                  <Label>Mood</Label>
                  <div className="flex gap-2">
                    {MOOD_OPTIONS.map((mood) => (
                      <Button
                        key={mood.value}
                        type="button"
                        variant={selectedMood === mood.value ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setSelectedMood(mood.value)}
                      >
                        <span className="mr-2">{mood.icon}</span>
                        {mood.label}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Journal Entry</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your thoughts, experiences, and reflections...

You can use Markdown formatting:
- **Bold text** and *italic text*
- # Headers and ## Subheaders
- - Bullet points and 1. Numbered lists
- > Quotes for emphasis
- `code snippets` and links [like this](https://example.com)"
                    className="min-h-[200px]"
                    {...register("content")}
                  />
                  <MarkdownHelpInline />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
        
        {/* Habits Section */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Track Your Habits</CardTitle>
              <CardDescription>
                Update which habits you completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {habits.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No active habits to track</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => router.push("/habits/new")}
                  >
                    Create a habit
                  </Button>
                </div>
              ) : (
                <HabitTracker 
                  habits={habits} 
                  journalData={{
                    id: journalId || "",
                    hasEntryToday: true,
                    todayEntry: {
                      id: journalId || "",
                      habitLogs: journalData?.habitLogs || []
                    }
                  }}
                  showTitle={false}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}