// This updated version uses shadcn/ui components for a better dashboard
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ActivityHeatmap } from "../visualizations/activity-heatmap";
import { StreakCalendar } from "../visualizations/streak-calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, BookIcon, ChartBarIcon } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

type HabitSummary = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  streak: number;
  completionRate: number;
  streakData: {
    date: string;
    completed: boolean;
  }[];
};

type JournalSummary = {
  totalEntries: number;
  hasEntryToday: boolean;
  moodDistribution: Record<string, number>;
  recentMoods: string[];
  heatmap: {
    date: string;
    mood: string;
    count: number;
  }[];
};

type DashboardSummary = {
  habits: HabitSummary[];
  journal: JournalSummary;
};

export function DashboardContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/dashboard");

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">
            Error Loading Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{error}</p>
          <p className="mt-4 text-sm text-gray-600">
            Try refreshing the page or visiting your journal or habits pages
            directly.
          </p>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button asChild variant="outline">
            <Link href="/journal">Go to Journal</Link>
          </Button>
          <Button asChild>
            <Link href="/habits">Go to Habits</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Dashboard Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            Start by creating habits and journal entries to see your dashboard
            statistics.
          </p>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button asChild>
            <Link href="/journal">Create a Journal Entry</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/habits">Set Up Habits</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Get today's date in a readable format
  const today = new Date();
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedDate = dateFormatter.format(today);

  // Helper function to get mood emoji
  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case "happy":
        return "😊";
      case "sad":
        return "😔";
      case "angry":
        return "😠";
      case "anxious":
        return "😰";
      case "calm":
        return "😌";
      case "excited":
        return "🤩";
      case "tired":
        return "😴";
      default:
        return "😐";
    }
  };

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <div className="flex justify-between items-center">
        <TabsList>
          <TabsTrigger value="overview" className="flex gap-2 items-center">
            <ChartBarIcon className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="journal" className="flex gap-2 items-center">
            <BookIcon className="h-4 w-4" />
            <span>Journal & Habits</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex gap-2">
          {!summary.journal.hasEntryToday && (
            <Button asChild size="sm">
              <Link href="/journal">Write Today's Journal</Link>
            </Button>
          )}
          <Button asChild variant="outline" size="sm">
            <Link href="/habits">Manage Habits</Link>
          </Button>
        </div>
      </div>

      <TabsContent value="overview">
        {/* Welcome Section */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Welcome to Your Dashboard</CardTitle>
            <CardDescription>{formattedDate}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Today's status:</h3>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      summary.journal.hasEntryToday ? "default" : "outline"
                    }
                  >
                    {summary.journal.hasEntryToday
                      ? "Journal Entry ✓"
                      : "Journal Entry Pending"}
                  </Badge>
                  <Badge variant="outline">
                    {
                      summary.habits.filter((h) =>
                        h.streakData.find(
                          (d) =>
                            d.completed &&
                            d.date === new Date().toISOString().split("T")[0]
                        )
                      ).length
                    }
                    /{summary.habits.length} Habits Completed
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Overall stats:</h3>
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {summary.journal.totalEntries}
                    </p>
                    <p className="text-xs text-gray-500">Journal Entries</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {summary.habits.length}
                    </p>
                    <p className="text-xs text-gray-500">Active Habits</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {Math.max(...summary.habits.map((h) => h.streak))}
                    </p>
                    <p className="text-xs text-gray-500">Longest Streak</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Habits Overview */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Habit Streaks</CardTitle>
              <Button asChild variant="link" size="sm">
                <Link href="/habits">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {summary.habits.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-200 rounded-md">
                  <p className="mb-2">You haven't created any habits yet.</p>
                  <Button asChild variant="link">
                    <Link href="/habits">Create your first habit</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {summary.habits.map((habit) => (
                    <div
                      key={habit.id}
                      className="border border-gray-200 rounded-lg p-4"
                      style={{
                        borderLeftWidth: "4px",
                        borderLeftColor: habit.color || "#4299e1",
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{habit.icon}</span>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {habit.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>{habit.streak} day streak</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center">
                            <div className="w-24 mr-3">
                              <Progress
                                value={habit.completionRate}
                                className="h-2"
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {habit.completionRate}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <StreakCalendar
                          data={habit.streakData}
                          color={habit.color || undefined}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Journal Overview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Journal Stats</CardTitle>
              <Button asChild variant="link" size="sm">
                <Link href="/journal">View Journal</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-3 flex justify-between items-center">
                <div className="text-sm text-blue-800">Total entries</div>
                <div className="text-xl font-bold text-blue-800">
                  {summary.journal.totalEntries}
                </div>
              </div>

              {summary.journal.heatmap.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Activity Calendar
                  </h3>
                  <ActivityHeatmap
                    data={summary.journal.heatmap}
                    numWeeks={8}
                  />
                </div>
              )}

              {summary.journal.recentMoods.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Recent moods
                  </h3>
                  <div className="flex overflow-hidden">
                    {summary.journal.recentMoods
                      .slice(0, 7)
                      .map((mood, index) => (
                        <div
                          key={index}
                          className="w-10 h-10 flex items-center justify-center rounded-full text-xl border-2 border-white -mr-2"
                          style={{
                            backgroundColor: "#f3f4f6",
                            zIndex: 7 - index,
                          }}
                        >
                          {getMoodEmoji(mood)}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {Object.keys(summary.journal.moodDistribution).length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Mood distribution
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(summary.journal.moodDistribution)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 3)
                      .map(([mood, percentage]) => (
                        <div key={mood} className="flex items-center">
                          <span className="text-lg mr-2">
                            {getMoodEmoji(mood)}
                          </span>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs font-medium text-gray-700 capitalize">
                                {mood}
                              </span>
                              <span className="text-xs text-gray-500">
                                {percentage}%
                              </span>
                            </div>
                            <Progress value={percentage} className="h-1.5" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">Today's entry</div>
                  <div>
                    {summary.journal.hasEntryToday ? (
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 hover:bg-green-100"
                      >
                        Completed
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                      >
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips and resources section */}
        <Card className="mt-6">
          <CardHeader className="pb-2">
            <CardTitle>Tips & Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="text-xl">📝</div>
                  <CardTitle className="text-base">Journaling Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Writing for just 5 minutes a day can improve mental clarity
                    and reduce stress.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <div className="text-xl">⏱️</div>
                  <CardTitle className="text-base">Building Habits</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Start small and be consistent. It takes about 66 days to
                    form a new habit.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <div className="text-xl">📊</div>
                  <CardTitle className="text-base">Track Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Regularly reviewing your journal entries helps identify
                    patterns and progress.
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="journal">
        <Card>
          <CardHeader>
            <CardTitle>Journal & Habit Activity</CardTitle>
            <CardDescription>
              Track your journaling consistency and habit performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Combined content for journal entries and habits */}
            <div className="space-y-6">
              {/* Journal stats section */}
              <div>
                <h3 className="text-sm font-medium mb-3">Journal Activity</h3>
                {summary.journal.heatmap.length > 0 ? (
                  <ActivityHeatmap
                    data={summary.journal.heatmap}
                    numWeeks={14}
                  />
                ) : (
                  <p className="text-sm text-gray-500">
                    Not enough data to display activity
                  </p>
                )}
              </div>

              {/* Habits performance section */}
              <div>
                <h3 className="text-sm font-medium mb-3">Habit Performance</h3>
                {summary.habits.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-2">No habits tracked yet</p>
                    <Button asChild>
                      <Link href="/habits">Add your first habit</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {summary.habits.map((habit) => (
                      <div key={habit.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{habit.icon}</span>
                            <h3 className="font-medium">{habit.name}</h3>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <p className="text-sm text-gray-500">
                                Current Streak
                              </p>
                              <p
                                className="text-xl font-bold"
                                style={{ color: habit.color || "#4299e1" }}
                              >
                                {habit.streak}
                              </p>
                            </div>
                            <div className="h-8 w-px bg-gray-200"></div>
                            <div className="text-center">
                              <p className="text-sm text-gray-500">
                                Completion
                              </p>
                              <p className="text-xl font-bold">
                                {habit.completionRate}%
                              </p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <StreakCalendar
                            data={habit.streakData}
                            color={habit.color || undefined}
                            days={30}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
