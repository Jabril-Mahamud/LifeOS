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

    // Get the task
    const task = await prisma.task.findUnique({
      where: { id },
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

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if the user is the author of the task
    if (task.authorId !== dbUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, projectId, priority, dueDate, status, completedAt } = await req.json();

    // Find the user in our database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the task
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if the user is the author of the task
    if (task.authorId !== dbUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If projectId is provided and changed, verify it exists and belongs to the user
    if (projectId !== undefined && projectId !== task.projectId) {
      if (projectId) {
        const project = await prisma.project.findUnique({
          where: { id: projectId },
        });

        if (!project) {
          return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        if (project.authorId !== dbUser.id) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
      }
    }

    // Handle status updates to "completed"
    let updatedCompletedAt = completedAt;
    if (status === "completed" && task.status !== "completed") {
      updatedCompletedAt = new Date();
    } else if (status !== "completed" && task.status === "completed") {
      updatedCompletedAt = null;
    }

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title: title !== undefined ? title : task.title,
        description: description !== undefined ? description : task.description,
        projectId: projectId !== undefined ? projectId : task.projectId,
        priority: priority !== undefined ? priority : task.priority,
        status: status !== undefined ? status : task.status,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : task.dueDate,
        completedAt: updatedCompletedAt,
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

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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

    // Get the task
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if the user is the author of the task
    if (task.authorId !== dbUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the task
    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}