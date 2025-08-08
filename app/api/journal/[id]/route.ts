import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { updateJournalSchema } from '@/lib/validation/journal';

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

    // Get the journal entry with habit logs
    const entry = await prisma.journal.findUnique({
      where: { id },
      include: {
        habitLogs: {
          include: {
            habit: true,
          },
        },
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 });
    }

    // Check if the user is the author of the entry
    if (entry.authorId !== dbUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Error fetching journal entry:', error);
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
    const body = await req.json();
    const parsed = updateJournalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', issues: parsed.error.issues },
        { status: 400 }
      );
    }
    const { title, content, mood, habitLogs = [] } = parsed.data;
    
    // Find the user in our database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the journal entry
    const entry = await prisma.journal.findUnique({
      where: { id },
      include: {
        habitLogs: true,
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 });
    }

    // Check if the user is the author of the entry
    if (entry.authorId !== dbUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the journal entry
    const updatedEntry = await prisma.journal.update({
      where: { id },
      data: {
        title: title !== undefined ? title : entry.title,
        content: content !== undefined ? content : entry.content,
        mood: mood !== undefined ? mood : entry.mood,
      },
    });

    // Process habit logs if provided
    if (habitLogs.length > 0) {
      // Verify these habits belong to the user
      const habitIds = habitLogs.map((log) => log.habitId);
      const userHabits = await prisma.habit.findMany({
        where: {
          id: { in: habitIds },
          authorId: dbUser.id,
        },
      });
      
      const validHabitIds = userHabits.map(habit => habit.id);
      
      // Update or create habit logs
      for (const log of habitLogs) {
        if (validHabitIds.includes(log.habitId)) {
          // Check if a habit log already exists
          const existingLog = await prisma.habitLog.findUnique({
            where: {
              journalId_habitId: {
                journalId: entry.id,
                habitId: log.habitId,
              },
            },
          });

          if (existingLog) {
            // Update existing log
            await prisma.habitLog.update({
              where: { id: existingLog.id },
              data: {
                completed: log.completed,
                notes: log.notes,
              },
            });
          } else {
            // Create new log
            await prisma.habitLog.create({
              data: {
                completed: log.completed || false,
                notes: log.notes || null,
                journalId: entry.id,
                habitId: log.habitId,
              },
            });
          }
        }
      }
    }

    // Return the updated entry with its habit logs
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

    return NextResponse.json({ entry: completeEntry });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Get the journal entry
    const entry = await prisma.journal.findUnique({
      where: { id },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 });
    }

    // Check if the user is the author of the entry
    if (entry.authorId !== dbUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the journal entry (habit logs will be cascade deleted due to the relation setup)
    await prisma.journal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}