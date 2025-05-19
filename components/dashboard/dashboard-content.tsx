"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachMonthOfInterval,
  isSameDay,
  subMonths,
  subDays,
} from "date-fns";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarIcon,
  BookIcon,
  ChartBarIcon,
  PieChartIcon,
  BarChart2,
  TrendingUpIcon,
  BarChart2Icon,
  ListFilter,
  ArrowUpIcon,
  ArrowDownIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  Scatter,
  ScatterChart,
  ComposedChart,
} from "recharts";

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
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // When summary data is available, set the first habit as selected by default
    if (summary && summary.habits.length > 0 && !selectedHabit) {
      setSelectedHabit(summary.habits[0].id);
    }
  }, [summary, selectedHabit]);

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

  // Custom tooltip for mood chart
  const MoodTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card p-2 border border-gray-200 rounded shadow-sm text-xs">
          <p className="font-medium">{label}</p>
          <p className="flex items-center">
            <span className="mr-1">Mood:</span>
            <span>{getMoodEmoji(data.mood)}</span>
            <span className="ml-1 capitalize">{data.mood}</span>
          </p>
        </div>
      );
    }
    return null;
  };

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
  const formattedDate = format(today, "EEEE, MMMM d, yyyy");

  const selectedHabitData = summary.habits.find((h) => h.id === selectedHabit);

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
            <span>Journal</span>
          </TabsTrigger>
          <TabsTrigger value="habits" className="flex gap-2 items-center">
            <BarChart2 className="h-4 w-4" />
            <span>Habits</span>
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

      {/* OVERVIEW TAB */}
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
                      {Math.max(
                        ...(summary.habits.map((h) => h.streak) || [0])
                      )}
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
              <CardTitle>Habit Completion Rates</CardTitle>
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
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={summary.habits.sort(
                          (a, b) => b.completionRate - a.completionRate
                        )}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={100}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          formatter={(value) => [
                            `${value}%`,
                            "Completion Rate",
                          ]}
                          labelFormatter={(name) => name}
                        />
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                          opacity={0.3}
                        />
                        <Bar dataKey="completionRate" radius={[0, 4, 4, 0]}>
                          {summary.habits.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color || "#4299e1"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {summary.habits.slice(0, 4).map((habit) => (
                      <div
                        key={habit.id}
                        className="border border-gray-200 rounded-lg p-3 text-center"
                        style={{
                          borderLeftWidth: "3px",
                          borderLeftColor: habit.color || "#4299e1",
                        }}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-2xl mb-1">{habit.icon}</span>
                          <p className="text-sm font-medium">
                            {habit.streak} day streak
                          </p>
                          <p className="text-xs text-gray-500">{habit.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mood Overview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Mood Trends</CardTitle>
              <Button asChild variant="link" size="sm">
                <Link href="/journal">View Journal</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(summary.journal.moodDistribution).length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(
                          summary.journal.moodDistribution
                        ).map(([mood, value]) => ({
                          name: mood,
                          value: value,
                          emoji: getMoodEmoji(mood),
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        labelLine={true}
                        label={({ name, percent }) =>
                          `${getMoodEmoji(name)} ${(percent * 100).toFixed(0)}%`
                        }
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(summary.journal.moodDistribution).map(
                          ([mood, _], index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                mood === "happy"
                                  ? "#10B981"
                                  : mood === "excited"
                                  ? "#F59E0B"
                                  : mood === "calm"
                                  ? "#60A5FA"
                                  : mood === "neutral"
                                  ? "#9CA3AF"
                                  : mood === "tired"
                                  ? "#6B7280"
                                  : mood === "anxious"
                                  ? "#F97316"
                                  : mood === "sad"
                                  ? "#3B82F6"
                                  : "#EF4444"
                              }
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value}%`, "of entries"]}
                        labelFormatter={(value) =>
                          value.charAt(0).toUpperCase() + value.slice(1)
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>Not enough journal entries to show mood distribution.</p>
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
            </CardContent>
          </Card>
        </div>

        {/* Habit and Journal Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Habit Weekday Performance - Removed */}
          {/* Habit Categories - Removed */}
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

      {/* JOURNAL TAB */}
      <TabsContent value="journal">
        <Card>
          <CardHeader>
            <CardTitle>Journal Activity</CardTitle>
            <CardDescription>
              Track your journaling consistency and mood patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Journal activity section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium">Journal Activity</h3>
                  <Badge variant="outline" className="px-2 py-1 text-xs">
                    {summary.journal.totalEntries} entries total
                  </Badge>
                </div>
                {summary.journal.heatmap.length > 0 ? (
                  <ActivityHeatmap
                    data={summary.journal.heatmap}
                    numWeeks={14}
                  />
                ) : (
                  <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-md">
                    <p>Start journaling to see your activity patterns</p>
                  </div>
                )}
              </div>

              {/* Mood analysis section */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-4">Mood Analysis</h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Mood Distribution Pie Chart */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-2">
                      Mood Distribution
                    </h4>
                    {Object.keys(summary.journal.moodDistribution).length >
                    0 ? (
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Object.entries(
                                summary.journal.moodDistribution
                              ).map(([mood, value]) => ({
                                name: mood,
                                value: value,
                              }))}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) =>
                                `${name} ${(percent * 100).toFixed(0)}%`
                              }
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {Object.entries(
                                summary.journal.moodDistribution
                              ).map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    entry[0] === "happy"
                                      ? "#10B981"
                                      : entry[0] === "excited"
                                      ? "#F59E0B"
                                      : entry[0] === "calm"
                                      ? "#60A5FA"
                                      : entry[0] === "neutral"
                                      ? "#9CA3AF"
                                      : entry[0] === "tired"
                                      ? "#6B7280"
                                      : entry[0] === "anxious"
                                      ? "#F97316"
                                      : entry[0] === "sad"
                                      ? "#3B82F6"
                                      : "#EF4444"
                                  }
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value) => [`${value}%`, "of entries"]}
                              labelFormatter={(value) =>
                                value.charAt(0).toUpperCase() + value.slice(1)
                              }
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-48 flex items-center justify-center bg-gray-50 rounded-md">
                        <p className="text-gray-500">No mood data available</p>
                      </div>
                    )}
                  </div>

                  {/* Mood Trend Line Chart */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-2">
                      Recent Mood Trends
                    </h4>
                    {summary.journal.totalEntries > 0 ? (
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={summary.journal.heatmap
                              .slice(-30)
                              .map((entry) => ({
                                date: format(parseISO(entry.date), "MM/dd"),
                                mood: entry.mood,
                                // Convert moods to numerical values for visualization
                                value:
                                  entry.mood === "happy"
                                    ? 5
                                    : entry.mood === "excited"
                                    ? 4
                                    : entry.mood === "calm"
                                    ? 3
                                    : entry.mood === "neutral"
                                    ? 2
                                    : entry.mood === "tired"
                                    ? 1
                                    : entry.mood === "anxious"
                                    ? 0
                                    : entry.mood === "sad"
                                    ? -1
                                    : -2,
                              }))}
                          >
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 10 }}
                              tickFormatter={(value, index) =>
                                index % 3 === 0 ? value : ""
                              }
                            />
                            <YAxis
                              domain={[-3, 6]}
                              tick={false}
                              axisLine={false}
                            />
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              opacity={0.2}
                            />
                            <Tooltip content={<MoodTooltip />} />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#8884d8"
                              strokeWidth={2}
                              dot={{ stroke: "#8884d8", r: 1 }}
                              activeDot={{
                                r: 5,
                                stroke: "#8884d8",
                                strokeWidth: 1,
                              }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-48 flex items-center justify-center bg-gray-50 rounded-md">
                        <p className="text-gray-500">
                          Not enough entries for mood trends
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Journal stats and insights */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-3">Journal Insights</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl text-center font-bold">
                        {summary.journal.totalEntries}
                      </div>
                      <p className="text-xs text-center text-gray-500 mt-1">
                        Total Journal Entries
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl text-center font-bold">
                        {summary.journal.hasEntryToday ? "Yes" : "No"}
                      </div>
                      <p className="text-xs text-center text-gray-500 mt-1">
                        Entry Today
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl text-center font-bold flex justify-center">
                        {summary.journal.recentMoods[0]
                          ? getMoodEmoji(summary.journal.recentMoods[0])
                          : "—"}
                      </div>
                      <p className="text-xs text-center text-gray-500 mt-1">
                        Most Recent Mood
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* HABITS TAB */}
      <TabsContent value="habits">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Habit Performance</CardTitle>
                <CardDescription>
                  Detailed analysis of your habit tracking
                </CardDescription>
              </div>

              <Select
                value={selectedHabit || ""}
                onValueChange={setSelectedHabit}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select a habit" />
                </SelectTrigger>
                <SelectContent>
                  {summary.habits.map((habit) => (
                    <SelectItem key={habit.id} value={habit.id}>
                      <div className="flex items-center">
                        <span className="mr-2">{habit.icon || "🎯"}</span>
                        <span>{habit.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {summary.habits.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-2">No habits tracked yet</p>
                <Button asChild>
                  <Link href="/habits">Add your first habit</Link>
                </Button>
              </div>
            ) : selectedHabitData ? (
              <div className="space-y-6">
                {/* Selected Habit Detail */}
                <div className="px-4 py-6 border border-gray-100 bg-card rounded-lg shadow-sm">
                  <div className="flex items-center mb-6">
                    <span
                      className="text-3xl mr-4"
                      style={{ color: selectedHabitData.color || "#4299e1" }}
                    >
                      {selectedHabitData.icon}
                    </span>
                    <div>
                      <h3 className="font-medium text-xl mb-1">
                        {selectedHabitData.name}
                      </h3>
                      <div className="flex items-center text-sm space-x-3">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
                          <span className="text-gray-700">
                            {selectedHabitData.streak} day streak
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></div>
                          <span className="text-gray-700">
                            {selectedHabitData.completionRate}% completion
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Streak Calendar */}
                  <div className="mt-2">
                    <StreakCalendar
                      data={selectedHabitData.streakData}
                      color={selectedHabitData.color || undefined}
                      days={30}
                    />
                  </div>
                </div>

                {/* Habit Comparison */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-base font-medium mb-3">
                    Habit Comparison
                  </h3>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={summary.habits}
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      >
                        <CartesianGrid stroke="#f5f5f5" />
                        <XAxis dataKey="name" scale="band" />
                        <YAxis
                          yAxisId="left"
                          orientation="left"
                          domain={[0, 100]}
                          label={{
                            value: "Completion Rate (%)",
                            angle: -90,
                            position: "insideLeft",
                            style: {
                              textAnchor: "middle",
                              fontSize: 12,
                              fill: "#888",
                            },
                          }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          domain={[0, "dataMax + 5"]}
                          label={{
                            value: "Streak (days)",
                            angle: 90,
                            position: "insideRight",
                            style: {
                              textAnchor: "middle",
                              fontSize: 12,
                              fill: "#888",
                            },
                          }}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="completionRate"
                          name="Completion Rate"
                          yAxisId="left"
                          barSize={20}
                          fill="#8884d8"
                          radius={[4, 4, 0, 0]}
                        />
                        <Line
                          type="monotone"
                          dataKey="streak"
                          name="Current Streak"
                          yAxisId="right"
                          stroke="#ff7300"
                          strokeWidth={2}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Habit Stack Recommendations */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-base font-medium mb-3">
                    Habit Stacking Recommendations
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium text-sm flex items-center mb-2">
                          <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                          Best Performing Habits
                        </h4>
                        <div className="space-y-2">
                          {summary.habits
                            .sort((a, b) => b.completionRate - a.completionRate)
                            .slice(0, 2)
                            .map((habit) => (
                              <div key={habit.id} className="flex items-center">
                                <span className="text-xl mr-2">
                                  {habit.icon}
                                </span>
                                <div>
                                  <p className="text-sm font-medium">
                                    {habit.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {habit.completionRate}% completion
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium text-sm flex items-center mb-2">
                          <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                          Needs Improvement
                        </h4>
                        <div className="space-y-2">
                          {summary.habits
                            .sort((a, b) => a.completionRate - b.completionRate)
                            .slice(0, 2)
                            .map((habit) => (
                              <div key={habit.id} className="flex items-center">
                                <span className="text-xl mr-2">
                                  {habit.icon}
                                </span>
                                <div>
                                  <p className="text-sm font-medium">
                                    {habit.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {habit.completionRate}% completion
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Habit Stacking Tip:</strong> Try connecting your
                      lower-performing habits with your most consistent ones.
                      For example, do your{" "}
                      {
                        summary.habits.sort(
                          (a, b) => a.completionRate - b.completionRate
                        )[0]?.name
                      }
                      right after your{" "}
                      {
                        summary.habits.sort(
                          (a, b) => b.completionRate - a.completionRate
                        )[0]?.name
                      }
                      .
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">
                  Select a habit to view detailed statistics
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
