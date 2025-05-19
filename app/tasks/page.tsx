"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Filter, 
  ListTodo, 
  Plus, 
  CalendarIcon, 
  CheckCircle2, 
  Circle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [selectedStatus, setSelectedStatus] = useState<string>("pending");
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
        title: "Error",
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

  // Handle status tab change
  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
  };

  // Calculate counts for different statuses
  const pendingCount = tasks.filter(task => task.status === "pending").length;
  const inProgressCount = tasks.filter(task => task.status === "in-progress").length;
  const completedCount = tasks.filter(task => task.status === "completed").length;

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <ListTodo className="h-6 w-6 mr-2" />
            Tasks
          </h1>
          <p className="text-muted-foreground">
            Manage and organize your tasks
          </p>
        </div>
        
        <Button onClick={() => router.push("/tasks/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
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
                      <ArrowUp className="h-4 w-4 mr-2 text-red-500" />
                      High
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedPriority("medium")}>
                      <ArrowUpDown className="h-4 w-4 mr-2 text-amber-500" />
                      Medium
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedPriority("low")}>
                      <ArrowDown className="h-4 w-4 mr-2 text-blue-500" />
                      Low
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Select
                value={selectedStatus}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="pending" onValueChange={handleStatusChange} value={selectedStatus}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending" className="flex items-center gap-1">
                <Circle className="h-4 w-4" />
                Pending
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-secondary">
                  {pendingCount}
                </span>
              </TabsTrigger>
              
              <TabsTrigger value="in-progress" className="flex items-center gap-1">
                <ArrowUpDown className="h-4 w-4" />
                In Progress
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-secondary">
                  {inProgressCount}
                </span>
              </TabsTrigger>
              
              <TabsTrigger value="completed" className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Completed
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-secondary">
                  {completedCount}
                </span>
              </TabsTrigger>
              
              <TabsTrigger value="all" className="flex items-center gap-1">
                <ListTodo className="h-4 w-4" />
                All
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-secondary">
                  {tasks.length}
                </span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="m-0">
              <TaskList 
                tasks={filteredTasks.filter(task => task.status === "pending")}
                onTaskUpdate={fetchTasks}
              />
            </TabsContent>
            
            <TabsContent value="in-progress" className="m-0">
              <TaskList 
                tasks={filteredTasks.filter(task => task.status === "in-progress")}
                onTaskUpdate={fetchTasks}
              />
            </TabsContent>
            
            <TabsContent value="completed" className="m-0">
              <TaskList 
                tasks={filteredTasks.filter(task => task.status === "completed")}
                onTaskUpdate={fetchTasks}
              />
            </TabsContent>
            
            <TabsContent value="all" className="m-0">
              <TaskList 
                tasks={filteredTasks}
                onTaskUpdate={fetchTasks}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}