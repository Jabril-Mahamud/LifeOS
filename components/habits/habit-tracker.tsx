"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from 'recharts';

type Habit = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  streak?: number;
  completionRate?: number;
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
  showTitle?: boolean; // Added back to fix TypeScript error
};

export function HabitTracker({ 
  habits = [], 
  journalData, 
  onHabitsUpdated,
  showTitle = false // Default to false for minimalist version
}: HabitTrackerProps) {
  const [loading, setLoading] = useState(false);
  const [updatingHabitId, setUpdatingHabitId] = useState<string | null>(null);
  const [completionStatus, setCompletionStatus] = useState<Record<string, boolean>>({});
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

  // Prepare radar chart data
  const prepareChartData = () => {
    // Only include habits with completion rate data
    const habitsWithData = habits.filter(habit => 
      typeof habit.completionRate === 'number' && 
      !isNaN(habit.completionRate)
    );

    if (habitsWithData.length < 3) {
      return null; // Not enough data for a meaningful radar chart
    }

    // Create data structure for radar chart
    const chartData = habitsWithData.map(habit => ({
      subject: habit.name,
      value: habit.completionRate || 0,
      fullMark: 100,
    }));

    return chartData;
  };

  const chartData = prepareChartData();

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
      {/* Radar Chart for consistency */}
      {chartData && chartData.length >= 3 && (
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
              <Radar
                name="Consistency"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Habit List */}
      <div className="space-y-3">
        {habits.map((habit) => {
          const isCompleted = completionStatus[habit.id] || false;
          const isUpdating = updatingHabitId === habit.id;
          
          return (
            <div 
              key={habit.id} 
              className="flex items-center py-1 cursor-pointer"
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
            </div>
          );
        })}
      </div>
    </div>
  );
}