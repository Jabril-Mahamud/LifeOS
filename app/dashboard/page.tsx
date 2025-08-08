import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { LoadingSkeletonGrid } from "@/components/ui/loading-skeleton";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { TaskStatus, TaskPriority } from "@/lib/types/database";
import { Metadata } from "next";

async function getDashboardData() {
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

  // Get today's date boundaries
  const today = startOfDay(new Date());
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  // Get the last 30 days for habit analysis
  const thirtyDaysAgo = subDays(todayStart, 30);

  // Get user's habits with logs in a single query
  const habitsWithLogs = await prisma.habit.findMany({
    where: { 
      authorId: dbUser.id,
      active: true
    },
    orderBy: { createdAt: "asc" },
    include: {
      habitLogs: {
        where: {
          journal: {
            date: {
              gte: thirtyDaysAgo
            }
          }
        },
        include: {
          journal: {
            select: {
              date: true
            }
          }
        },
        orderBy: {
          journal: {
            date: "desc"
          }
        }
      }
    }
  });

  // Process habit statistics
  const habitStats = habitsWithLogs.map(habit => {
    const habitLogs = habit.habitLogs;

    // Calculate current streak
    let currentStreak = 0;
    let i = 0;
    
    while (i < habitLogs.length) {
      const log = habitLogs[i];
      
      if (log.completed) {
        currentStreak++;
      } else {
        break;
      }
      
      i++;
    }

    // Calculate completion rate
    const completedLogs = habitLogs.filter(log => log.completed).length;
    const completionRate = habitLogs.length > 0 
      ? Math.round((completedLogs / habitLogs.length) * 100) 
      : 0;
      
    // Format streak data
    const streakData = habitLogs.map(log => ({
      date: log.journal.date.toISOString().split("T")[0],
      completed: log.completed
    }));

    return {
      id: habit.id,
      name: habit.name,
      icon: habit.icon,
      color: habit.color,
      streak: currentStreak,
      completionRate,
      streakData
    };
  });

  // Get all journal data in a single query
  const yearAgo = subDays(todayStart, 365);
  const journalData = await prisma.journal.findMany({
    where: {
      authorId: dbUser.id,
      date: {
        gte: yearAgo
      }
    },
    select: {
      id: true,
      title: true,
      content: true,
      date: true,
      mood: true
    },
    orderBy: { date: "desc" }
  });

  // Process journal data
  const todayEntry = journalData.find(entry => 
    entry.date >= todayStart && entry.date <= todayEnd
  );

  const allJournalEntries = journalData.slice(0, 10).map(entry => ({
    ...entry,
    date: entry.date.toISOString(),
    createdAt: entry.date.toISOString(),
    updatedAt: entry.date.toISOString(),
    private: true,
    authorId: dbUser.id,
  }));
  const recentMoods = journalData.slice(0, 7).map(entry => entry.mood || "neutral");

  // Calculate mood distribution
  const moodCounts: Record<string, number> = {};
  allJournalEntries.forEach(entry => {
    const mood = entry.mood || "neutral";
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
  });

  // Format journal activity data for heatmap
  const journalActivityEntries = [...journalData].reverse();
  
  // Format for the heatmap
  const journalHeatmap = journalActivityEntries.map(entry => ({
    date: entry.date.toISOString().split("T")[0],
    mood: entry.mood || "neutral",
    count: 1
  }));

  // Get active projects and tasks in a single query
  const [projects, tasks] = await Promise.all([
    prisma.project.findMany({
      where: {
        authorId: dbUser.id,
        archived: false
      },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            tasks: {
              where: {
                status: {
                  not: "completed"
                }
              }
            }
          }
        }
      },
      take: 5 // Limit to 5 recent projects for dashboard
    }),
    prisma.task.findMany({
      where: {
        authorId: dbUser.id,
        OR: [
          {
            status: {
              not: "completed"
            },
            dueDate: {
              gte: new Date()
            }
          },
          {
            status: "completed",
            completedAt: {
              gte: thirtyDaysAgo
            }
          }
        ]
      },
      orderBy: [
        { status: "asc" },
        { dueDate: "asc" },
        { completedAt: "desc" }
      ],
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true
          }
        }
      },
      take: 10 // Get top 10 tasks (5 upcoming + 5 completed)
    })
  ]);

  // Split tasks into upcoming and completed
  const upcomingTasks = tasks
    .filter(task => task.status !== "completed")
    .slice(0, 5)
    .map(task => ({
      ...task,
      status: task.status as TaskStatus,
      priority: task.priority as TaskPriority,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      dueDate: task.dueDate?.toISOString() || null,
      completedAt: task.completedAt?.toISOString() || null,
    }));

  const recentlyCompletedTasks = tasks
    .filter(task => task.status === "completed")
    .slice(0, 5)
    .map(task => ({
      ...task,
      status: task.status as TaskStatus,
      priority: task.priority as TaskPriority,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      dueDate: task.dueDate?.toISOString() || null,
      completedAt: task.completedAt?.toISOString() || null,
    }));

  return {
    habits: habitStats,
    journal: {
      totalEntries: journalActivityEntries.length,
      hasEntryToday: Boolean(todayEntry),
      entries: allJournalEntries,
      moodDistribution: moodCounts,
      recentMoods,
      heatmap: journalHeatmap
    },
    projects: {
      list: projects.map(project => ({
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      })),
      total: projects.length,
    },
    tasks: {
      upcoming: upcomingTasks,
      recentlyCompleted: recentlyCompletedTasks
    }
  };
}

export const metadata: Metadata = {
  title: "Dashboard | LifeOS",
  description: "Your personal productivity dashboard",
};

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardView data={data} />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6 mobile-pb">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="h-9 w-24 bg-muted animate-pulse rounded" />
      </div>

      <LoadingSkeletonGrid columns={3} items={3} itemHeight="h-4" />
      <LoadingSkeletonGrid columns={2} items={2} itemHeight="h-16" />
      <LoadingSkeletonGrid columns={2} items={2} itemHeight="h-[200px]" />
    </div>
  );
}