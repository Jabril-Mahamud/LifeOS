"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Filter,
  ListTodo,
  Plus,
  CheckSquare,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Project, TaskWithProject } from "@/lib/types";
import { Pagination } from "@/components/ui/pagination";

interface TasksListViewProps {
  tasks: TaskWithProject[];
  projects: Project[];
}

export function TasksListView({ tasks: initialTasks, projects }: TasksListViewProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const router = useRouter();

  // Filter tasks by search term
  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Task counts
  const pendingCount = totalTasks > 0 ? tasks.filter((task) => task.status === "pending").length : 0;
  const inProgressCount = totalTasks > 0 ? tasks.filter(
    (task) => task.status === "in-progress"
  ).length : 0;
  const completedCount = totalTasks > 0 ? tasks.filter(
    (task) => task.status === "completed"
  ).length : 0;

  // Handle task update
  const handleTaskUpdate = async () => {
    // Build query params
    const params = new URLSearchParams();
    if (selectedProject !== "all")
      params.append("projectId", selectedProject);
    if (selectedPriority !== "all")
      params.append("priority", selectedPriority);
    if (selectedStatus !== "all")
      params.append("status", selectedStatus);
    params.append("page", currentPage.toString());
    params.append("limit", "20");

    try {
      const response = await fetch(
        `/api/tasks${params.toString() ? `?${params.toString()}` : ""}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();
      setTasks(data.tasks);
      setTotalPages(data.pagination.totalPages);
      setTotalTasks(data.pagination.total);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  return (
    <div className="container mx-auto p-6 pb-24 max-w-4xl">
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
                    <DropdownMenuItem onClick={() => {
                      setSelectedProject("all");
                      handleTaskUpdate();
                    }}>
                      All Projects
                    </DropdownMenuItem>
                    {projects.length > 0 ? (
                      projects.map((project) => (
                        <DropdownMenuItem
                          key={project.id}
                          onClick={() => {
                            setSelectedProject(project.id);
                            handleTaskUpdate();
                          }}
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
                      onClick={() => {
                        setSelectedPriority("all");
                        handleTaskUpdate();
                      }}
                    >
                      All Priorities
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedPriority("high");
                        handleTaskUpdate();
                      }}
                    >
                      High
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedPriority("medium");
                        handleTaskUpdate();
                      }}
                    >
                      Medium
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedPriority("low");
                        handleTaskUpdate();
                      }}
                    >
                      Low
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  setSelectedStatus(value);
                  handleTaskUpdate();
                }}
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
                No tasks match your search &quot;{searchTerm}&quot;
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
                    handleTaskUpdate();
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
            <>
              <TaskList tasks={filteredTasks} onTaskUpdate={handleTaskUpdate} />
              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                      handleTaskUpdate();
                    }}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}