"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Filter, 
  ListTodo, 
  Plus
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
import { toast } from "@/hooks/use-toast";

type Project = {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
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
  project: {
    name: string;
    color: string | null;
    icon: string | null;
  } | null;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const router = useRouter();

  // Fetch tasks based on filters
  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      if (selectedProject !== "all") params.append("projectId", selectedProject);
      if (selectedPriority !== "all") params.append("priority", selectedPriority);
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      
      const response = await fetch(`/api/tasks${params.toString() ? `?${params.toString()}` : ""}`);
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      setTasks(data.tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        description: "Failed to load tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects for filter dropdown
  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await response.json();
      setProjects(data.projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
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
    fetchTasks();
  }, [selectedProject, selectedPriority, selectedStatus]);

  // Filter tasks by search term
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Task counts
  const pendingCount = tasks.filter(task => task.status === "pending").length;
  const inProgressCount = tasks.filter(task => task.status === "in-progress").length;
  const completedCount = tasks.filter(task => task.status === "completed").length;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl font-medium">Tasks</h1>
        
        <Button onClick={() => router.push("/tasks/new")} size="sm" className="h-9">
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 w-full sm:max-w-md">
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
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
                    <DropdownMenuLabel className="text-xs">Project</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setSelectedProject("all")}>
                      All Projects
                    </DropdownMenuItem>
                    {projects.map((project) => (
                      <DropdownMenuItem 
                        key={project.id}
                        onClick={() => setSelectedProject(project.id)}
                      >
                        {project.icon} {project.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs">Priority</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setSelectedPriority("all")}>
                      All Priorities
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedPriority("high")}>
                      High
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedPriority("medium")}>
                      Medium
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedPriority("low")}>
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
                  <SelectItem value="all">All Tasks ({tasks.length})</SelectItem>
                  <SelectItem value="pending">Pending ({pendingCount})</SelectItem>
                  <SelectItem value="in-progress">In Progress ({inProgressCount})</SelectItem>
                  <SelectItem value="completed">Completed ({completedCount})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <TaskList 
            tasks={filteredTasks}
            onTaskUpdate={fetchTasks}
          />
        </CardContent>
      </Card>
    </div>
  );
}