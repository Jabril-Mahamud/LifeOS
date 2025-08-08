import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { TasksListView } from "@/components/tasks/tasks-list-view";
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { TaskStatus, TaskPriority } from "@/lib/types";

async function getTasksData() {
  const authObject = await auth();
  const userId = authObject.userId;
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Find the user in our database
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!dbUser) {
    redirect("/sign-in");
  }

  // Get user's tasks
  const tasks = await prisma.task.findMany({
    where: { authorId: dbUser.id },
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

  // Get user's projects for filtering
  const projects = await prisma.project.findMany({
    where: { 
      authorId: dbUser.id,
      archived: false // Only show non-archived projects
    },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      color: true,
      icon: true,
    },
  });

  // Convert dates to strings
  const tasksWithStringDates = tasks.map(task => ({
    ...task,
    status: task.status as TaskStatus,
    priority: task.priority as TaskPriority,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    dueDate: task.dueDate?.toISOString() || null,
    completedAt: task.completedAt?.toISOString() || null,
  }));

  const projectsWithStringDates = projects.map(project => ({
    ...project,
    description: null, // Required by the type
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completed: false,
    archived: false,
    authorId: dbUser.id,
  }));

  return { tasks: tasksWithStringDates, projects: projectsWithStringDates };
}

export const metadata: Metadata = {
  title: "Tasks | LifeOS",
  description: "Manage and track your tasks",
};

export default async function TasksPage() {
  const { tasks, projects } = await getTasksData();

  return (
    <Suspense fallback={<TasksListSkeleton />}>
      <TasksListView
        tasks={tasks}
        projects={projects}
      />
    </Suspense>
  );
}

function TasksListSkeleton() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl font-medium">Tasks</h1>
        <div className="h-9 w-24 bg-muted animate-pulse rounded" />
      </div>

      <div className="bg-card border rounded-lg">
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:max-w-md">
              <div className="h-9 bg-muted animate-pulse rounded" />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="h-9 w-20 bg-muted animate-pulse rounded" />
              <div className="h-9 w-32 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-5 w-5 bg-muted animate-pulse rounded-full" />
                <div className="flex-1">
                  <div className="h-5 w-48 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 w-64 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}