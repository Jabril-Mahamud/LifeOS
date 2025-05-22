"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Edit,
  ArrowLeft,
  CalendarDays,
  BarChart4,
  Trophy,
  Calendar,
  ChevronLeft,
  ChevronRight,
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "@/components/ui/circular-progress";
import { toast } from "@/hooks/use-toast";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  subMonths,
  addMonths,
} from "date-fns";

type Habit = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  active: boolean;
  createdAt: string;
};

type HabitStats = {
  totalDays: number;
  completedDays: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
};

type DailyLog = {
  date: string;
  completed: boolean;
  notes: string | null;
};

// Correct Next.js page props interface
interface PageProps {
  params: Promise<{ id: string }>;
}

export default function HabitDetailPage({ params }: PageProps) {
  const [habit, setHabit] = useState<Habit | null>(null);
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [habitId, setHabitId] = useState<string | null>(null);
  const router = useRouter();

  // Resolve params and extract id
  useEffect(() => {
    const resolveParams = async () => {
      const { id } = await params;
      setHabitId(id);
    };
    resolveParams();
  }, [params]);

  // Fetch habit and stats
  useEffect(() => {
    if (!habitId) return;

    const fetchHabitData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/habits/${habitId}/stats`);
        if (!response.ok) {
          throw new Error("Failed to fetch habit data");
        }
        const data = await response.json();

        setHabit(data.habit);
        setStats(data.stats);
        setDailyLogs(data.dailyLogs);
      } catch (error) {
        console.error("Error fetching habit data:", error);
        toast({
          title: "Error",
          description: "Failed to load habit data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHabitData();
  }, [habitId]);

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth((prevDate) => subMonths(prevDate, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth((nextDate) => addMonths(nextDate, 1));
  };

  // Get days for the current month view
  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  // Check if a specific day has a completed habit
  const isDayCompleted = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    const log = dailyLogs.find((log) => log.date === dateString);
    return log ? log.completed : false;
  };

  // Format percentage for display
  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };

  if (loading || !habitId) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Loading habit data...</h1>
        </div>
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Habit not found</h1>
        </div>
        <p className="text-muted-foreground">
          The requested habit could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="ml-2">
            <h1 className="text-2xl font-bold flex items-center">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-white mr-2"
                style={{
                  backgroundColor: habit.color || "hsl(var(--primary))",
                }}
              >
                {habit.icon || "✓"}
              </span>
              {habit.name}
            </h1>
            {habit.description && (
              <p className="text-muted-foreground">{habit.description}</p>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/habits/${habitId}/edit`)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Current Streak */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Trophy className="h-4 w-4 mr-2" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.currentStreak || 0} days
            </div>
          </CardContent>
        </Card>

        {/* Longest Streak */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Trophy className="h-4 w-4 mr-2" />
              Longest Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.longestStreak || 0} days
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <BarChart4 className="h-4 w-4 mr-2" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(stats?.completionRate || 0)}
            </div>
          </CardContent>
        </Card>

        {/* Days Completed */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Days Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.completedDays || 0} / {stats?.totalDays || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progress Visualization */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChart4 className="h-5 w-5 mr-2" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-6">
            <CircularProgress
              value={stats?.completionRate || 0}
              size="lg"
              color={habit.color || "hsl(var(--primary))"}
              label="Completion rate"
            />

            <div className="w-full mt-8 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Success rate</span>
                  <span>{formatPercentage(stats?.completionRate || 0)}</span>
                </div>
                <Progress value={stats?.completionRate || 0} className="h-2" />
              </div>

              <div className="text-sm text-muted-foreground">
                <p>
                  Tracking since{" "}
                  {format(new Date(habit.createdAt), "MMMM d, yyyy")}
                </p>
                <p className="mt-1">
                  {stats?.completedDays} days completed out of{" "}
                  {stats?.totalDays} tracked days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar View */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <CalendarDays className="h-5 w-5 mr-2" />
                Habit Calendar
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  {format(currentMonth, "MMMM yyyy")}
                </span>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-xs font-medium py-1">
                  {day}
                </div>
              ))}

              {/* Get the first day of the month and calculate offset */}
              {Array.from({ length: startOfMonth(currentMonth).getDay() }).map(
                (_, i) => (
                  <div
                    key={`empty-start-${i}`}
                    className="h-10 rounded-md p-1"
                  />
                )
              )}

              {/* Days in month */}
              {getDaysInMonth().map((day) => {
                const isCompleted = isDayCompleted(day);
                return (
                  <div
                    key={day.toString()}
                    className="h-10 rounded-md p-1 relative"
                  >
                    <div
                      className={`w-full h-full rounded-md flex items-center justify-center text-sm
                        ${
                          isCompleted
                            ? "bg-green-500 text-white"
                            : "hover:bg-muted"
                        }
                      `}
                      style={{
                        backgroundColor: isCompleted
                          ? habit.color || "#22c55e"
                          : undefined,
                      }}
                    >
                      {day.getDate()}
                    </div>
                  </div>
                );
              })}

              {/* Fill remaining cells in the last row */}
              {Array.from({
                length: 6 - endOfMonth(currentMonth).getDay(),
              }).map((_, i) => (
                <div key={`empty-end-${i}`} className="h-10 rounded-md p-1" />
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex items-center gap-4 text-sm text-muted-foreground w-full justify-center">
              <div className="flex items-center">
                <div
                  className="w-4 h-4 rounded-sm mr-1"
                  style={{ backgroundColor: habit.color || "#22c55e" }}
                />
                <span>Completed</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-sm bg-muted mr-1" />
                <span>Not Completed</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}