import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { startOfDay, subDays, parseISO, format } from 'date-fns';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authObject = await auth();
  const userId = authObject.userId;
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find the user in our database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the habit
    const habit = await prisma.habit.findUnique({
      where: { id: params.id },
    });

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    // Check if the user is the author of the habit
    if (habit.authorId !== dbUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get data for the last 30 days
    const today = startOfDay(new Date());
    const thirtyDaysAgo = subDays(today, 30);
    
    // Get all journal entries in this date range
    const journalEntries = await prisma.journal.findMany({
      where: {
        authorId: dbUser.id,
        date: {
          gte: thirtyDaysAgo,
          lte: today,
        }
      },
      include: {
        habitLogs: {
          where: {
            habitId: params.id
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    // Map the data for the response
    const dailyLogs = journalEntries.map(entry => {
      const habitLog = entry.habitLogs[0] || null;
      return {
        date: format(entry.date, 'yyyy-MM-dd'),
        completed: habitLog ? habitLog.completed : false,
        notes: habitLog ? habitLog.notes : null
      };
    });
    
    // Calculate statistics
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let completedDays = 0;
    
    // Calculate from newest to oldest for current streak
    for (let i = dailyLogs.length - 1; i >= 0; i--) {
      if (dailyLogs[i].completed) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate longest streak from oldest to newest
    for (const log of dailyLogs) {
      if (log.completed) {
        tempStreak++;
        completedDays++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
    
    // Calculate completion rate
    const completionRate = Math.round((completedDays / journalEntries.length) * 100) || 0;

    return NextResponse.json({
      habit,
      stats: {
        currentStreak,
        longestStreak,
        completionRate,
        totalDays: journalEntries.length,
        completedDays
      },
      dailyLogs
    });
  } catch (error) {
    console.error('Error fetching habit statistics:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}