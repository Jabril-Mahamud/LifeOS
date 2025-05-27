"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Filter,
  ListTodo,
  Plus,
  AlertCircle,
  RefreshCw,
  CheckSquare,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TaskList } from "@/components/tasks/task-list";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { LoadingState, Project, TaskWithProject } from "@/lib/types";

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithProject[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const router = useRouter();

  // Fetch tasks based on filters with better error handling
  const fetchTasks = async (isRetry = false) => {
    if (isRetry) {
      setRetryCount((prev) => prev + 1);
      setIsRetrying(true);
    } else {
      setLoadingState("loading");
    }

    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams();
      if (selectedProject !== "all")
        params.append("projectId", selectedProject);
      if (selectedPriority !== "all")
        params.append("priority", selectedPriority);
      if (selectedStatus !== "all") params.append("status", selectedStatus);

      const response = await fetch(
        `/api/tasks${params.toString() ? `?${params.toString()}` : ""}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            "Tasks not found. This might be your first time here!"
          );
        } else if (response.status >= 500) {
          throw new Error("Server error. Please try again later.");
        } else {
          throw new Error(`Failed to fetch tasks (${response.status})`);
        }
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.tasks)) {
        throw new Error("Invalid data format received from server");
      }

      setTasks(data.tasks);
      setLoadingState("success");
      setRetryCount(0);
      setIsRetrying(false);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      setLoadingState("error");
      setIsRetrying(false);

      // Set empty array on error to prevent crashes
      setTasks([]);
    }
  };

  // Fetch projects for filter dropdown with error handling
  const fetchProjects = async () => {
    setProjectsLoading(true);
    try {
      const response = await fetch("/api/projects");

      if (!response.ok) {
        console.warn("Could not fetch projects:", response.status);
        setProjects([]);
        return;
      }

      const data = await response.json();

      if (data && Array.isArray(data.projects)) {
        setProjects(data.projects);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
      // Don't show error for projects as they're for filtering only
    } finally {
      setProjectsLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      await fetchProjects();
      await fetchTasks();
    };

    loadData();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (loadingState !== "loading") {
      fetchTasks();
    }
  }, [selectedProject, selectedPriority, selectedStatus]);

  // Filter tasks by search term
  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Task counts
  const pendingCount = tasks.filter((task) => task.status === "pending").length;
  const inProgressCount = tasks.filter(
    (task) => task.status === "in-progress"
  ).length;
  const completedCount = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  // Error state
  if (loadingState === "error") {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl font-medium">Tasks</h1>
          <Button
            onClick={() => router.push("/tasks/new")}
            size="sm"
            className="h-9"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchTasks(true)}
              disabled={isRetrying}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRetrying ? "animate-spin" : ""}`}
              />
              {retryCount > 0 ? `Retry (${retryCount})` : "Retry"}
            </Button>
          </AlertDescription>
        </Alert>

        {/* Fallback empty state */}
        <Card className="text-center py-10">
          <CardContent>
            <ListTodo className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Unable to load tasks</h3>
            <p className="text-muted-foreground mb-4">
              There was a problem loading your tasks. You can still create a new
              one.
            </p>
            <Button onClick={() => router.push("/tasks/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first task
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loadingState === "loading") {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl font-medium">Tasks</h1>
          <Button disabled size="sm" className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="w-full sm:max-w-md">
                <div className="h-9 bg-muted animate-pulse rounded" />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="h-9 w-20 bg-muted animate-pulse rounded" />
                <div className="h-9 w-32 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="h-16 bg-muted animate-pulse rounded" />
              <div className="h-16 bg-muted animate-pulse rounded" />
              <div className="h-16 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state (may have empty data)
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl font-medium">Tasks</h1>

        <Button
          onClick={() => router.push("/tasks/new")}
          size="sm"
          className="h-9"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 w-full sm:max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter Tasks</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs">
                      Project
                    </DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setSelectedProject("all")}>
                      All Projects
                    </DropdownMenuItem>
                    {projectsLoading ? (
                      <DropdownMenuItem disabled>
                        Loading projects...
                      </DropdownMenuItem>
                    ) : projects.length > 0 ? (
                      projects.map((project) => (
                        <DropdownMenuItem
                          key={project.id}
                          onClick={() => setSelectedProject(project.id)}
                        >
                          {project.icon} {project.name}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>
                        No projects available
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs">
                      Priority
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => setSelectedPriority("all")}
                    >
                      All Priorities
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSelectedPriority("high")}
                    >
                      High
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSelectedPriority("medium")}
                    >
                      Medium
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSelectedPriority("low")}
                    >
                      Low
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Select
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value)}
              >
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Tasks ({tasks.length})
                  </SelectItem>
                  <SelectItem value="pending">
                    Pending ({pendingCount})
                  </SelectItem>
                  <SelectItem value="in-progress">
                    In Progress ({inProgressCount})
                  </SelectItem>
                  <SelectItem value="completed">
                    Completed ({completedCount})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {tasks.length === 0 && !searchTerm ? (
            // No tasks at all
            <div className="text-center py-12">
              <CheckSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No tasks yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get organized by creating your first task. Break down your work
                into manageable pieces and track your progress.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => router.push("/tasks/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first task
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/projects/new")}
                >
                  Create a project first
                </Button>
              </div>
            </div>
          ) : filteredTasks.length === 0 && searchTerm ? (
            // No search results
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-4">
                No tasks match your search "{searchTerm}"
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Clear search
                </Button>
                <Button onClick={() => router.push("/tasks/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create new task
                </Button>
              </div>
            </div>
          ) : filteredTasks.length === 0 ? (
            // No tasks matching filters
            <div className="text-center py-12">
              <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No tasks match your filters
              </h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or create a new task
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedProject("all");
                    setSelectedPriority("all");
                    setSelectedStatus("all");
                  }}
                >
                  Clear filters
                </Button>
                <Button onClick={() => router.push("/tasks/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create new task
                </Button>
              </div>
            </div>
          ) : (
            // Show tasks
            <TaskList tasks={filteredTasks} onTaskUpdate={fetchTasks} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
