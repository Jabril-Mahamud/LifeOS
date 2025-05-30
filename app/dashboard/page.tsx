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
      
      if (!data || typeof data !== 'object') {
        throw new Error("Invalid data format received from server");
      }
      
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

  const priorityColors = {
    high: "text-red-500",
    medium: "text-amber-500",
    low: "text-blue-500"
  };

  const renderTaskItem = (task: TaskWithProject) => (
    <div key={task.id} className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-md border-b border-border/50 last:border-b-0">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full p-0 mt-0.5 shrink-0 touch-manipulation"
          onClick={() => {/* Toggle task logic */}}
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
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className={`text-sm font-medium leading-tight ${
              task.status === "completed" ? "line-through text-muted-foreground" : ""
            }`}>
              {task.title}
            </span>
            {task.priority !== "medium" && (
              <span className={`text-xs ${priorityColors[task.priority as keyof typeof priorityColors]} shrink-0`}>
                {task.priority === "high" ? "High Priority" : "Low Priority"}
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mt-2">
            {task.project && (
              <span 
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: task.project.color || '#e5e7eb',
                  color: task.project.color ? 'white' : 'inherit'
                }}
              >
                <span className="mr-1">{task.project.icon}</span>
                <span className="hidden sm:inline">{task.project.name}</span>
              </span>
            )}
            {task.dueDate && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                <span>{formatRelativeDate(task.dueDate)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loadingState === 'loading') {
    return (
      <div className="container mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <Skeleton className="h-[180px] sm:h-[200px] rounded-xl" />
          <Skeleton className="h-[180px] sm:h-[200px] rounded-xl" />
          <Skeleton className="h-[180px] sm:h-[200px] rounded-xl" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <Skeleton className="h-[280px] sm:h-[300px] rounded-xl" />
          <Skeleton className="h-[280px] sm:h-[300px] rounded-xl" />
        </div>
      </div>
    );
  }

  // Error state
  if (loadingState === 'error') {
    return (
      <div className="container mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-sm">{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchDashboardData(true)}
              disabled={isRetrying}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {retryCount > 0 ? `Retry (${retryCount})` : 'Retry'}
            </Button>
          </AlertDescription>
        </Alert>

        {/* Fallback minimal UI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center">
                <FileEdit className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
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
                className="w-full text-sm"
                onClick={() => router.push("/journal/new")}
              >
                Write new entry
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
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
                className="w-full text-sm"
                onClick={() => router.push("/habits")}
              >
                Manage habits
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center">
                <LayoutGrid className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
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
                className="w-full text-sm"
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
    <div className="container mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
        <div className="flex space-x-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline">Create New</span>
                <span className="xs:hidden">New</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
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

      {/* Summary Cards - Mobile-First Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {/* Journal Status */}
        <Card className="touch-manipulation">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg flex items-center">
              <FileEdit className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Journal
            </CardTitle>
            <CardDescription className="text-sm">
              {dashboardData?.journal.totalEntries || 0} total entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData?.journal.hasEntryToday && dashboardData.journal.entries.length > 0 ? (
              <div className="flex flex-col space-y-2">
                <div className="text-sm font-medium">Today's entry</div>
                <div className="text-sm text-muted-foreground">
                  <div className="font-medium">{dashboardData.journal.entries[0].title}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {formatDate(dashboardData.journal.entries[0].date)}
                  </div>
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
              className="w-full text-sm touch-manipulation"
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
        <Card className="touch-manipulation">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg flex items-center">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Habits
            </CardTitle>
            <CardDescription className="text-sm">
              {dashboardData?.habits.length || 0} active habits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData && dashboardData.habits.length > 0 ? (
              dashboardData.habits.slice(0, 3).map((habit) => (
                <div key={habit.id} className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium flex items-center">
                      <span className="mr-2">{habit.icon}</span>
                      {habit.name}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {habit.streak} days
                    </span>
                  </div>
                  <Progress value={habit.completionRate} className="h-2" />
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
              className="w-full text-sm touch-manipulation"
              onClick={() => router.push(dashboardData?.habits.length === 0 ? "/habits/new" : "/habits")}
            >
              {dashboardData?.habits.length === 0 ? "Create first habit" : "Manage habits"}
            </Button>
          </CardFooter>
        </Card>

        {/* Projects Summary */}
        <Card className="touch-manipulation sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg flex items-center">
              <LayoutGrid className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Projects
            </CardTitle>
            <CardDescription className="text-sm">
              {dashboardData?.projects.total || 0} active projects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {dashboardData && dashboardData.projects.list.length > 0 ? (
              dashboardData.projects.list.slice(0, 3).map((project) => (
                <div 
                  key={project.id} 
                  className="flex justify-between items-center p-2 hover:bg-accent/50 rounded-md cursor-pointer touch-manipulation"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <span className="text-sm font-medium flex items-center">
                    <span className="mr-2">{project.icon}</span>
                    <span className="truncate">{project.name}</span>
                  </span>
                  <span className="text-xs flex items-center text-muted-foreground whitespace-nowrap ml-2">
                    <ListTodo className="h-3 w-3 mr-1" />
                    {project._count.tasks}
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
              className="w-full text-sm touch-manipulation"
              onClick={() => router.push(dashboardData?.projects.list.length === 0 ? "/projects/new" : "/projects")}
            >
              {dashboardData?.projects.list.length === 0 ? "Create first project" : "View all projects"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Tasks Section - Mobile-Optimized */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Task Lists */}
        <Card className="col-span-1">
          <Tabs defaultValue="upcoming">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <CardTitle className="text-base sm:text-lg flex items-center">
                  <ListTodo className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Tasks
                </CardTitle>
                <TabsList className="grid w-full sm:w-auto grid-cols-2">
                  <TabsTrigger value="upcoming" className="text-xs sm:text-sm">Upcoming</TabsTrigger>
                  <TabsTrigger value="completed" className="text-xs sm:text-sm">Completed</TabsTrigger>
                </TabsList>
              </div>
              <CardDescription className="text-sm">
                Manage your tasks
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="upcoming" className="space-y-0 mt-0">
                {dashboardData && dashboardData.tasks.upcoming.length > 0 ? (
                  <div className="space-y-0">
                    {dashboardData.tasks.upcoming.map((task) => renderTaskItem(task))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground p-4 text-center">
                    No upcoming tasks. Create a task to get started with your work!
                  </div>
                )}
              </TabsContent>
              <TabsContent value="completed" className="space-y-0 mt-0">
                {dashboardData && dashboardData.tasks.recentlyCompleted.length > 0 ? (
                  <div className="space-y-0">
                    {dashboardData.tasks.recentlyCompleted.map((task) => renderTaskItem(task))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground p-4 text-center">
                    No recently completed tasks
                  </div>
                )}
              </TabsContent>
            </CardContent>
            
            <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full sm:w-auto text-sm touch-manipulation"
                onClick={() => router.push("/tasks")}
              >
                View all tasks
              </Button>
              <Button 
                size="sm"
                className="w-full sm:w-auto text-sm touch-manipulation"
                onClick={() => router.push("/tasks/new")}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New task
              </Button>
            </CardFooter>
          </Tabs>
        </Card>

        {/* Journal Entries */}
        <Card className="col-span-1">
          <Tabs defaultValue="journal">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <CardTitle className="text-base sm:text-lg flex items-center">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Journal Entries
                </CardTitle>
                <TabsList className="grid w-full sm:w-auto grid-cols-2">
                  <TabsTrigger value="journal" className="text-xs sm:text-sm">Recent</TabsTrigger>
                  <TabsTrigger value="calendar" className="text-xs sm:text-sm">Calendar</TabsTrigger>
                </TabsList>
              </div>
              <CardDescription className="text-sm">
                Your recent journal activity
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="journal" className="space-y-2 mt-0">
                {dashboardData && dashboardData.journal.entries.length > 0 ? (
                  dashboardData.journal.entries.map((entry) => (
                    <div 
                      key={entry.id} 
                      className="flex flex-col p-3 hover:bg-accent/50 rounded-md cursor-pointer touch-manipulation border-b border-border/50 last:border-b-0"
                      onClick={() => router.push(`/journal/${entry.id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm pr-2">{entry.title}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatRelativeDate(entry.date)}
                        </span>
                      </div>
                      {entry.content && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {entry.content}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground p-4 text-center">
                    No journal entries yet. Start writing to capture your thoughts and experiences!
                  </div>
                )}
              </TabsContent>
              <TabsContent value="calendar" className="mt-0">
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <p className="text-sm text-center">Calendar view will be implemented soon</p>
                </div>
              </TabsContent>
            </CardContent>
            
            <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full sm:w-auto text-sm touch-manipulation"
                onClick={() => router.push("/journal")}
              >
                View all entries
              </Button>
              <Button 
                size="sm"
                className="w-full sm:w-auto text-sm touch-manipulation"
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