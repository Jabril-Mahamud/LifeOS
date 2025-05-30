"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Calendar, BarChart, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { HabitHeatmapCalendar } from "@/components/habits/habit-heatmap-calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Habit, HabitTrackerJournal, HabitWithStats, Journal } from "@/lib/types";

type HabitTrackerProps = {
  habits?: HabitWithStats[];
  journalData?: HabitTrackerJournal;
  onHabitsUpdated?: () => void;
  showTitle?: boolean;
  showVisualization?: boolean;
  // New prop to indicate when used in journal context
  inJournalContext?: boolean;
  // Callback to provide local habit completions to parent component
  onLocalHabitsChange?: (habitCompletions: Record<string, boolean>) => void;
};

export function HabitTracker({ 
  habits = [], 
  journalData, 
  onHabitsUpdated,
  showTitle = false,
  showVisualization = true,
  inJournalContext = false,
  onLocalHabitsChange
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

  // Notify parent of local habit changes when in journal context
  useEffect(() => {
    if (inJournalContext && onLocalHabitsChange) {
      onLocalHabitsChange(completionStatus);
    }
  }, [completionStatus, inJournalContext, onLocalHabitsChange]);

  // Toggle habit completion
  const toggleHabitCompletion = async (habitId: string) => {
    // Update local state immediately
    const newStatus = !completionStatus[habitId];
    setCompletionStatus(prev => ({
      ...prev,
      [habitId]: newStatus
    }));

    // If we're in journal context and there's no saved journal entry yet, keep it local only
    if (inJournalContext && !journalData?.hasEntryToday) {
      // Just update local state, parent will handle saving when journal is saved
      return;
    }

    // If we're in journal context but editing an existing entry, or not in journal context
    if (!inJournalContext && !journalData?.hasEntryToday) {
      // Only redirect to journal creation if we're NOT in journal context
      toast({
        description: "Create today's journal entry first",
      });
      router.push("/journal/new");
      return;
    }

    // We have a journal entry, so save to API
    setUpdatingHabitId(habitId);
    setLoading(true);
    
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
        variant: "destructive",
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
    return (
      <div className="text-center py-6">
        <p className="text-sm text-muted-foreground">No habits to track</p>
      </div>
    );
  }

  // Only show the "create journal entry" message if:
  // 1. We're NOT in journal context (i.e., we're on dashboard or habits page)
  // 2. AND there's no journal entry for today
  // When inJournalContext is true, we're already creating/editing a journal, so never show this message
  if (!inJournalContext && !journalData?.hasEntryToday) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-sm text-muted-foreground mb-4">
            Create a journal entry to track habits
          </div>
          <Button 
            onClick={() => router.push("/journal/new")}
            className="w-full sm:w-auto"
          >
            Create Journal Entry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tab Navigation */}
      {showVisualization && hasEnoughData && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="today" className="text-sm">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Today's Habits</span>
              <span className="xs:hidden">Today</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-sm">
              <BarChart className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Habit Insights</span>
              <span className="xs:hidden">Insights</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-3 sm:space-y-4 mt-4">
            {/* Today's Habits List */}
            <div className="space-y-0">
              {habits.map((habit, index) => {
                const isCompleted = completionStatus[habit.id] || false;
                const isUpdating = updatingHabitId === habit.id;
                
                return (
                  <div 
                    key={habit.id} 
                    className={`
                      flex items-center justify-between p-3 sm:p-4 hover:bg-accent/20 rounded-md 
                      cursor-pointer touch-manipulation transition-colors duration-200
                      ${index < habits.length - 1 ? 'border-b border-border/50' : ''}
                      ${isUpdating ? 'opacity-50' : ''}
                    `}
                    onClick={() => !isUpdating && toggleHabitCompletion(habit.id)}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className={`${isUpdating ? 'opacity-50' : ''} shrink-0`}>
                        {isCompleted ? (
                          <CheckCircle2 
                            className="h-6 w-6 sm:h-7 sm:w-7" 
                            style={{ color: habit.color || 'currentColor' }}
                          />
                        ) : (
                          <Circle className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-sm sm:text-base font-medium flex items-center">
                            {habit.icon && <span className="mr-2">{habit.icon}</span>}
                            <span className="truncate">{habit.name}</span>
                          </span>
                          
                          {habit.streak !== undefined && (
                            <div className="flex items-center mt-1 sm:mt-0 text-xs sm:text-sm text-muted-foreground">
                              <span className="whitespace-nowrap">
                                Current streak: <span className="font-medium text-foreground">{habit.streak} days</span>
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {habit.completionRate !== undefined && (
                          <div className="mt-2 sm:hidden">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>Progress</span>
                              <span>{habit.completionRate}%</span>
                            </div>
                            <Progress value={habit.completionRate} className="h-1.5" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {habit.completionRate !== undefined && (
                      <div className="hidden sm:flex items-center gap-3 shrink-0">
                        <div className="w-20">
                          <Progress value={habit.completionRate} className="h-2" />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {habit.completionRate}%
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Quick Visualization Teaser */}
            {hasEnoughData && (
              <Card className="mt-4 sm:mt-6">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Want to see your habit patterns over time?
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab("insights")}
                    className="w-full sm:w-auto"
                  >
                    <BarChart className="h-4 w-4 mr-2" />
                    View Insights
                  </Button>
                </CardContent>
              </Card>
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
        <div className="space-y-0">
          {habits.map((habit, index) => {
            const isCompleted = completionStatus[habit.id] || false;
            const isUpdating = updatingHabitId === habit.id;
            
            return (
              <div 
                key={habit.id} 
                className={`
                  flex items-center p-3 sm:p-4 hover:bg-accent/20 rounded-md 
                  cursor-pointer touch-manipulation transition-colors duration-200
                  ${index < habits.length - 1 ? 'border-b border-border/50' : ''}
                  ${isUpdating ? 'opacity-50' : ''}
                `}
                onClick={() => !isUpdating && toggleHabitCompletion(habit.id)}
              >
                <div className={`mr-3 sm:mr-4 ${isUpdating ? 'opacity-50' : ''} shrink-0`}>
                  {isCompleted ? (
                    <CheckCircle2 
                      className="h-6 w-6 sm:h-7 sm:w-7" 
                      style={{ color: habit.color || 'currentColor' }}
                    />
                  ) : (
                    <Circle className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm sm:text-base font-medium flex items-center">
                      {habit.icon && <span className="mr-2">{habit.icon}</span>}
                      <span className="truncate">{habit.name}</span>
                    </span>
                    
                    {habit.streak !== undefined && (
                      <Badge variant="outline" className="mt-2 sm:mt-0 self-start sm:self-center text-xs">
                        {habit.streak} day streak
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}