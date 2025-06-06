"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  MoreHorizontal, 
  Archive, 
  ArchiveRestore,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingState, Project, ProjectStats } from "@/lib/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [projectStats, setProjectStats] = useState<Record<string, ProjectStats>>({});
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const router = useRouter();

  // Fetch projects with better error handling
  const fetchProjects = async (isRetry = false) => {
    if (isRetry) {
      setRetryCount(prev => prev + 1);
      setIsRetrying(true);
    } else {
      setLoadingState('loading');
    }
    
    setError(null);
    
    try {
      const response = await fetch("/api/projects");
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Projects not found. This might be your first time here!");
        } else if (response.status >= 500) {
          throw new Error("Server error. Please try again later.");
        } else {
          throw new Error(`Failed to fetch projects (${response.status})`);
        }
      }
      
      const data = await response.json();
      
      if (!data || !Array.isArray(data.projects)) {
        throw new Error("Invalid data format received from server");
      }

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
      setLoadingState('success');
      setRetryCount(0);
      setIsRetrying(false);

      // Fetch stats for each active project (don't block on this)
      if (active.length > 0) {
        active.forEach((project) => {
          fetchProjectStats(project.id);
        });
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
      setLoadingState('error');
      setIsRetrying(false);
      
      // Set empty arrays on error to prevent crashes
      setProjects([]);
      setArchivedProjects([]);
    }
  };

  // Fetch stats for a single project (non-blocking)
  const fetchProjectStats = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/stats`);
      if (response.ok) {
        const data = await response.json();
        if (data.stats) {
          setProjectStats((prev) => ({
            ...prev,
            [projectId]: data.stats,
          }));
        }
      }
    } catch (error) {
      console.error(`Error fetching stats for project ${projectId}:`, error);
      // Don't show error for stats as they're supplementary
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

  // Project card component
  const ProjectCard = ({ project, isArchived = false }: { project: Project; isArchived?: boolean }) => {
    const stats = projectStats[project.id];
    
    return (
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:border-accent border-2 ${
          isArchived ? 'opacity-60' : ''
        }`}
        onClick={() => router.push(`/projects/${project.id}`)}
      >
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {project.icon && (
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg shrink-0"
                  style={{ backgroundColor: project.color || '#6b7280' }}
                >
                  {project.icon}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                {project.description && (
                  <CardDescription className="line-clamp-2 mt-1">
                    {project.description}
                  </CardDescription>
                )}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 shrink-0"
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

                {!isArchived && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/tasks/new?projectId=${project.id}`);
                    }}
                  >
                    Add Task
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArchiveProject(project.id, !isArchived);
                  }}
                >
                  {isArchived ? (
                    <>
                      <ArchiveRestore className="h-4 w-4 mr-2" />
                      Unarchive
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </>
                  )}
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
        </CardHeader>
        
        <CardContent className="pt-0">
          {!isArchived && stats && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {stats.completedTasks} / {stats.totalTasks} tasks
                </span>
              </div>
              <Progress
                value={stats.progressPercentage}
                className="h-2"
                style={{
                  backgroundColor: project.color ? `${project.color}20` : undefined,
                }}
              />
              
              {stats.totalTasks > 0 && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{stats.taskStatusCount.pending} pending</span>
                  <span>{stats.taskStatusCount.inProgress} in progress</span>
                  <span>{stats.taskStatusCount.completed} completed</span>
                </div>
              )}
            </div>
          )}
          
          {isArchived && (
            <div className="text-sm text-muted-foreground">
              This project is archived
            </div>
          )}
          
          {!isArchived && (!stats || stats.totalTasks === 0) && (
            <div className="text-sm text-muted-foreground">
              No tasks yet • Click to add tasks
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Error state
  if (loadingState === 'error') {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground mt-1">
              Organize your work and track progress
            </p>
          </div>
          <Button onClick={() => router.push("/projects/new")} size="default" className="h-10">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchProjects(true)}
              disabled={isRetrying}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {retryCount > 0 ? `Retry (${retryCount})` : 'Retry'}
            </Button>
          </AlertDescription>
        </Alert>

        {/* Fallback empty state */}
        <Card className="text-center py-10">
          <CardContent>
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Unable to load projects</h3>
            <p className="text-muted-foreground mb-4">
              There was a problem loading your projects. You can still create a new one.
            </p>
            <Button onClick={() => router.push("/projects/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first project
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loadingState === 'loading') {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground mt-1">
              Organize your work and track progress
            </p>
          </div>
          <Button disabled size="default" className="h-10">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <div className="h-10 w-32 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-9 w-64 bg-muted animate-pulse rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-muted animate-pulse rounded-lg" />
                    <div>
                      <div className="h-5 w-32 bg-muted animate-pulse rounded mb-2" />
                      <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-2 bg-muted animate-pulse rounded" />
                  <div className="h-3 bg-muted animate-pulse rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Success state (may have empty data)
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Organize your work and track progress
          </p>
        </div>

        <Button 
          onClick={() => router.push("/projects/new")}
          size="default"
          className="h-10"
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

            <div className="relative max-w-xs ml-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <TabsContent value="active" className="mt-6">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-16">
                {searchTerm ? (
                  <>
                    <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No projects found</h3>
                    <p className="text-muted-foreground mb-4">
                      No projects match your search "{searchTerm}"
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setSearchTerm("")}
                    >
                      Clear search
                    </Button>
                  </>
                ) : projects.length === 0 ? (
                  <>
                    <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No projects yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Projects help you organize related tasks and track progress toward your goals. Create your first project to get started.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button onClick={() => router.push("/projects/new")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create your first project
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => router.push("/tasks/new")}
                      >
                        Create a task instead
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium mb-2">All projects are archived</h3>
                    <p className="text-muted-foreground mb-4">
                      Unarchive some projects or create a new one
                    </p>
                    <Button onClick={() => router.push("/projects/new")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create new project
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="archived" className="mt-6">
            {filteredArchivedProjects.length === 0 ? (
              <div className="text-center py-16">
                {searchTerm ? (
                  <>
                    <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No archived projects found</h3>
                    <p className="text-muted-foreground mb-4">
                      No archived projects match your search "{searchTerm}"
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setSearchTerm("")}
                    >
                      Clear search
                    </Button>
                  </>
                ) : (
                  <>
                    <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No archived projects</h3>
                    <p className="text-muted-foreground">
                      Archived projects will appear here
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArchivedProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} isArchived />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}