"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

type ProjectStats = {
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
  taskStatusCount: {
    pending: number;
    inProgress: number;
    completed: number;
  };
  upcomingTasks: number;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [projectStats, setProjectStats] = useState<
    Record<string, ProjectStats>
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
        description: "Failed to load projects",
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
        description: `Project ${shouldArchive ? "archived" : "unarchived"}`,
      });

      fetchProjects();
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        description: `Failed to ${shouldArchive ? "archive" : "unarchive"} project`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Delete this project? This will remove all associated tasks.")) {
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
        description: "Project deleted",
      });

      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        description: "Failed to delete project",
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

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl font-medium">Projects</h1>

        <Button 
          onClick={() => router.push("/projects/new")}
          size="sm"
          className="h-9"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <Tabs
          defaultValue="active"
          onValueChange={setActiveTab}
          value={activeTab}
          className="w-full"
        >
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="active">
                Active ({projects.length})
              </TabsTrigger>
              <TabsTrigger value="archived">
                Archived ({archivedProjects.length})
              </TabsTrigger>
            </TabsList>

            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs ml-auto"
            />
          </div>

          <TabsContent value="active" className="mt-6">
            {loading ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Loading projects...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground mb-4">No projects found</p>
                <Button
                  variant="outline"
                  onClick={() => router.push("/projects/new")}
                >
                  Create a new project
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProjects.map((project) => (
                  <div 
                    key={project.id}
                    className="p-4 border-b last:border-0 hover:bg-accent/5 rounded-sm cursor-pointer transition-colors"
                    onClick={() => router.push(`/projects/${project.id}`)}
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          {project.icon && <span>{project.icon}</span>}
                          {project.name}
                        </h3>
                        
                        {project.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {project.description}
                          </p>
                        )}
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/projects/${project.id}/edit`);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/tasks/new?projectId=${project.id}`);
                            }}
                          >
                            Add Task
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchiveProject(project.id, true);
                            }}
                          >
                            Archive
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {projectStats[project.id] && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                          <span>Progress</span>
                          <span>
                            {projectStats[project.id].completedTasks} / {projectStats[project.id].totalTasks} tasks
                          </span>
                        </div>
                        <Progress
                          value={projectStats[project.id].progressPercentage}
                          className="h-1"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="archived" className="mt-6">
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
              <div className="space-y-3">
                {filteredArchivedProjects.map((project) => (
                  <div 
                    key={project.id}
                    className="p-4 border-b last:border-0 opacity-60"
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          {project.icon && <span>{project.icon}</span>}
                          {project.name}
                        </h3>
                        
                        {project.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {project.description}
                          </p>
                        )}
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem
                            onClick={() => handleArchiveProject(project.id, false)}
                          >
                            Unarchive
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="mt-3 text-sm text-muted-foreground">
                      This project is archived
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}