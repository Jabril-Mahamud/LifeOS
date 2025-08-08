import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { format, subDays, startOfDay, parseISO, differenceInDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DashboardHabit } from "@/lib/types";

interface HabitConsistencyChartProps {
  habits: DashboardHabit[];
  daysToShow?: number;
  title?: string;
  showLegend?: boolean;
}


export function HabitConsistencyChart({
  habits,
  daysToShow = 14,
  title = "Habit Consistency",
  showLegend = true
}: HabitConsistencyChartProps) {
  const [periodStart, setPeriodStart] = useState(subDays(new Date(), daysToShow));
  
  // Generate an array of dates from period start
  const generateDateRange = () => {
    const dateRange = [];
    const today = startOfDay(new Date());
    const start = periodStart;
    
    for (let i = 0; i < daysToShow; i++) {
      const date = subDays(today, differenceInDays(today, start) + daysToShow - 1 - i);
      dateRange.push(format(date, "yyyy-MM-dd"));
    }
    
    return dateRange;
  };

  // Format the habit data for LineChart
  type ChartPoint = Record<string, string | number>;

  const formatChartData = (): ChartPoint[] => {
    const dateRange = generateDateRange();
    const chartData = dateRange.map(date => {
      const dataPoint: ChartPoint = { date };
      
      habits.forEach(habit => {
        // Find if there's a streak data entry for this date
        const entry = habit.streakData?.find((entry: { date: string; completed: boolean }) => entry.date === date);
        // Set value as 1 if completed, 0 if not
        dataPoint[`habit-${habit.id}`] = entry?.completed ? 100 : 0;
      });
      
      return dataPoint;
    });
    
    return chartData;
  };

  // Navigate to previous period
  const goToPreviousPeriod = () => {
    setPeriodStart(prevDate => subDays(prevDate, daysToShow));
  };

  // Navigate to next period
  const goToNextPeriod = () => {
    const nextStart = subDays(new Date(), daysToShow);
    // Don't allow going beyond current date
    if (periodStart < nextStart) {
      setPeriodStart(nextStart);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "MMM d");
  };

  // Check if at least one habit has streak data
  const hasData = habits.some(habit => habit.streakData && habit.streakData.length > 0);

  // Memoize the chart data
  const chartData = useMemo(() => formatChartData(), [habits, periodStart, daysToShow]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousPeriod} aria-label="Previous period">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={goToNextPeriod}
              disabled={periodStart >= subDays(new Date(), daysToShow)}
              aria-label="Next period"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {!hasData ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No habit tracking data available for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 0, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
                ticks={[0, 50, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, ""]}
                labelFormatter={formatDate}
                contentStyle={{ 
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "0.5rem" 
                }}
              />
              {showLegend && <Legend verticalAlign="top" height={36} />}
              
              {habits.map((habit, index) => (
                <Line
                  key={habit.id}
                  type="monotone"
                  dataKey={`habit-${habit.id}`}
                  name={habit.name}
                  stroke={habit.color || `hsl(var(--chart-${(index % 5) + 1}))`}
                  strokeWidth={2}
                  dot={{
                    r: 4,
                    fill: habit.color || `hsl(var(--chart-${(index % 5) + 1}))`
                  }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={true}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}