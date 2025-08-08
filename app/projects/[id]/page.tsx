import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ProjectDetail } from "@/components/projects/project-detail";
import prisma from "@/lib/prisma";
import { Project, ProjectStats, TaskStatus, TaskPriority } from "@/lib/types";
import { Metadata } from "next";
import { notFound } from "next/navigation";

async function getProjectData(projectId: string) {
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

  // Get the project with tasks
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      tasks: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Check if the user is the author of the project
  if (project.authorId !== dbUser.id) {
    redirect("/projects");
  }

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
  const stats: ProjectStats = {
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
  };

  const tasksWithStringDates = tasks.map(task => ({
    ...task,
    status: task.status as TaskStatus,
    priority: task.priority as TaskPriority,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    dueDate: task.dueDate?.toISOString() || null,
    completedAt: task.completedAt?.toISOString() || null,
  }));

  return { project: projectWithStringDates, tasks: tasksWithStringDates, stats };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { project } = await getProjectData(resolvedParams.id);
  return {
    title: `${project.name} | Projects | LifeOS`,
    description: project.description || `View and manage tasks for ${project.name}`,
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { project, tasks, stats } = await getProjectData(resolvedParams.id);

  return (
    <Suspense fallback={<ProjectDetailSkeleton />}>
      <ProjectDetail
        project={project}
        tasks={tasks}
        stats={stats}
      />
    </Suspense>
  );
}

function ProjectDetailSkeleton() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
          <div className="ml-4">
            <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-muted animate-pulse rounded" />
          <div className="h-10 w-10 bg-muted animate-pulse rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border rounded-lg p-6">
            <div className="h-5 w-24 bg-muted animate-pulse rounded mb-4" />
            <div className="h-16 w-16 bg-muted animate-pulse rounded-full mx-auto" />
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <div className="h-10 w-64 bg-muted animate-pulse rounded" />
          <div className="h-9 w-24 bg-muted animate-pulse rounded" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="h-5 w-5 bg-muted animate-pulse rounded-full" />
                <div className="flex-1">
                  <div className="h-5 w-48 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 w-64 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}