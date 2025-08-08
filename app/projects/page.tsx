import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ProjectList } from "@/components/projects/project-list";
import prisma from "@/lib/prisma";
import { Project, ProjectStats, TaskStatus, TaskPriority } from "@/lib/types";
import { Metadata } from "next";

async function getProjects() {
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
    throw new Error("User not found");
  }

  // Get all projects (both active and archived)
  const projects = await prisma.project.findMany({
    where: { authorId: dbUser.id },
    orderBy: { createdAt: "asc" },
    include: {
      tasks: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  // Separate active and archived projects
  const active: Project[] = [];
  const archived: Project[] = [];
  const stats: Record<string, ProjectStats> = {};

  for (const project of projects) {
    // Calculate project statistics
    const tasks = project.tasks || [];
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

    // Store stats
    stats[project.id] = {
      totalTasks,
      completedTasks,
      progressPercentage,
      taskStatusCount,
      taskPriorityCount,
      upcomingTasks: upcomingTasks.length
    };

    // Convert dates to strings
    const projectWithStringDates = {
      ...project,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      tasks: project.tasks.map(task => ({
        ...task,
        status: task.status as TaskStatus,
        priority: task.priority as TaskPriority,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        dueDate: task.dueDate?.toISOString() || null,
        completedAt: task.completedAt?.toISOString() || null,
      })),
    };

    // Add project to appropriate list
    if (project.archived) {
      archived.push(projectWithStringDates);
    } else {
      active.push(projectWithStringDates);
    }
  }

  return { active, archived, stats };
}

export const metadata: Metadata = {
  title: "Projects | LifeOS",
  description: "Organize your work and track progress with projects",
};

export default async function ProjectsPage() {
  const { active, archived, stats } = await getProjects();

  return (
    <Suspense fallback={<ProjectListSkeleton />}>
      <ProjectList
        projects={active}
        archivedProjects={archived}
        projectStats={stats}
      />
    </Suspense>
  );
}

function ProjectListSkeleton() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Organize your work and track progress
          </p>
        </div>
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-9 w-64 bg-muted animate-pulse rounded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card border rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-muted animate-pulse rounded-lg" />
                  <div>
                    <div className="h-5 w-32 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              </div>
              <div className="space-y-3 mt-4">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-2 bg-muted animate-pulse rounded" />
                <div className="h-3 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}