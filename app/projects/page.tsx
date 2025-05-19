"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  Plus,
  Settings,
  MoreHorizontal,
  Edit,
  Trash2,
  Archive,
  ListTodo,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  _count?: {
    tasks: number;
  };
};

type ProjectWithStats = Project & {
  stats: {
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
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [projectStats, setProjectStats] = useState<
    Record<string, ProjectWithStats["stats"]>
  >({});
  const router = useRouter();

  // Fetch projects
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await response.json();

      // Separate active and archived projects
      const active: Project[] = [];
      const archived: Project[] = [];

      data.projects.forEach((project: Project) => {
        if (project.archived) {
          archived.push(project);
        } else {
          active.push(project);
        }
      });

      setProjects(active);
      setArchivedProjects(archived);

      // Fetch stats for each active project
      active.forEach((project) => {
        fetchProjectStats(project.id);
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats for a single project
  const fetchProjectStats = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/stats`);
      if (!response.ok) {
        throw new Error("Failed to fetch project stats");
      }
      const data = await response.json();

      setProjectStats((prev) => ({
        ...prev,
        [projectId]: data.stats,
      }));
    } catch (error) {
      console.error(`Error fetching stats for project ${projectId}:`, error);
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchProjects();
  }, []);

  // Handle project actions
  const handleArchiveProject = async (
    projectId: string,
    shouldArchive: boolean
  ) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ archived: shouldArchive }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${shouldArchive ? "archive" : "unarchive"} project`
        );
      }

      toast({
        description: `Project ${
          shouldArchive ? "archived" : "unarchived"
        } successfully`,
      });

      fetchProjects();
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: `Failed to ${
          shouldArchive ? "archive" : "unarchive"
        } project. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This will remove all associated tasks."
      )
    ) {
      return;
    }

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

      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter projects by search term
  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description &&
        project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredArchivedProjects = archivedProjects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description &&
        project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Helper function to generate a default color if none is provided
  const getProjectColor = (project: Project) => {
    if (project.color) return project.color;

    // Generate a color based on project name
    const colors = [
      "#3b82f6", // blue
      "#10b981", // emerald
      "#f97316", // orange
      "#8b5cf6", // violet
      "#ec4899", // pink
      "#06b6d4", // cyan
      "#f59e0b", // amber
      "#6366f1", // indigo
    ];

    const index = project.name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <LayoutGrid className="h-6 w-6 mr-2" />
            Projects
          </h1>
          <p className="text-muted-foreground">
            Manage your projects and associated tasks
          </p>
        </div>

        <Button onClick={() => router.push("/projects/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <Tabs
          defaultValue="active"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <TabsList>
            <TabsTrigger value="active">
              Active Projects ({projects.length})
            </TabsTrigger>
            <TabsTrigger value="archived">
              Archived ({archivedProjects.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="m-0">
            {loading ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Loading projects...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No projects found</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push("/projects/new")}
                >
                  Create a new project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/projects/${project.id}`)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center mr-2 text-white"
                            style={{
                              backgroundColor: getProjectColor(project),
                            }}
                          >
                            {project.icon ||
                              project.name.charAt(0).toUpperCase()}
                          </div>
                          <CardTitle className="text-lg">
                            {project.name}
                          </CardTitle>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/projects/${project.id}/edit`);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/tasks/new?projectId=${project.id}`
                                );
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Task
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArchiveProject(project.id, true);
                              }}
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="text-red-500 focus:text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProject(project.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {project.description && (
                        <CardDescription className="line-clamp-2">
                          {project.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent>
                      {projectStats[project.id] ? (
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>
                              {projectStats[project.id].progressPercentage}%
                            </span>
                          </div>
                          <Progress
                            value={projectStats[project.id].progressPercentage}
                            className="h-1.5"
                          />

                          <div className="flex justify-between text-sm mt-4">
                            <div className="flex items-center">
                              <ListTodo className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {
                                  projectStats[project.id].taskStatusCount
                                    .pending
                                }{" "}
                                pending
                              </span>
                            </div>

                            <div className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                              <span className="text-muted-foreground">
                                {projectStats[project.id].completedTasks}{" "}
                                completed
                              </span>
                            </div>
                          </div>

                          {projectStats[project.id].upcomingTasks > 0 && (
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 mr-1 text-amber-500" />
                              <span className="text-muted-foreground">
                                {projectStats[project.id].upcomingTasks}{" "}
                                upcoming
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-2 text-sm text-muted-foreground text-center">
                          Loading project stats...
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="pt-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/tasks?projectId=${project.id}`);
                        }}
                      >
                        View Tasks
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="archived" className="m-0">
            {loading ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  Loading archived projects...
                </p>
              </div>
            ) : filteredArchivedProjects.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  No archived projects found
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArchivedProjects.map((project) => (
                  <Card key={project.id} className="opacity-75">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center mr-2 text-white"
                            style={{
                              backgroundColor: getProjectColor(project),
                            }}
                          >
                            {project.icon ||
                              project.name.charAt(0).toUpperCase()}
                          </div>
                          <CardTitle className="text-lg">
                            {project.name}
                          </CardTitle>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() =>
                                handleArchiveProject(project.id, false)
                              }
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Unarchive
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="text-red-500 focus:text-red-500"
                              onClick={() => handleDeleteProject(project.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {project.description && (
                        <CardDescription className="line-clamp-2">
                          {project.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        This project is archived
                      </div>
                    </CardContent>

                    <CardFooter className="pt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleArchiveProject(project.id, false)}
                      >
                        Unarchive Project
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex-1 max-w-xs ml-auto">
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
