import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { updateHabitSchema } from "@/lib/validation/habits";

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

    // Get the habit
    const habit = await prisma.habit.findUnique({
      where: { id },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Check if the user is the author of the habit
    if (habit.authorId !== dbUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ habit });
  } catch (error) {
    console.error("Error fetching habit:", error);
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
    const body = await req.json();
    const parsed = updateHabitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", issues: parsed.error.issues },
        { status: 400 }
      );
    }
    const { name, description, icon, color, active } = parsed.data;

    // Find the user in our database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the habit
    const habit = await prisma.habit.findUnique({
      where: { id },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Check if the user is the author of the habit
    if (habit.authorId !== dbUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If name is being changed, check for duplicates
    if (name && name !== habit.name) {
      const existingHabit = await prisma.habit.findFirst({
        where: {
          authorId: dbUser.id,
          name,
          id: { not: id }, // exclude current habit
        },
      });

      if (existingHabit) {
        return NextResponse.json(
          { error: "A habit with this name already exists" },
          { status: 400 }
        );
      }
    }

    // Update the habit
    const updatedHabit = await prisma.habit.update({
      where: { id },
      data: {
        name: name !== undefined ? name : habit.name,
        description:
          description !== undefined ? description : habit.description,
        icon: icon !== undefined ? icon : habit.icon,
        color: color !== undefined ? color : habit.color,
        active: active !== undefined ? active : habit.active,
      },
    });

    return NextResponse.json({ habit: updatedHabit });
  } catch (error) {
    console.error("Error updating habit:", error);
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

    // Get the habit
    const habit = await prisma.habit.findUnique({
      where: { id },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Check if the user is the author of the habit
    if (habit.authorId !== dbUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the habit
    await prisma.habit.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting habit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
