import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { getOrCreateDbUser } from '@/lib/user';
import { createProjectSchema } from '@/lib/validation/projects';
import { handlePrismaError } from '@/lib/utils/errors';

// GET /api/projects - Get all user projects
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

    // Get user's projects
    const projects = await prisma.project.findMany({
      where: { 
        authorId: dbUser.id,
        archived: false // Only show non-archived projects by default
      },
      orderBy: { createdAt: 'asc' },
      include: {
        tasks: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(req: NextRequest) {
  const authObject = await auth();
  const userId = authObject.userId;
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', issues: parsed.error.issues },
        { status: 400 }
      );
    }
    const { name, description, color, icon } = parsed.data;

    // Resolve DB user safely
    const clerkUserObj = await currentUser();
    if (!clerkUserObj) {
      return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 });
    }
    const dbUser = await getOrCreateDbUser(userId, clerkUserObj);

    // Create a new project
    const project = await prisma.project.create({
      data: {
        name,
        description,
        color,
        icon,
        authorId: dbUser.id,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    const { status, message } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}