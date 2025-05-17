import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

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

    // Check if there's a date parameter in the request
    const dateParam = req.nextUrl.searchParams.get('date');
    let date: Date | null = null;
    
    if (dateParam) {
      date = new Date(dateParam);
      if (isNaN(date.getTime())) {
        return NextResponse.json({ error: 'Invalid date parameter' }, { status: 400 });
      }
    }

    // Get user's journal entries
    const entries = await prisma.journal.findMany({
      where: { 
        authorId: dbUser.id,
        ...(date && {
          date: {
            gte: startOfDay(date),
            lte: endOfDay(date),
          }
        })
      },
      orderBy: { date: 'desc' },
      include: {
        habitLogs: {
          include: {
            habit: true,
          },
        },
      },
    });

    // Get today's entry if it exists
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    
    const todayEntry = await prisma.journal.findFirst({
      where: {
        authorId: dbUser.id,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        habitLogs: {
          include: {
            habit: true,
          },
        },
      },
    });

    // Get user's active habits
    const habits = await prisma.habit.findMany({
      where: {
        authorId: dbUser.id,
        active: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ 
      user: dbUser, 
      entries,
      todayEntry,
      habits,
    });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authObject = await auth();
  const userId = authObject.userId;
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, content, mood = 'neutral', habitLogs = [] } = await req.json();
    
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' }, 
        { status: 400 }
      );
    }

    // Find the user in our database
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    // If user doesn't exist in our database yet, create them
    if (!dbUser) {
      const clerkUser = await currentUser();
      
      if (!clerkUser) {
        return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 });
      }
      
      const primaryEmail = clerkUser.emailAddresses.find(
        email => email.id === clerkUser.primaryEmailAddressId
      )?.emailAddress;
      
      if (!primaryEmail) {
        return NextResponse.json({ error: 'User has no email address' }, { status: 400 });
      }
      
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

    // Check if a journal entry already exists for today
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    
    const existingEntry = await prisma.journal.findFirst({
      where: {
        authorId: dbUser.id,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: 'A journal entry for today already exists', entry: existingEntry }, 
        { status: 400 }
      );
    }

    // Create a new journal entry
    const entry = await prisma.journal.create({
      data: {
        title,
        content,
        mood,
        date: today,
        authorId: dbUser.id,
      },
    });

    // Process habit logs if provided
    const createdHabitLogs = [];
    if (habitLogs.length > 0) {
      // Verify these habits belong to the user
      const habitIds = habitLogs.map((log: any) => log.habitId);
      const userHabits = await prisma.habit.findMany({
        where: {
          id: { in: habitIds },
          authorId: dbUser.id,
        },
      });
      
      const validHabitIds = userHabits.map(habit => habit.id);
      
      // Create habit logs
      for (const log of habitLogs) {
        if (validHabitIds.includes(log.habitId)) {
          const habitLog = await prisma.habitLog.create({
            data: {
              completed: log.completed || false,
              notes: log.notes || null,
              journalId: entry.id,
              habitId: log.habitId,
            },
          });
          createdHabitLogs.push(habitLog);
        }
      }
    }

    // Return the created entry with its habit logs
    const completeEntry = await prisma.journal.findUnique({
      where: { id: entry.id },
      include: {
        habitLogs: {
          include: {
            habit: true,
          },
        },
      },
    });

    return NextResponse.json({ entry: completeEntry }, { status: 201 });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}