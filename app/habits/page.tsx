import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { HabitsListView } from "@/components/habits/habits-list-view";
import prisma from "@/lib/prisma";
import { Habit, HabitWithStats, HabitTrackerJournal } from "@/lib/types";
import { Metadata } from "next";

async function getHabitsData() {
  const authObject = await auth();
  const userId = authObject.userId;
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Find the user in our database
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!dbUser) {
    redirect("/sign-in");
  }

  // Get user's habits
  const habits = await prisma.habit.findMany({
    where: { authorId: dbUser.id },
    orderBy: { createdAt: "asc" },
  });

  // Get today's journal entry for habit tracking
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayEntry = await prisma.journal.findFirst({
    where: {
      authorId: dbUser.id,
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      habitLogs: true,
    },
  });

  // Separate active and inactive habits
  const active: Habit[] = [];
  const inactive: Habit[] = [];

  for (const habit of habits) {
    // Get habit stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const habitLogs = await prisma.habitLog.findMany({
      where: {
        habitId: habit.id,
        journal: {
          date: {
            gte: thirtyDaysAgo,
          },
        },
      },
      include: {
        journal: {
          select: {
            date: true,
          },
        },
      },
      orderBy: {
        journal: {
          date: "desc",
        },
      },
    });

    // Calculate streak
    let streak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;

    for (const log of habitLogs) {
      const logDate = log.journal.date;
      
      if (!lastDate) {
        // First log
        currentStreak = log.completed ? 1 : 0;
      } else {
        const dayDiff = Math.floor((lastDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1 && log.completed) {
          // Consecutive day and completed
          currentStreak++;
        } else {
          // Break in streak
          if (currentStreak > streak) {
            streak = currentStreak;
          }
          currentStreak = log.completed ? 1 : 0;
        }
      }
      
      lastDate = logDate;
    }

    // Update streak if current streak is higher
    if (currentStreak > streak) {
      streak = currentStreak;
    }

    // Calculate completion rate
    const completedCount = habitLogs.filter(log => log.completed).length;
    const completionRate = habitLogs.length > 0 ? (completedCount / habitLogs.length) * 100 : 0;

    const habitWithStats: HabitWithStats = {
      ...habit,
      createdAt: habit.createdAt.toISOString(),
      updatedAt: habit.updatedAt.toISOString(),
      streak,
      completionRate,
      streakData: habitLogs.map(log => ({
        date: log.journal.date.toISOString(),
        completed: log.completed,
      })),
    };

    if (habit.active) {
      active.push(habitWithStats);
    } else {
      inactive.push(habitWithStats);
    }
  }

  // Prepare journal data
  const journalData: HabitTrackerJournal = {
    id: todayEntry?.id || "temp-id",
    hasEntryToday: Boolean(todayEntry),
    todayEntry: todayEntry
      ? {
          id: todayEntry.id,
          habitLogs: todayEntry.habitLogs.map(log => ({
            ...log,
            createdAt: log.createdAt.toISOString(),
            updatedAt: log.updatedAt.toISOString(),
          })),
        }
      : undefined,
  };

  return { active, inactive, journalData };
}

export const metadata: Metadata = {
  title: "Habits | LifeOS",
  description: "Track and manage your daily habits",
};

export default async function HabitsPage() {
  const { active, inactive, journalData } = await getHabitsData();

  return (
    <Suspense fallback={<HabitsListSkeleton />}>
      <HabitsListView
        habits={active}
        inactiveHabits={inactive}
        journalData={journalData}
      />
    </Suspense>
  );
}

function HabitsListSkeleton() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Habits</h1>
          <div className="h-4 w-48 bg-muted animate-pulse rounded mt-1" />
        </div>
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </div>

      <div className="bg-card border rounded-lg">
        <div className="p-6 border-b">
          <div className="h-6 w-32 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-6 w-6 bg-muted animate-pulse rounded-full" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-2 w-48 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-9 w-64 bg-muted animate-pulse rounded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
              <div>
                <div className="h-5 w-32 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 w-48 bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-2 bg-muted animate-pulse rounded" />
              <div className="h-3 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}