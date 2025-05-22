"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Calendar, BarChart } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { HabitHeatmapCalendar } from "@/components/habits/habit-heatmap-calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

type Habit = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  streak?: number;
  completionRate?: number;
  streakData?: Array<{
    date: string;
    completed: boolean;
  }>;
};

type HabitLog = {
  id: string;
  habitId: string;
  completed: boolean;
  notes: string | null;
};

type Journal = {
  id: string;
  hasEntryToday: boolean;
  todayEntry?: {
    id: string;
    habitLogs: HabitLog[];
  };
};

type HabitTrackerProps = {
  habits?: Habit[];
  journalData?: Journal;
  onHabitsUpdated?: () => void;
  showTitle?: boolean;
  showVisualization?: boolean;
};

export function HabitTracker({ 
  habits = [], 
  journalData, 
  onHabitsUpdated,
  showTitle = false,
  showVisualization = true
}: HabitTrackerProps) {
  const [loading, setLoading] = useState(false);
  const [updatingHabitId, setUpdatingHabitId] = useState<string | null>(null);
  const [completionStatus, setCompletionStatus] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<string>("today");
  const router = useRouter();

  // Initialize completion status from journal data
  useEffect(() => {
    if (journalData?.hasEntryToday && journalData.todayEntry) {
      const status: Record<string, boolean> = {};
      habits.forEach(habit => {
        status[habit.id] = false;
      });
      
      journalData.todayEntry.habitLogs.forEach(log => {
        status[log.habitId] = log.completed;
      });
      
      setCompletionStatus(status);
    } else {
      const status: Record<string, boolean> = {};
      habits.forEach(habit => {
        status[habit.id] = false;
      });
      setCompletionStatus(status);
    }
  }, [habits, journalData]);

  // Toggle habit completion
  const toggleHabitCompletion = async (habitId: string) => {
    if (!journalData?.hasEntryToday) {
      toast({
        description: "Create today's journal entry first",
      });
      router.push("/journal/new");
      return;
    }
    
    setUpdatingHabitId(habitId);
    setLoading(true);
    
    // Update local state immediately
    const newStatus = !completionStatus[habitId];
    setCompletionStatus(prev => ({
      ...prev,
      [habitId]: newStatus
    }));
    
    try {
      const response = await fetch(`/api/habits/${habitId}/log`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: newStatus,
          notes: null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update");
      }
      
      if (onHabitsUpdated) {
        onHabitsUpdated();
      }
    } catch (error) {
      // Revert on error
      setCompletionStatus(prev => ({
        ...prev,
        [habitId]: !newStatus
      }));
      
      toast({
        description: "Failed to update habit status",
      });
    } finally {
      setUpdatingHabitId(null);
      setLoading(false);
    }
  };

  // Filter habits with streak data for the visualization
  const habitsWithData = habits.filter(habit => 
    habit.streakData && habit.streakData.length > 0
  );

  // Check if there's enough data for visualization
  const hasEnoughData = habitsWithData.length > 0;

  if (habits.length === 0) {
    return <div className="text-sm text-muted-foreground">No habits to track</div>;
  }

  if (!journalData?.hasEntryToday) {
    return (
      <div className="text-sm text-muted-foreground">
        Create a journal entry to track habits
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      {showVisualization && hasEnoughData && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="today">
              <Calendar className="h-4 w-4 mr-2" />
              Today's Habits
            </TabsTrigger>
            <TabsTrigger value="insights">
              <BarChart className="h-4 w-4 mr-2" />
              Habit Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4 mt-4">
            {/* Today's Habits List */}
            <div className="space-y-3">
              {habits.map((habit) => {
                const isCompleted = completionStatus[habit.id] || false;
                const isUpdating = updatingHabitId === habit.id;
                
                return (
                  <div 
                    key={habit.id} 
                    className="flex items-center justify-between p-3 hover:bg-accent/20 rounded-md border"
                    onClick={() => !isUpdating && toggleHabitCompletion(habit.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${isUpdating ? 'opacity-50' : ''}`}>
                        {isCompleted ? (
                          <CheckCircle2 
                            className="h-5 w-5" 
                            style={{ color: habit.color || 'currentColor' }}
                          />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <span className="font-medium">
                          {habit.icon && <span className="mr-1">{habit.icon}</span>}
                          {habit.name}
                        </span>
                        
                        {habit.streak !== undefined && (
                          <div className="flex items-center mt-1 text-xs text-muted-foreground">
                            <span>Current streak: {habit.streak} days</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {habit.completionRate !== undefined && (
                      <div className="flex items-center gap-2">
                        <div className="w-20">
                          <Progress value={habit.completionRate} className="h-1.5" />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {habit.completionRate}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Quick Visualization Teaser */}
            {hasEnoughData && (
              <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-dashed text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Want to see your habit patterns over time?
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab("insights")}
                >
                  <BarChart className="h-4 w-4 mr-2" />
                  View Insights
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="mt-4">
            {/* Habit Visualization */}
            <HabitHeatmapCalendar 
              habits={habitsWithData}
              title="Your Habit Patterns"
            />
          </TabsContent>
        </Tabs>
      )}
      
      {/* Simple Habit List Only (when visualization is disabled or not enough data) */}
      {(!showVisualization || !hasEnoughData) && (
        <div className="space-y-3">
          {habits.map((habit) => {
            const isCompleted = completionStatus[habit.id] || false;
            const isUpdating = updatingHabitId === habit.id;
            
            return (
              <div 
                key={habit.id} 
                className="flex items-center p-3 hover:bg-accent/20 rounded-md border"
                onClick={() => !isUpdating && toggleHabitCompletion(habit.id)}
              >
                <div className={`mr-3 ${isUpdating ? 'opacity-50' : ''}`}>
                  {isCompleted ? (
                    <CheckCircle2 
                      className="h-5 w-5" 
                      style={{ color: habit.color || 'currentColor' }}
                    />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <span className="text-sm font-medium">
                  {habit.icon && <span className="mr-1">{habit.icon}</span>}
                  {habit.name}
                </span>
                
                {habit.streak !== undefined && (
                  <Badge variant="outline" className="ml-auto">
                    {habit.streak} day streak
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}