import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { getOrCreateDbUser } from '@/lib/user';

// GET /api/tasks - Get all user tasks
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

    // Get query parameters
    const projectId = req.nextUrl.searchParams.get('projectId');
    const status = req.nextUrl.searchParams.get('status');
    const priority = req.nextUrl.searchParams.get('priority');
    
    // Build where clause based on query parameters
    const where: any = { authorId: dbUser.id };
    
    if (projectId) {
      where.projectId = projectId;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (priority) {
      where.priority = priority;
    }

    // Get user's tasks
    const tasks = await prisma.task.findMany({
      where,
      orderBy: [
        { status: 'asc' }, // Pending tasks first
        { dueDate: 'asc' }, // Then by due date (soonest first)
        { priority: 'desc' }, // Then by priority (highest first)
      ],
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(req: NextRequest) {
  const authObject = await auth();
  const userId = authObject.userId;
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, description, projectId, priority, dueDate, status } = await req.json();
    
    if (!title) {
      return NextResponse.json(
        { error: 'Task title is required' }, 
        { status: 400 }
      );
    }

    // Resolve DB user safely
    const clerkUserObj = await currentUser();
    if (!clerkUserObj) {
      return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 });
    }
    const dbUser = await getOrCreateDbUser(userId, clerkUserObj);

    // If projectId is provided, verify it exists and belongs to the user
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      if (project.authorId !== dbUser.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    // Create a new task
    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        priority: priority || 'medium',
        status: status || 'pending',
        dueDate: dueDate ? new Date(dueDate) : undefined,
        authorId: dbUser.id,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}