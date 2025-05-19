import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
      where: { id },
    });

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    // Check if the user is the author of the habit
    if (habit.authorId !== dbUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get today's journal entry
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    
    const journalEntry = await prisma.journal.findFirst({
      where: {
        authorId: dbUser.id,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    // Get habit log for today if journal entry exists
    let habitLog = null;
    if (journalEntry) {
      habitLog = await prisma.habitLog.findUnique({
        where: {
          journalId_habitId: {
            journalId: journalEntry.id,
            habitId: id,
          },
        },
      });
    }

    return NextResponse.json({
      habit,
      todayEntry: journalEntry ? {
        id: journalEntry.id,
        hasHabitLog: Boolean(habitLog),
        completed: habitLog ? habitLog.completed : false,
      } : null,
    });
  } catch (error) {
    console.error('Error fetching habit and journal data:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authObject = await auth();
  const userId = authObject.userId;
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { completed, notes } = await req.json();
    
    // Find the user in our database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the habit
    const habit = await prisma.habit.findUnique({
      where: { id },
    });

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    // Check if the user is the author of the habit
    if (habit.authorId !== dbUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get or create today's journal entry
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    
    let journalEntry = await prisma.journal.findFirst({
      where: {
        authorId: dbUser.id,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    if (!journalEntry) {
      // If no journal entry exists for today, create one
      journalEntry = await prisma.journal.create({
        data: {
          title: `Journal for ${today.toLocaleDateString()}`,
          content: '',
          date: today,
          authorId: dbUser.id,
        },
      });
    }

    // Update or create habit log
    const habitLog = await prisma.habitLog.upsert({
      where: {
        journalId_habitId: {
          journalId: journalEntry.id,
          habitId: id,
        },
      },
      update: {
        completed,
        notes,
      },
      create: {
        completed,
        notes,
        journalId: journalEntry.id,
        habitId: id,
      },
    });

    return NextResponse.json({
      success: true,
      habitLog,
    });
  } catch (error) {
    console.error('Error updating habit log:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}