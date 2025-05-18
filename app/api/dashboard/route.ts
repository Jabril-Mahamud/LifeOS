import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay, subDays, parseISO, isToday } from 'date-fns';

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
    
    // Find or create user in our database based on Clerk ID
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    // If we don't have this user in our database yet, create them
    if (!dbUser) {
      // Get primary email from the Clerk user
      const primaryEmail = clerkUser.emailAddresses.find(
        email => email.id === clerkUser.primaryEmailAddressId
      )?.emailAddress;
      
      if (!primaryEmail) {
        return NextResponse.json({ error: 'User has no email address' }, { status: 400 });
      }
      
      // Create a new user in our database with data from Clerk
      dbUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email: primaryEmail,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          profileImage: clerkUser.imageUrl,
        },
      });
    }

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
    });

    // Get mood distribution
    const moodCounts: Record<string, number> = {};
    const totalEntries = allJournalEntries.length;
    
    allJournalEntries.forEach(entry => {
      const mood = entry.mood || 'neutral';
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });
    
    const moodDistribution: Record<string, number> = {};
    Object.entries(moodCounts).forEach(([mood, count]) => {
      moodDistribution[mood] = Math.round((count / totalEntries) * 100);
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

    return NextResponse.json({
      habits: habitStats,
      journal: {
        totalEntries,
        hasEntryToday: Boolean(todayEntry),
        moodDistribution,
        recentMoods,
        heatmap: journalHeatmap
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