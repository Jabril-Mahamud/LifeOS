import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authObject = await auth();
  const userId = authObject.userId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find the user in our database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the project
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if the user is the author of the project
    if (project.authorId !== dbUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all tasks for this project
    const tasks = await prisma.task.findMany({
      where: { projectId: id },
      orderBy: [
        { status: 'asc' }, // Pending first, then in progress, then completed
        { dueDate: 'asc' }, // Sort by due date (earliest first)
      ],
    });

    // Calculate project statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Count tasks by status
    const taskStatusCount = {
      pending: tasks.filter(task => task.status === 'pending').length,
      inProgress: tasks.filter(task => task.status === 'in-progress').length,
      completed: completedTasks,
    };
    
    // Count tasks by priority
    const taskPriorityCount = {
      high: tasks.filter(task => task.priority === 'high').length,
      medium: tasks.filter(task => task.priority === 'medium').length,
      low: tasks.filter(task => task.priority === 'low').length,
    };
    
    // Get tasks with upcoming due dates
    const upcomingTasks = tasks.filter(task => 
      task.status !== 'completed' && 
      task.dueDate && 
      new Date(task.dueDate) >= new Date()
    );

    return NextResponse.json({
      project,
      tasks,
      stats: {
        totalTasks,
        completedTasks,
        progressPercentage,
        taskStatusCount,
        taskPriorityCount,
        upcomingTasks: upcomingTasks.length
      }
    });
  } catch (error) {
    console.error("Error fetching project statistics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}