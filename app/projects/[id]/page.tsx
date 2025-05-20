"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  Edit,
  Trash2,
  MoreHorizontal,
  Archive,
  PlusCircle,
  CheckCircle2,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/circular-progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

type Project = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  completed: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  completedAt: string | null;
  projectId: string | null;
};

type ProjectStats = {
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
  taskStatusCount: {
    pending: number;
    inProgress: number;
    completed: number;
  };
  taskPriorityCount: {
    high: number;
    medium: number;
    low: number;
  };
  upcomingTasks: number;
};

interface PageProps {
  params: Promise<{ id: string }>;
}
export default function ProjectDetailPage({ params }: PageProps) {
  // In this case, we don't need to use React.use() since we're directly receiving
  // the params object in this client component
  const resolvedParams = React.use(params);
  const projectId = resolvedParams.id;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const router = useRouter();

  // Fetch project data
  useEffect(() => {
    if (!projectId) return; // Check if projectId exists

    const fetchProjectData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/projects/${projectId}/stats`);
        if (!response.ok) {
          throw new Error("Failed to fetch project data");
        }
        const data = await response.json();

        setProject(data.project);
        setTasks(data.tasks);
        setStats(data.stats);
      } catch (error) {
        console.error("Error fetching project data:", error);
        toast({
          title: "Error",
          description: "Failed to load project data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  // Delete project
  const handleDeleteProject = async () => {
    if (!projectId) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      toast({
        description: "Project deleted successfully",
      });

      router.push("/projects");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  // Archive/unarchive project
  const handleArchiveProject = async () => {
    if (!projectId || !project) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ archived: !project.archived }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${project.archived ? "unarchive" : "archive"} project`
        );
      }

      toast({
        description: `Project ${
          project.archived ? "unarchived" : "archived"
        } successfully`,
      });

      // Refresh data
      const updatedProject = await response.json();
      setProject(updatedProject.project);
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: `Failed to ${
          project.archived ? "unarchive" : "archive"
        } project. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsArchiveDialogOpen(false);
    }
  };

  // Toggle task status
  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    setUpdatingTaskId(taskId);

    try {
      // Determine next status in the workflow
      let nextStatus =
        currentStatus === "completed"
          ? "pending"
          : currentStatus === "pending"
          ? "in-progress"
          : "completed";

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }

      // Refresh data
      const updatedTaskData = await response.json();

      // Update the task in the local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? updatedTaskData.task : task
        )
      );

      // Update stats
      if (currentStatus !== "completed" && nextStatus === "completed") {
        setStats((prevStats) => {
          if (!prevStats) return null;
          return {
            ...prevStats,
            completedTasks: prevStats.completedTasks + 1,
            progressPercentage: Math.round(
              ((prevStats.completedTasks + 1) / prevStats.totalTasks) * 100
            ),
            taskStatusCount: {
              ...prevStats.taskStatusCount,
              [currentStatus]:
                prevStats.taskStatusCount[
                  currentStatus as keyof typeof prevStats.taskStatusCount
                ] - 1,
              completed: prevStats.taskStatusCount.completed + 1,
            },
          };
        });
      } else if (currentStatus === "completed" && nextStatus !== "completed") {
        setStats((prevStats) => {
          if (!prevStats) return null;
          return {
            ...prevStats,
            completedTasks: prevStats.completedTasks - 1,
            progressPercentage: Math.round(
              ((prevStats.completedTasks - 1) / prevStats.totalTasks) * 100
            ),
            taskStatusCount: {
              ...prevStats.taskStatusCount,
              [nextStatus]:
                prevStats.taskStatusCount[
                  nextStatus as keyof typeof prevStats.taskStatusCount
                ] + 1,
              completed: prevStats.taskStatusCount.completed - 1,
            },
          };
        });
      } else if (currentStatus !== nextStatus) {
        setStats((prevStats) => {
          if (!prevStats) return null;
          return {
            ...prevStats,
            taskStatusCount: {
              ...prevStats.taskStatusCount,
              [currentStatus]:
                prevStats.taskStatusCount[
                  currentStatus as keyof typeof prevStats.taskStatusCount
                ] - 1,
              [nextStatus]:
                prevStats.taskStatusCount[
                  nextStatus as keyof typeof prevStats.taskStatusCount
                ] + 1,
            },
          };
        });
      }

      toast({
        description: `Task marked as ${nextStatus.replace("-", " ")}`,
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    setUpdatingTaskId(taskId);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      // Remove the task from the local state
      const taskToRemove = tasks.find((task) => task.id === taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

      // Update stats
      if (taskToRemove) {
        setStats((prevStats) => {
          if (!prevStats) return null;

          const wasCompleted = taskToRemove.status === "completed";
          const newCompletedTasks = wasCompleted
            ? prevStats.completedTasks - 1
            : prevStats.completedTasks;
          const newTotalTasks = prevStats.totalTasks - 1;
          const newProgressPercentage =
            newTotalTasks > 0
              ? Math.round((newCompletedTasks / newTotalTasks) * 100)
              : 0;

          return {
            ...prevStats,
            totalTasks: newTotalTasks,
            completedTasks: newCompletedTasks,
            progressPercentage: newProgressPercentage,
            taskStatusCount: {
              ...prevStats.taskStatusCount,
              [taskToRemove.status]:
                prevStats.taskStatusCount[
                  taskToRemove.status as keyof typeof prevStats.taskStatusCount
                ] - 1,
            },
            taskPriorityCount: {
              ...prevStats.taskPriorityCount,
              [taskToRemove.priority]:
                prevStats.taskPriorityCount[
                  taskToRemove.priority as keyof typeof prevStats.taskPriorityCount
                ] - 1,
            },
          };
        });
      }

      toast({
        description: "Task deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Format a date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;

    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return format(date, "MMM d, yyyy");
    }
  };

  // Priority colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-amber-500";
      case "low":
        return "text-blue-500";
      default:
        return "";
    }
  };

  // Render a task item
  const renderTaskItem = (task: Task) => (
    <div
      key={task.id}
      className={`flex items-center justify-between p-3 rounded-md border mb-2 ${
        updatingTaskId === task.id ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 rounded-full p-0 mt-1"
          onClick={() => toggleTaskStatus(task.id, task.status)}
          disabled={updatingTaskId === task.id}
        >
          {task.status === "completed" ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : task.status === "in-progress" ? (
            <div className="h-5 w-5 rounded-full border-2 border-amber-500 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-amber-500"></div>
            </div>
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground"></div>
          )}
          <span className="sr-only">Toggle status</span>
        </Button>

        <div
          className="flex-1 min-w-0"
          onClick={() => router.push(`/tasks/${task.id}/edit`)}
        >
          <div className="flex items-center gap-2">
            <span
              className={`font-medium ${
                task.status === "completed"
                  ? "line-through text-muted-foreground"
                  : ""
              }`}
            >
              {task.title}
            </span>
            {task.priority !== "medium" && (
              <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                {task.priority === "high" ? "High Priority" : "Low Priority"}
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
              {task.description}
            </p>
          )}

          {task.dueDate && (
            <div className="flex items-center mt-2">
              <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Due: {formatDate(task.dueDate)}
              </span>
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => router.push(`/tasks/${task.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => toggleTaskStatus(task.id, "pending")}
            >
              <div className="h-4 w-4 mr-2 rounded-full border border-muted-foreground"></div>
              Pending
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => toggleTaskStatus(task.id, "in-progress")}
            >
              <div className="h-4 w-4 mr-2 rounded-full border border-amber-500 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
              </div>
              In Progress
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => toggleTaskStatus(task.id, "completed")}
            >
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
              Completed
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-red-500 focus:text-red-500"
              onClick={() => handleDeleteTask(task.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Loading project data...</h1>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Project not found</h1>
        </div>
        <p className="text-muted-foreground">
          The requested project could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="ml-2">
            <h1 className="text-2xl font-bold flex items-center">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-white mr-2"
                style={{
                  backgroundColor: project.color || "hsl(var(--primary))",
                }}
              >
                {project.icon || project.name.charAt(0).toUpperCase()}
              </span>
              {project.name}
            </h1>
            {project.description && (
              <p className="text-muted-foreground">{project.description}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/tasks/new?projectId=${project.id}`)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Task
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Project Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => router.push(`/projects/${projectId}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setIsArchiveDialogOpen(true)}>
                <Archive className="h-4 w-4 mr-2" />
                {project.archived ? "Unarchive Project" : "Archive Project"}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-red-500 focus:text-red-500"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Project Progress */}
      {project.archived && (
        <div className="bg-muted/50 border rounded-md p-4 text-center">
          <p className="text-muted-foreground">
            This project is archived. You can unarchive it to make changes.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Progress Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <CircularProgress
              value={stats?.progressPercentage || 0}
              size="md"
              color={project.color || "hsl(var(--primary))"}
            />
          </CardContent>
        </Card>

        {/* Task Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Task Status</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xl font-semibold">
                  {stats?.taskStatusCount.pending || 0}
                </div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
              <div>
                <div className="text-xl font-semibold">
                  {stats?.taskStatusCount.inProgress || 0}
                </div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
              <div>
                <div className="text-xl font-semibold">
                  {stats?.taskStatusCount.completed || 0}
                </div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Priority */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xl font-semibold text-red-500">
                  {stats?.taskPriorityCount.high || 0}
                </div>
                <div className="text-xs text-muted-foreground">High</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-amber-500">
                  {stats?.taskPriorityCount.medium || 0}
                </div>
                <div className="text-xs text-muted-foreground">Medium</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-blue-500">
                  {stats?.taskPriorityCount.low || 0}
                </div>
                <div className="text-xs text-muted-foreground">Low</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <div className="text-center">
              <div className="text-3xl font-semibold">
                {stats?.upcomingTasks || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Tasks with due dates
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <div className="mt-8">
        <Tabs defaultValue="all">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">All Tasks ({tasks.length})</TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({stats?.taskStatusCount.pending || 0})
              </TabsTrigger>
              <TabsTrigger value="in-progress">
                In Progress ({stats?.taskStatusCount.inProgress || 0})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({stats?.taskStatusCount.completed || 0})
              </TabsTrigger>
            </TabsList>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/tasks/new?projectId=${project.id}`)}
              disabled={project.archived}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>

          <div className="mt-4">
            <TabsContent value="all">
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No tasks found for this project
                  </p>
                  <Button
                    onClick={() =>
                      router.push(`/tasks/new?projectId=${project.id}`)
                    }
                    disabled={project.archived}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add First Task
                  </Button>
                </div>
              ) : (
                <div>{tasks.map((task) => renderTaskItem(task))}</div>
              )}
            </TabsContent>

            <TabsContent value="pending">
              {tasks.filter((task) => task.status === "pending").length ===
              0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No pending tasks</p>
                </div>
              ) : (
                <div>
                  {tasks
                    .filter((task) => task.status === "pending")
                    .map((task) => renderTaskItem(task))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="in-progress">
              {tasks.filter((task) => task.status === "in-progress").length ===
              0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No in-progress tasks</p>
                </div>
              ) : (
                <div>
                  {tasks
                    .filter((task) => task.status === "in-progress")
                    .map((task) => renderTaskItem(task))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {tasks.filter((task) => task.status === "completed").length ===
              0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No completed tasks</p>
                </div>
              ) : (
                <div>
                  {tasks
                    .filter((task) => task.status === "completed")
                    .map((task) => renderTaskItem(task))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot
              be undone and will remove all tasks associated with this project.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject}>
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {project.archived ? "Unarchive Project" : "Archive Project"}
            </DialogTitle>
            <DialogDescription>
              {project.archived
                ? "This will restore the project to your active projects list."
                : "This will move the project to your archived projects list. You can unarchive it later if needed."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsArchiveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleArchiveProject}>
              {project.archived ? "Unarchive Project" : "Archive Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
