import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import { getOrCreateDbUser } from '@/lib/user';

export async function GET(req: NextRequest) {
  const authObject = await auth();
  const userId = authObject.userId;
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get the current user from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 });
    }
    
    // Find or create user; if email exists, attach Clerk ID instead of duplicating
    const dbUser = await getOrCreateDbUser(userId, clerkUser);

    // Get today's date boundaries
    const today = startOfDay(new Date());
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    // Get the last 30 days for habit analysis
    const thirtyDaysAgo = subDays(todayStart, 30);

    // Get user's habits
    const habits = await prisma.habit.findMany({
      where: { 
        authorId: dbUser.id,
        active: true
      },
      orderBy: { createdAt: 'asc' },
    });

    // Check if user has a journal entry for today
    const todayEntry = await prisma.journal.findFirst({
      where: {
        authorId: dbUser.id,
        date: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    // Get all journal entries
    const allJournalEntries = await prisma.journal.findMany({
      where: {
        authorId: dbUser.id,
      },
      orderBy: { date: 'desc' },
      take: 10, // Only get the 10 most recent for dashboard
    });

    // Get mood distribution
    const moodCounts: Record<string, number> = {};
    
    allJournalEntries.forEach(entry => {
      const mood = entry.mood || 'neutral';
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });
    
    // Get recent moods (last 7 entries)
    const recentMoods = allJournalEntries.slice(0, 7).map(entry => entry.mood || 'neutral');
    
    // Create journal activity data for the heatmap (last 365 days)
    const yearAgo = subDays(todayStart, 365);
    const journalActivityEntries = await prisma.journal.findMany({
      where: {
        authorId: dbUser.id,
        date: {
          gte: yearAgo
        }
      },
      select: {
        date: true,
        mood: true
      },
      orderBy: { date: 'asc' }
    });
    
    // Format for the heatmap
    const journalHeatmap = journalActivityEntries.map(entry => ({
      date: entry.date.toISOString().split('T')[0],
      mood: entry.mood || 'neutral',
      count: 1
    }));

    // Get habit statistics
    const habitStats = await Promise.all(habits.map(async (habit) => {
      // Get all habit logs for this habit in the last 30 days
      const habitLogs = await prisma.habitLog.findMany({
        where: {
          habitId: habit.id,
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
            date: 'desc'
          }
        }
      });

      // Calculate current streak
      let currentStreak = 0;
      let i = 0;
      
      while (i < habitLogs.length) {
        const log = habitLogs[i];
        
        // Check if this log is for today or a recent consecutive day
        if (log.completed) {
          currentStreak++;
        } else {
          break; // Streak broken
        }
        
        i++;
      }

      // Calculate completion rate
      const completedLogs = habitLogs.filter(log => log.completed).length;
      const completionRate = habitLogs.length > 0 
        ? Math.round((completedLogs / habitLogs.length) * 100) 
        : 0;
        
      // Get last 30 days of habit data for streak calendar
      const streakData = habitLogs.map(log => ({
        date: log.journal.date.toISOString().split('T')[0],
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
    }));

    // Get active projects with task counts
    const projects = await prisma.project.findMany({
      where: {
        authorId: dbUser.id,
        archived: false
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            tasks: {
              where: {
                status: {
                  not: 'completed'
                }
              }
            }
          }
        }
      },
      take: 5 // Limit to 5 recent projects for dashboard
    });

    // Get pending tasks due soon 
    const upcomingTasks = await prisma.task.findMany({
      where: {
        authorId: dbUser.id,
        status: {
          not: 'completed'
        },
        dueDate: {
          gte: new Date(), // Only future due dates
        }
      },
      orderBy: {
        dueDate: 'asc'
      },
      include: {
        project: {
          select: {
            name: true,
            color: true,
            icon: true
          }
        }
      },
      take: 5 // Limit to 5 upcoming tasks
    });

    // Get recently completed tasks
    const recentlyCompletedTasks = await prisma.task.findMany({
      where: {
        authorId: dbUser.id,
        status: 'completed',
        completedAt: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: {
        completedAt: 'desc'
      },
      include: {
        project: {
          select: {
            name: true,
            color: true,
            icon: true
          }
        }
      },
      take: 5 // Limit to 5 recent completed tasks
    });

    return NextResponse.json({
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
        list: projects,
        total: projects.length,
      },
      tasks: {
        upcoming: upcomingTasks,
        recentlyCompleted: recentlyCompletedTasks
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}