"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, PlusCircle, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { CircularProgress } from "@/components/ui/circular-progress";
import { cn } from "@/lib/utils";

type Habit = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  streak: number;
  completionRate: number;
  streakData: Array<{
    date: string;
    completed: boolean;
  }>;
};

type Journal = {
  id: string;
  hasEntryToday: boolean;
  todayEntry?: {
    id: string;
    habitLogs: Array<{
      id: string;
      habitId: string;
      completed: boolean;
      notes: string | null;
    }>;
  };
};

type HabitTrackerProps = {
  habits?: Habit[];
  journalData?: Journal;
  showTitle?: boolean;
  onHabitsUpdated?: () => void;
};

export function HabitTracker({ 
  habits = [], 
  journalData, 
  showTitle = true,
  onHabitsUpdated 
}: HabitTrackerProps) {
  const [loading, setLoading] = useState(false);
  const [updatingHabitId, setUpdatingHabitId] = useState<string | null>(null);
  const router = useRouter();

  // Toggle habit completion status
  const toggleHabitCompletion = async (habitId: string, currentStatus: boolean) => {
    if (!journalData?.hasEntryToday) {
      toast({
        title: "Journal Entry Required",
        description: "You need to create today's journal entry before tracking habits.",
        variant: "destructive",
      });
      
      // Redirect to create journal entry
      router.push("/journal/new");
      return;
    }
    
    setUpdatingHabitId(habitId);
    setLoading(true);
    
    try {
      const response = await fetch(`/api/journal/${journalData.todayEntry?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          habitLogs: [
            {
              habitId: habitId,
              completed: !currentStatus,
              notes: null,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update habit status");
      }
      
      toast({
        description: !currentStatus 
          ? "Habit marked as completed!" 
          : "Habit marked as incomplete",
      });
      
      // Refresh data
      if (onHabitsUpdated) {
        onHabitsUpdated();
      }
    } catch (error) {
      console.error("Error updating habit status:", error);
      toast({
        title: "Error",
        description: "Failed to update habit status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingHabitId(null);
      setLoading(false);
    }
  };

  // Get completion status of a habit for today
  const getHabitCompletionStatus = (habitId: string): boolean => {
    if (!journalData?.hasEntryToday || !journalData.todayEntry) {
      return false;
    }
    
    const habitLog = journalData.todayEntry.habitLogs.find(
      log => log.habitId === habitId
    );
    
    return habitLog ? habitLog.completed : false;
  };

  return (
    <Card>
      {showTitle && (
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Habit Tracking
          </CardTitle>
          <CardDescription>
            {habits.length} active habits
          </CardDescription>
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        {habits.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-2">No active habits to track</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push("/habits/new")}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create a habit
            </Button>
          </div>
        ) : !journalData?.hasEntryToday ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-2">Create today's journal entry to track habits</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push("/journal/new")}
            >
              Create Journal Entry
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => {
              const isCompleted = getHabitCompletionStatus(habit.id);
              const isUpdating = updatingHabitId === habit.id;
              
              return (
                <div key={habit.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 rounded-full p-0",
                        isCompleted 
                          ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                          : "bg-muted hover:bg-muted/80"
                      )}
                      onClick={() => toggleHabitCompletion(habit.id, isCompleted)}
                      disabled={loading && isUpdating}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                      <span className="sr-only">{isCompleted ? "Completed" : "Not completed"}</span>
                    </Button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {habit.icon && <span className="mr-1">{habit.icon}</span>}
                          {habit.name}
                        </span>
                      </div>
                      {habit.streak > 0 && (
                        <Badge 
                          variant="outline" 
                          className="text-xs font-normal"
                          style={{
                            backgroundColor: habit.color || undefined,
                            color: habit.color ? "white" : undefined
                          }}
                        >
                          {habit.streak} day streak
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="w-16">
                    <CircularProgress 
                      value={habit.completionRate} 
                      size="sm" 
                      color={habit.color || "hsl(var(--primary))"}
                      backgroundColor="hsl(var(--muted))"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => router.push("/habits")}
        >
          Manage habits
        </Button>
      </CardFooter>
    </Card>
  );
}