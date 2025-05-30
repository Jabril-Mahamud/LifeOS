"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  PlusCircle,
  Edit,
  Trash2,
  MoreHorizontal,
  Filter,
  Calendar,
  BarChart4,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
  BookOpen
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HabitTracker } from "@/components/habits/habit-tracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CircularProgress } from "@/components/ui/circular-progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Habit, HabitTrackerJournal, HabitWithStats, Journal } from "@/lib/types/";

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export default function HabitsPage() {
  const [habits, setHabits] = useState<HabitWithStats[]>([]);
  const [inactiveHabits, setInactiveHabits] = useState<HabitWithStats[]>([]);
  const [journalData, setJournalData] = useState<HabitTrackerJournal | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteHabitId, setDeleteHabitId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const router = useRouter();

  // Fetch habits with better error handling
  const fetchHabits = async (isRetry = false) => {
    if (isRetry) {
      setRetryCount(prev => prev + 1);
      setIsRetrying(true);
    } else {
      setLoadingState('loading');
    }
    
    setError(null);
    
    try {
      const response = await fetch("/api/habits");
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Habits not found. This might be your first time here!");
        } else if (response.status >= 500) {
          throw new Error("Server error. Please try again later.");
        } else {
          throw new Error(`Failed to fetch habits (${response.status})`);
        }
      }
      
      const data = await response.json();
      
      if (!data || !Array.isArray(data.habits)) {
        throw new Error("Invalid data format received from server");
      }

      const active: Habit[] = [];
      const inactive: Habit[] = [];

      data.habits.forEach((habit: Habit) => {
        if (habit.active) {
          active.push(habit);
        } else {
          inactive.push(habit);
        }
      });

      setHabits(active);
      setInactiveHabits(inactive);
      setLoadingState('success');
      setRetryCount(0);
      setIsRetrying(false);
    } catch (error) {
      console.error("Error fetching habits:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
      setLoadingState('error');
      setIsRetrying(false);
      
      setHabits([]);
      setInactiveHabits([]);
    }
  };

  // Fetch journal data with error handling
  const fetchJournalData = async () => {
    try {
      const response = await fetch("/api/journal");
      
      if (!response.ok) {
        console.warn("Could not fetch journal data:", response.status);
        return;
      }
      
      const data = await response.json();

      setJournalData({
        id: data.id || "temp-id",
        hasEntryToday: Boolean(data.todayEntry),
        todayEntry: data.todayEntry
          ? {
              id: data.todayEntry.id,
              habitLogs: Array.isArray(data.todayEntry.habitLogs) ? data.todayEntry.habitLogs : [],
            }
          : undefined,
      });
    } catch (error) {
      console.error("Error fetching journal data:", error);
    }
  };

  // Fetch habit stats with error handling
  const fetchHabitStats = async () => {
    if (habits.length === 0) return;
    
    try {
      const updatedHabits = [...habits];
      let hasErrors = false;

      for (const habit of updatedHabits) {
        try {
          const response = await fetch(`/api/habits/${habit.id}/stats`);
          if (response.ok) {
            const data = await response.json();
            if (data.stats) {
              habit.streak = data.stats.currentStreak || 0;
              habit.completionRate = data.stats.completionRate || 0;
              habit.streakData = Array.isArray(data.dailyLogs) ? data.dailyLogs : [];
            }
          } else {
            hasErrors = true;
            console.warn(`Failed to fetch stats for habit ${habit.id}`);
          }
        } catch (error) {
          hasErrors = true;
          console.error(`Error fetching stats for habit ${habit.id}:`, error);
        }
      }

      setHabits([...updatedHabits]);
      
      if (hasErrors) {
        toast({
          title: "Warning",
          description: "Some habit statistics could not be loaded",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching habit stats:", error);
    }
  };

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      await fetchHabits();
      await fetchJournalData();
    };
    loadData();
  }, []);

  // Fetch stats when habits are loaded
  useEffect(() => {
    if (habits.length > 0 && loadingState === 'success') {
      fetchHabitStats();
    }
  }, [habits.length, loadingState]);

  // Toggle habit active status
  const toggleHabitActive = async (habitId: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update habit status");
      }

      toast({
        description: !currentActive
          ? "Habit activated successfully"
          : "Habit deactivated successfully",
      });

      fetchHabits();
    } catch (error) {
      console.error("Error updating habit status:", error);
      toast({
        title: "Error",
        description: "Failed to update habit status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Delete habit
  const deleteHabit = async () => {
    if (!deleteHabitId) return;

    try {
      const response = await fetch(`/api/habits/${deleteHabitId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete habit");
      }

      toast({
        description: "Habit deleted successfully",
      });

      fetchHabits();
    } catch (error) {
      console.error("Error deleting habit:", error);
      toast({
        title: "Error",
        description: "Failed to delete habit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteHabitId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Filter habits by search term
  const filteredHabits = habits.filter(
    (habit) =>
      habit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (habit.description &&
        habit.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredInactiveHabits = inactiveHabits.filter(
    (habit) =>
      habit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (habit.description &&
        habit.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Error state
  if (loadingState === 'error') {
    return (
      <div className="container mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center">
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Habits
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage your daily habits
            </p>
          </div>
          <Button onClick={() => router.push("/habits/new")} className="w-full sm:w-auto">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Habit
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-sm">{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchHabits(true)}
              disabled={isRetrying}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {retryCount > 0 ? `Retry (${retryCount})` : 'Retry'}
            </Button>
          </AlertDescription>
        </Alert>

        {/* Fallback empty state */}
        <Card className="text-center py-8 sm:py-10">
          <CardContent>
            <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-base sm:text-lg font-medium mb-2">Unable to load habits</h3>
            <p className="text-sm text-muted-foreground mb-4">
              There was a problem loading your habits. You can still create a new one.
            </p>
            <Button onClick={() => router.push("/habits/new")} className="w-full sm:w-auto">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create your first habit
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loadingState === 'loading') {
    return (
      <div className="container mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center">
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Habits
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage your daily habits
            </p>
          </div>
          <Button disabled className="w-full sm:w-auto">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Habit
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="h-5 sm:h-6 bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-14 sm:h-16 bg-muted animate-pulse rounded" />
              <div className="h-14 sm:h-16 bg-muted animate-pulse rounded" />
              <div className="h-14 sm:h-16 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state (may have empty data)
  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center">
            <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            Habits
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage your daily habits
          </p>
        </div>

        <Button onClick={() => router.push("/habits/new")} className="w-full sm:w-auto">
          <PlusCircle className="h-4 w-4 mr-2" />
          New Habit
        </Button>
      </div>

      {/* Today's Habits */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Today's Habits
          </CardTitle>
          <CardDescription className="text-sm">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {habits.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-2">No habits to track yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first habit to start building positive routines
              </p>
              <Button onClick={() => router.push("/habits/new")} className="w-full sm:w-auto">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create your first habit
              </Button>
            </div>
          ) : (
            <HabitTracker
              habits={habits}
              journalData={journalData || undefined}
              showTitle={false}
              onHabitsUpdated={() => {
                fetchJournalData();
                fetchHabitStats();
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* All Habits */}
      <div className="flex justify-between items-center">
        <Tabs defaultValue="active" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-2">
              <TabsTrigger value="active" className="text-sm">
                Active ({habits.length})
              </TabsTrigger>
              <TabsTrigger value="inactive" className="text-sm">
                Inactive ({inactiveHabits.length})
              </TabsTrigger>
            </TabsList>

            <div className="w-full sm:max-w-xs">
              <Input
                placeholder="Search habits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-sm"
              />
            </div>
          </div>

          <TabsContent value="active" className="mt-4 sm:mt-6">
            {filteredHabits.length === 0 ? (
              <div className="text-center py-8 sm:py-10">
                {searchTerm ? (
                  <>
                    <h3 className="text-base sm:text-lg font-medium mb-2">No habits found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      No habits match your search "{searchTerm}"
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setSearchTerm("")}
                      className="w-full sm:w-auto"
                    >
                      Clear search
                    </Button>
                  </>
                ) : habits.length === 0 ? (
                  <>
                    <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-base sm:text-lg font-medium mb-2">No active habits</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start building positive routines by creating your first habit
                    </p>
                    <Button onClick={() => router.push("/habits/new")} className="w-full sm:w-auto">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create your first habit
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-base sm:text-lg font-medium mb-2">All habits are inactive</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Activate some habits to start tracking them
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/habits/new")}
                      className="w-full sm:w-auto"
                    >
                      Create new habit
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredHabits.map((habit) => (
                  <Card key={habit.id} className="overflow-hidden touch-manipulation">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-sm sm:text-base shrink-0"
                            style={{
                              backgroundColor:
                                habit.color || "hsl(var(--primary))",
                            }}
                          >
                            {habit.icon || "✓"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-sm sm:text-base truncate">
                              {habit.name}
                            </CardTitle>
                            {habit.description && (
                              <CardDescription className="line-clamp-2 mt-1 text-xs sm:text-sm">
                                {habit.description}
                              </CardDescription>
                            )}
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0 touch-manipulation"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/habits/${habit.id}/edit`)
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() =>
                                toggleHabitActive(habit.id, habit.active)
                              }
                            >
                              <EyeOff className="h-4 w-4 mr-2" />
                              Deactivate
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              className="text-red-500 focus:text-red-500"
                              onClick={() => {
                                setDeleteHabitId(habit.id);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex flex-col">
                          <div className="text-xs text-muted-foreground">
                            Current streak
                          </div>
                          <div className="text-lg sm:text-xl font-medium">
                            {habit.streak || 0} days
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <CircularProgress
                            value={habit.completionRate || 0}
                            size="sm"
                            color={habit.color || "hsl(var(--primary))"}
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-2">
                          <span>Last 30 days</span>
                          <span>{Math.round(habit.completionRate || 0)}% completed</span>
                        </div>
                        <Progress
                          value={habit.completionRate || 0}
                          className="h-2"
                        />
                      </div>
                    </CardContent>

                    <CardFooter className="bg-muted/50 py-3">
                      <Button
                        variant="ghost"
                        className="w-full text-muted-foreground text-sm touch-manipulation"
                        onClick={() => router.push(`/habits/${habit.id}`)}
                      >
                        <BarChart4 className="h-4 w-4 mr-2" />
                        View Statistics
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="inactive" className="mt-4 sm:mt-6">
            {filteredInactiveHabits.length === 0 ? (
              <div className="text-center py-8 sm:py-10">
                {searchTerm ? (
                  <>
                    <h3 className="text-base sm:text-lg font-medium mb-2">No inactive habits found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      No inactive habits match your search "{searchTerm}"
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setSearchTerm("")}
                      className="w-full sm:w-auto"
                    >
                      Clear search
                    </Button>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-base sm:text-lg font-medium mb-2">No inactive habits</h3>
                    <p className="text-sm text-muted-foreground">
                      All your habits are currently active
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredInactiveHabits.map((habit) => (
                  <Card key={habit.id} className="opacity-75 overflow-hidden touch-manipulation">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-sm sm:text-base shrink-0"
                            style={{
                              backgroundColor:
                                habit.color || "hsl(var(--primary))",
                            }}
                          >
                            {habit.icon || "✓"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-sm sm:text-base truncate">
                              {habit.name}
                            </CardTitle>
                            {habit.description && (
                              <CardDescription className="line-clamp-2 mt-1 text-xs sm:text-sm">
                                {habit.description}
                              </CardDescription>
                            )}
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0 touch-manipulation"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/habits/${habit.id}/edit`)
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() =>
                                toggleHabitActive(habit.id, habit.active)
                              }
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Activate
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              className="text-red-500 focus:text-red-500"
                              onClick={() => {
                                setDeleteHabitId(habit.id);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="text-sm text-muted-foreground mt-4">
                        This habit is currently inactive
                      </div>
                    </CardContent>

                    <CardFooter className="bg-muted/50 py-3">
                      <Button
                        variant="outline"
                        className="w-full touch-manipulation"
                        onClick={() =>
                          toggleHabitActive(habit.id, habit.active)
                        }
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Reactivate
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete this habit and all associated
              tracking data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteHabit}
              className="w-full sm:w-auto"
            >
              Delete Habit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}