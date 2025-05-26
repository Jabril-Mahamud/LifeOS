"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { 
  LayoutGrid, 
  Calendar, 
  CheckCircle2, 
  ListTodo, 
  Clock, 
  Circle, 
  FileEdit, 
  Plus, 
  PlusCircle,
  BarChart4, 
  ChevronRight,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardData, LoadingState, TaskWithProject } from "@/lib/types";

export default function Dashboard() {
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const router = useRouter();

  const fetchDashboardData = async (isRetry = false) => {
    if (isRetry) {
      setRetryCount(prev => prev + 1);
      setIsRetrying(true);
    } else {
      setLoadingState('loading');
    }
    
    setError(null);
    
    try {
      const response = await fetch("/api/dashboard");
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Dashboard data not found. Please check your account setup.");
        } else if (response.status >= 500) {
          throw new Error("Server error. Please try again later.");
        } else {
          throw new Error(`Failed to fetch dashboard data (${response.status})`);
        }
      }
      
      const data = await response.json();
      
      // Validate that we have the expected data structure
      if (!data || typeof data !== 'object') {
        throw new Error("Invalid data format received from server");
      }
      
      // Set default empty states if data is missing
      const safeData: DashboardData = {
        habits: Array.isArray(data.habits) ? data.habits : [],
        journal: {
          totalEntries: data.journal?.totalEntries || 0,
          hasEntryToday: data.journal?.hasEntryToday || false,
          entries: Array.isArray(data.journal?.entries) ? data.journal.entries : [],
          moodDistribution: data.journal?.moodDistribution || {},
          recentMoods: Array.isArray(data.journal?.recentMoods) ? data.journal.recentMoods : [],
          heatmap: Array.isArray(data.journal?.heatmap) ? data.journal.heatmap : []
        },
        projects: {
          list: Array.isArray(data.projects?.list) ? data.projects.list : [],
          total: data.projects?.total || 0
        },
        tasks: {
          upcoming: Array.isArray(data.tasks?.upcoming) ? data.tasks.upcoming : [],
          recentlyCompleted: Array.isArray(data.tasks?.recentlyCompleted) ? data.tasks.recentlyCompleted : []
        }
      };
      
      setDashboardData(safeData);
      setLoadingState('success');
      setRetryCount(0);
      setIsRetrying(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
      setLoadingState('error');
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format a date string for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return format(date, "MMMM d, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  // Format a date to show "Today", "Tomorrow", or the formatted date
  const formatRelativeDate = (dateString: string | null) => {
    if (!dateString) return "No date";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      
      if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
        return "Today";
      } else if (format(date, "yyyy-MM-dd") === format(tomorrow, "yyyy-MM-dd")) {
        return "Tomorrow";
      } else {
        return format(date, "MMM d, yyyy");
      }
    } catch {
      return "Invalid date";
    }
  };

  // Priority and status color mappings
  const priorityColors = {
    high: "text-red-500",
    medium: "text-amber-500",
    low: "text-blue-500"
  };

  // Render task item
  const renderTaskItem = (task: TaskWithProject) => (
    <div key={task.id} className="flex items-center justify-between p-2 hover:bg-accent/50 rounded-md">
      <div className="flex items-center space-x-2">
        {task.status === "completed" ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <Circle className={`h-4 w-4 ${priorityColors[task.priority as keyof typeof priorityColors] || 'text-muted-foreground'}`} />
        )}
        <span className={task.status === "completed" ? "line-through text-muted-foreground" : ""}>{task.title}</span>
      </div>
      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
        {task.project && (
          <span 
            className="px-2 py-1 rounded-full" 
            style={{ 
              backgroundColor: task.project.color || '#e5e7eb',
              color: task.project.color ? 'white' : 'inherit'
            }}
          >
            {task.project.icon} {task.project.name}
          </span>
        )}
        {task.dueDate && (
          <span className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {formatRelativeDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );

  // Loading state
  if (loadingState === 'loading') {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[200px] rounded-xl" />
          <Skeleton className="h-[200px] rounded-xl" />
          <Skeleton className="h-[200px] rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-[300px] rounded-xl" />
        </div>
      </div>
    );
  }

  // Error state
  if (loadingState === 'error') {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchDashboardData(true)}
              disabled={isRetrying}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {retryCount > 0 ? `Retry (${retryCount})` : 'Retry'}
            </Button>
          </AlertDescription>
        </Alert>

        {/* Fallback minimal UI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FileEdit className="h-5 w-5 mr-2" />
                Journal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Unable to load journal data</p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => router.push("/journal/new")}
              >
                Write new entry
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Habits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Unable to load habits data</p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => router.push("/habits")}
              >
                Manage habits
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <LayoutGrid className="h-5 w-5 mr-2" />
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Unable to load projects data</p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => router.push("/projects")}
              >
                View projects
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Success state with data
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>What would you like to create?</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/journal/new")}>
                <FileEdit className="h-4 w-4 mr-2" />
                Journal Entry
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/projects/new")}>
                <LayoutGrid className="h-4 w-4 mr-2" />
                Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/tasks/new")}>
                <ListTodo className="h-4 w-4 mr-2" />
                Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Journal and Habits Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Journal Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileEdit className="h-5 w-5 mr-2" />
              Journal
            </CardTitle>
            <CardDescription>
              {dashboardData?.journal.totalEntries || 0} total entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData?.journal.hasEntryToday && dashboardData.journal.entries.length > 0 ? (
              <div className="flex flex-col">
                <div className="text-sm font-medium mb-1">Today's entry</div>
                <div className="text-sm text-muted-foreground">
                  <span className="mr-2">{dashboardData.journal.entries[0].title}</span>
                  <span className="text-xs opacity-70">
                    {formatDate(dashboardData.journal.entries[0].date)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                {dashboardData?.journal.totalEntries === 0 
                  ? "No journal entries yet. Start writing to track your thoughts and progress!"
                  : "No entry for today yet"
                }
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => router.push(
                dashboardData?.journal.hasEntryToday && dashboardData.journal.entries.length > 0
                  ? `/journal/${dashboardData.journal.entries[0].id}` 
                  : "/journal/new"
              )}
            >
              {dashboardData?.journal.hasEntryToday ? "View today's entry" : "Write today's entry"}
            </Button>
          </CardFooter>
        </Card>

        {/* Habit Tracking */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Habit Tracking
            </CardTitle>
            <CardDescription>
              {dashboardData?.habits.length || 0} active habits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {dashboardData && dashboardData.habits.length > 0 ? (
              dashboardData.habits.slice(0, 3).map((habit) => (
                <div key={habit.id} className="flex flex-col space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{habit.icon} {habit.name}</span>
                    <span className="text-xs">{habit.streak} day streak</span>
                  </div>
                  <Progress value={habit.completionRate} className="h-1.5" />
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                No active habits to track. Create your first habit to start building healthy routines!
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => router.push(dashboardData?.habits.length === 0 ? "/habits/new" : "/habits")}
            >
              {dashboardData?.habits.length === 0 ? "Create first habit" : "Manage habits"}
            </Button>
          </CardFooter>
        </Card>

        {/* Projects Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <LayoutGrid className="h-5 w-5 mr-2" />
              Projects
            </CardTitle>
            <CardDescription>
              {dashboardData?.projects.total || 0} active projects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {dashboardData && dashboardData.projects.list.length > 0 ? (
              dashboardData.projects.list.slice(0, 3).map((project) => (
                <div 
                  key={project.id} 
                  className="flex justify-between items-center p-2 hover:bg-accent/50 rounded-md cursor-pointer"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <span className="text-sm font-medium">
                    {project.icon} {project.name}
                  </span>
                  <span className="text-xs flex items-center">
                    <ListTodo className="h-3 w-3 mr-1" />
                    {project._count.tasks} tasks
                  </span>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                No active projects. Create a project to organize your tasks and goals!
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => router.push(dashboardData?.projects.list.length === 0 ? "/projects/new" : "/projects")}
            >
              {dashboardData?.projects.list.length === 0 ? "Create first project" : "View all projects"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Tasks Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Task Lists */}
        <Card className="col-span-1">
          <Tabs defaultValue="upcoming">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <ListTodo className="h-5 w-5 mr-2" />
                  Tasks
                </CardTitle>
                <TabsList>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
              </div>
              <CardDescription>
                Manage your tasks
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="upcoming" className="space-y-2 mt-0">
                {dashboardData && dashboardData.tasks.upcoming.length > 0 ? (
                  dashboardData.tasks.upcoming.map((task) => renderTaskItem(task))
                ) : (
                  <div className="text-sm text-muted-foreground p-2">
                    No upcoming tasks. Create a task to get started with your work!
                  </div>
                )}
              </TabsContent>
              <TabsContent value="completed" className="space-y-2 mt-0">
                {dashboardData && dashboardData.tasks.recentlyCompleted.length > 0 ? (
                  dashboardData.tasks.recentlyCompleted.map((task) => renderTaskItem(task))
                ) : (
                  <div className="text-sm text-muted-foreground p-2">
                    No recently completed tasks
                  </div>
                )}
              </TabsContent>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push("/tasks")}
              >
                View all tasks
              </Button>
              <Button 
                size="sm"
                onClick={() => router.push("/tasks/new")}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New task
              </Button>
            </CardFooter>
          </Tabs>
        </Card>

        {/* Calendar / Journal Entries */}
        <Card className="col-span-1">
          <Tabs defaultValue="journal">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Journal Entries
                </CardTitle>
                <TabsList>
                  <TabsTrigger value="journal">Recent</TabsTrigger>
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                </TabsList>
              </div>
              <CardDescription>
                Your recent journal activity
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="journal" className="space-y-2 mt-0">
                {dashboardData && dashboardData.journal.entries.length > 0 ? (
                  dashboardData.journal.entries.map((entry) => (
                    <div 
                      key={entry.id} 
                      className="flex flex-col p-2 hover:bg-accent/50 rounded-md cursor-pointer"
                      onClick={() => router.push(`/journal/${entry.id}`)}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{entry.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeDate(entry.date)}
                        </span>
                      </div>
                      {entry.content && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                          {entry.content}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground p-2">
                    No journal entries yet. Start writing to capture your thoughts and experiences!
                  </div>
                )}
              </TabsContent>
              <TabsContent value="calendar" className="mt-0">
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <p>Calendar view will be implemented soon</p>
                </div>
              </TabsContent>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push("/journal")}
              >
                View all entries
              </Button>
              <Button 
                size="sm"
                onClick={() => router.push("/journal/new")}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New entry
              </Button>
            </CardFooter>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}