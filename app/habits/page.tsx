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
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Habit, Journal } from "@/lib/types/habits";

export default function HabitsPage() {
  const [inactiveHabits, setInactiveHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteHabitId, setDeleteHabitId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [journalData, setJournalData] = useState<Journal | null>(null);

  // Fetch habits
  const fetchHabits = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/habits");
      if (!response.ok) {
        throw new Error("Failed to fetch habits");
      }
      const data = await response.json();

      // Separate active and inactive habits
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
    } catch (error) {
      console.error("Error fetching habits:", error);
      toast({
        title: "Error",
        description: "Failed to load habits. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch journal data for today
  const fetchJournalData = async () => {
    try {
      const response = await fetch("/api/journal");
      if (!response.ok) {
        throw new Error("Failed to fetch journal data");
      }
      const data = await response.json();

      setJournalData({
        id: data.id || "some-default-id", // or data.id from API if available
        hasEntryToday: Boolean(data.todayEntry),
        todayEntry: data.todayEntry
          ? {
              id: data.todayEntry.id,
              habitLogs: data.todayEntry.habitLogs || [],
            }
          : undefined,
      });
    } catch (error) {
      console.error("Error fetching journal data:", error);
    }
  };

  // Fetch habit stats
  const fetchHabitStats = async () => {
    try {
      const updatedHabits = [...habits];

      for (const habit of updatedHabits) {
        const response = await fetch(`/api/habits/${habit.id}/stats`);
        if (response.ok) {
          const data = await response.json();
          habit.streak = data.stats.currentStreak;
          habit.completionRate = data.stats.completionRate;
          habit.streakData = data.dailyLogs;
        }
      }

      setHabits([...updatedHabits]);
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
    if (habits.length > 0) {
      fetchHabitStats();
    }
  }, [habits.length]);

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

      // Refresh data
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

      // Refresh data
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

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <CheckCircle2 className="h-6 w-6 mr-2" />
            Habits
          </h1>
          <p className="text-muted-foreground">
            Track and manage your daily habits
          </p>
        </div>

        <Button onClick={() => router.push("/habits/new")}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Habit
        </Button>
      </div>

      {/* Today's Habits */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Today's Habits
          </CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Loading habits...</p>
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
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="active">
                Active Habits ({habits.length})
              </TabsTrigger>
              <TabsTrigger value="inactive">
                Inactive ({inactiveHabits.length})
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 max-w-xs ml-auto">
              <Input
                placeholder="Search habits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <TabsContent value="active" className="mt-6">
            {loading ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Loading habits...</p>
              </div>
            ) : filteredHabits.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No active habits found</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push("/habits/new")}
                >
                  Create a new habit
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHabits.map((habit) => (
                  <Card key={habit.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                            style={{
                              backgroundColor:
                                habit.color || "hsl(var(--primary))",
                            }}
                          >
                            {habit.icon || "✓"}
                          </div>
                          <CardTitle className="text-lg">
                            {habit.name}
                          </CardTitle>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
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

                      {habit.description && (
                        <CardDescription className="line-clamp-2 mt-1">
                          {habit.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex flex-col">
                          <div className="text-xs text-muted-foreground">
                            Current streak
                          </div>
                          <div className="text-xl font-medium">
                            {habit.streak || 0} days
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <CircularProgress
                            value={habit.completionRate || 0}
                            size="md"
                            color={habit.color || "hsl(var(--primary))"}
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Last 30 days</span>
                          <span>{habit.completionRate || 0}% completed</span>
                        </div>
                        <Progress
                          value={habit.completionRate || 0}
                          className="h-1.5"
                        />
                      </div>
                    </CardContent>

                    <CardFooter className="bg-muted/50 py-2">
                      <Button
                        variant="ghost"
                        className="w-full text-muted-foreground text-sm"
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

          <TabsContent value="inactive" className="mt-6">
            {loading ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Loading habits...</p>
              </div>
            ) : filteredInactiveHabits.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  No inactive habits found
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInactiveHabits.map((habit) => (
                  <Card key={habit.id} className="opacity-75 overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                            style={{
                              backgroundColor:
                                habit.color || "hsl(var(--primary))",
                            }}
                          >
                            {habit.icon || "✓"}
                          </div>
                          <CardTitle className="text-lg">
                            {habit.name}
                          </CardTitle>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
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

                      {habit.description && (
                        <CardDescription className="line-clamp-2 mt-1">
                          {habit.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="text-sm text-muted-foreground mt-4">
                        This habit is currently inactive
                      </div>
                    </CardContent>

                    <CardFooter className="bg-muted/50 py-2">
                      <Button
                        variant="outline"
                        className="w-full"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete this habit and all associated
              tracking data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteHabit}>
              Delete Habit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
