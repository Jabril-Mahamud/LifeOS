"use client";

import { useState, useEffect } from "react";
import {
  format,
  parseISO,
  eachDayOfInterval,
  subDays,
  isSameDay,
  startOfMonth,
  endOfMonth,
  differenceInDays,
  startOfDay,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie,
  RadialBarChart,
  RadialBar,
  ReferenceLine,
} from "recharts";

import {
  TrendingUpIcon,
  CalendarIcon,
  BarChart3,
  PieChartIcon,
} from "lucide-react";

type HabitStreakProps = {
  habitId: string;
  habitName: string;
  habitIcon?: string | null;
  habitColor?: string | null;
};

type HabitLogEntry = {
  date: string;
  completed: boolean;
  notes?: string | null;
};

type HabitStats = {
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalDays: number;
  completedDays: number;
};

export function HabitStreak({
  habitId,
  habitName,
  habitIcon = "🎯",
  habitColor = "#4299e1", // Default blue color as fallback
}: HabitStreakProps) {
  // Ensure habitColor is never null
  const safeColor = habitColor || "#4299e1";

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [habitLogs, setHabitLogs] = useState<HabitLogEntry[]>([]);
  const [stats, setStats] = useState<HabitStats>({
    currentStreak: 0,
    longestStreak: 0,
    completionRate: 0,
    totalDays: 0,
    completedDays: 0,
  });

  // Data for visualizations
  const [streakData, setStreakData] = useState<any[]>([]);
  const [weekdayData, setWeekdayData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    fetchHabitData();
  }, [habitId]);

  useEffect(() => {
    // Process data for visualizations when habit logs change
    if (habitLogs.length > 0) {
      processVisualizationData();
    }
  }, [habitLogs]);

  async function fetchHabitData() {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/habits/${habitId}/stats`);

      if (!response.ok) {
        throw new Error("Failed to fetch habit statistics");
      }

      const data = await response.json();
      setHabitLogs(data.dailyLogs || []);
      setStats(
        data.stats || {
          currentStreak: 0,
          longestStreak: 0,
          completionRate: 0,
          totalDays: 0,
          completedDays: 0,
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching habit stats:", err);
    } finally {
      setIsLoading(false);
    }
  }

  function processVisualizationData() {
    // Process streak data (last 30 days, showing streak status)
    const last30Days = habitLogs.slice(-30);
    const streakChartData = last30Days.map((log, index) => {
      const date = parseISO(log.date);
      return {
        name: format(date, "MMM d"),
        date: log.date,
        value: log.completed ? 1 : 0,
        streak: calculateStreakAt(index, last30Days),
      };
    });
    setStreakData(streakChartData);

    // Process weekday data (completion rate by day of week)
    const weekdays = [
      { name: "Sun", value: 0, total: 0 },
      { name: "Mon", value: 0, total: 0 },
      { name: "Tue", value: 0, total: 0 },
      { name: "Wed", value: 0, total: 0 },
      { name: "Thu", value: 0, total: 0 },
      { name: "Fri", value: 0, total: 0 },
      { name: "Sat", value: 0, total: 0 },
    ];

    habitLogs.forEach((log) => {
      const date = parseISO(log.date);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      weekdays[dayOfWeek].total += 1;
      if (log.completed) {
        weekdays[dayOfWeek].value += 1;
      }
    });

    const weekdayChartData = weekdays.map((day) => ({
      ...day,
      completionRate:
        day.total > 0 ? Math.round((day.value / day.total) * 100) : 0,
    }));
    setWeekdayData(weekdayChartData);

    // Process monthly data (last 3 months)
    const monthlyChartData = [];
    const today = startOfDay(new Date());
    let monthEnd = endOfMonth(today);

    for (let i = 0; i < 3; i++) {
      const monthStart = startOfMonth(monthEnd);
      const monthName = format(monthStart, "MMM");

      // Filter logs for current month
      const monthLogs = habitLogs.filter((log) => {
        const logDate = parseISO(log.date);
        return logDate >= monthStart && logDate <= monthEnd;
      });

      const completed = monthLogs.filter((log) => log.completed).length;
      const total = monthLogs.length;

      monthlyChartData.unshift({
        name: monthName,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        completed,
        total,
      });

      // Go to previous month
      monthEnd = subDays(monthStart, 1);
    }

    setMonthlyData(monthlyChartData);
  }

  // Helper function to calculate streak value at a specific index
  function calculateStreakAt(index: number, logs: HabitLogEntry[]): number {
    let streak = 0;

    // Count backwards from this index
    for (let i = index; i >= 0; i--) {
      if (logs[i].completed) {
        streak++;
      } else {
        break; // Streak broken
      }
    }

    return streak;
  }

  // Custom tooltip for streak chart
  const StreakTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm text-xs">
          <p className="font-medium">{label}</p>
          <p className="text-gray-600">
            {data.value ? "Completed" : "Not Completed"}
          </p>
          {data.value ? (
            <p className="text-green-600">Streak: {data.streak} day(s)</p>
          ) : null}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for weekday chart
  const WeekdayTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm text-xs">
          <p className="font-medium">{label}</p>
          <p className="text-gray-600">
            Completed {data.value} of {data.total} times
          </p>
          <p className="text-green-600">Success rate: {data.completionRate}%</p>
        </div>
      );
    }
    return null;
  };

  // Add this validation when parsing dates in the streak calculations
  const parseAndValidateDate = (dateStr: string): Date => {
    const parsed = parseISO(dateStr);
    if (isNaN(parsed.getTime())) {
      console.warn(`Invalid date in streak calculation: ${dateStr}`);
      return new Date();
    }
    return parsed;
  };

  // Then use it in the getCompletionForDay function
  const getCompletionForDay = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const entry = habitLogs.find((item: HabitLogEntry) => {
      const itemDate =
        typeof item.date === "string"
          ? item.date
          : format(item.date, "yyyy-MM-dd");
      return itemDate === dayStr;
    });
    return entry?.completed || false;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <div className="space-y-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="py-4">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center gap-2">
        <span className="text-2xl">{habitIcon}</span>
        <CardTitle className="text-base">{habitName}</CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="streak">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="streak" className="flex items-center gap-1.5">
              <TrendingUpIcon className="h-3.5 w-3.5" />
              <span>Streak</span>
            </TabsTrigger>
            <TabsTrigger value="weekday" className="flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              <span>By Day</span>
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-1.5">
              <PieChartIcon className="h-3.5 w-3.5" />
              <span>Monthly</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="streak" className="mt-0">
            <div className="space-y-4">
              {/* Streaks Summary */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-md">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: safeColor }}
                  >
                    {stats.currentStreak}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Current Streak
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-md">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: safeColor }}
                  >
                    {stats.longestStreak}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Longest Streak
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-md">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: safeColor }}
                  >
                    {stats.completionRate}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Completion Rate
                  </div>
                </div>
              </div>

              {/* Streak Line Chart */}
              <div className="mt-4 pt-2">
                <div className="text-sm font-medium mb-2">
                  Last 30 Days Performance
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={streakData}
                      margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value, index) =>
                          index % 5 === 0 ? value : ""
                        }
                        axisLine={{ stroke: "#E5E7EB" }}
                      />
                      <YAxis domain={[0, 1]} tick={false} axisLine={false} />
                      <Tooltip content={<StreakTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={safeColor}
                        strokeWidth={2}
                        dot={{
                          stroke: safeColor,
                          strokeWidth: 2,
                          r: 4,
                          fill: "white",
                        }}
                        activeDot={{
                          stroke: safeColor,
                          strokeWidth: 2,
                          r: 6,
                          fill: safeColor,
                        }}
                      />
                      <ReferenceLine
                        y={0.5}
                        stroke="#E5E7EB"
                        strokeDasharray="3 3"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Current streak visual indicator */}
                {stats.currentStreak > 0 && (
                  <div className="mt-2 p-2 bg-green-50 rounded-md flex items-center">
                    <Badge className="mr-2 bg-green-100 text-green-800 hover:bg-green-100">
                      {stats.currentStreak} days
                    </Badge>
                    <span className="text-sm text-green-700">
                      Current streak - keep it going!
                    </span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="weekday" className="mt-0">
            <div className="space-y-3">
              <div className="text-sm font-medium mb-1">
                Completion Rate by Day of Week
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weekdayData}
                    margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      axisLine={{ stroke: "#E5E7EB" }}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                      domain={[0, 100]}
                    />
                    <Tooltip content={<WeekdayTooltip />} />
                    <Bar dataKey="completionRate" radius={[4, 4, 0, 0]}>
                      {weekdayData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.completionRate > 0 ? safeColor : "#F3F4F6"
                          }
                          fillOpacity={0.5 + entry.completionRate / 200} // Vary opacity based on value
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Insight about best/worst day */}
              {weekdayData.length > 0 && (
                <div className="mt-2 p-2 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-700">
                    {(() => {
                      const bestDay = [...weekdayData].sort(
                        (a, b) => b.completionRate - a.completionRate
                      )[0];
                      const worstDay = [...weekdayData]
                        .filter((d) => d.total > 0)
                        .sort((a, b) => a.completionRate - b.completionRate)[0];

                      if (bestDay && bestDay.total > 0) {
                        return `Your best day is ${bestDay.name} with ${bestDay.completionRate}% completion rate.`;
                      }
                      return "Track this habit consistently to see patterns by day of week.";
                    })()}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="mt-0">
            <div className="space-y-3">
              <div className="text-sm font-medium mb-1">
                Monthly Performance
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="30%"
                    outerRadius="90%"
                    data={monthlyData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar
                      background
                      dataKey="completionRate"
                      cornerRadius={10}
                    >
                      {monthlyData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={safeColor}
                          fillOpacity={0.6 + index * 0.1}
                        />
                      ))}
                    </RadialBar>
                    <Legend
                      iconSize={10}
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      formatter={(value, entry, index) => {
                        const item = monthlyData[index];
                        return `${value}: ${item.completionRate}% (${item.completed}/${item.total})`;
                      }}
                    />
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value}%`,
                        "Completion Rate",
                      ]}
                      labelFormatter={(label) =>
                        monthlyData.find((item) => item.name === label)?.name ||
                        ""
                      }
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly trend insight */}
              {monthlyData.length > 1 && (
                <div className="mt-2 p-2 bg-purple-50 rounded-md">
                  <p className="text-sm text-purple-700">
                    {(() => {
                      const currentMonth = monthlyData[monthlyData.length - 1];
                      const previousMonth = monthlyData[monthlyData.length - 2];

                      if (currentMonth && previousMonth) {
                        const difference =
                          currentMonth.completionRate -
                          previousMonth.completionRate;
                        if (difference > 0) {
                          return `You're improving! Up ${difference}% from last month.`;
                        } else if (difference < 0) {
                          return `You completed this habit ${Math.abs(
                            difference
                          )}% less often than last month.`;
                        } else {
                          return `Your completion rate is steady at ${currentMonth.completionRate}% for the past two months.`;
                        }
                      }
                      return "Keep tracking to see your monthly progress.";
                    })()}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Progress Bar */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Overall Progress</span>
            <span>{stats.completionRate}% Complete</span>
          </div>
          <Progress value={stats.completionRate} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
