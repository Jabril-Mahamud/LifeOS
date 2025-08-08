import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { getOrCreateDbUser } from '@/lib/user';
import { createHabitSchema } from '@/lib/validation/habits';

// GET /api/habits - Get all user habits
export async function GET(req: NextRequest) {
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

    // Get user's habits
    const habits = await prisma.habit.findMany({
      where: { authorId: dbUser.id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ habits });
  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// POST /api/habits - Create a new habit
export async function POST(req: NextRequest) {
  const authObject = await auth();
  const userId = authObject.userId;
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createHabitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', issues: parsed.error.issues },
        { status: 400 }
      );
    }
    const { name, description, icon, color } = parsed.data;

    // Resolve DB user safely
    const clerkUserObj = await currentUser();
    if (!clerkUserObj) {
      return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 });
    }
    const dbUser = await getOrCreateDbUser(userId, clerkUserObj);

    // Check if habit with this name already exists for the user
    const existingHabit = await prisma.habit.findFirst({
      where: {
        authorId: dbUser.id,
        name,
      },
    });

    if (existingHabit) {
      return NextResponse.json(
        { error: 'A habit with this name already exists' }, 
        { status: 400 }
      );
    }

    // Create a new habit
    const habit = await prisma.habit.create({
      data: {
        name,
        description,
        icon,
        color,
        authorId: dbUser.id,
      },
    });

    return NextResponse.json({ habit }, { status: 201 });
  } catch (error) {
    console.error('Error creating habit:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}