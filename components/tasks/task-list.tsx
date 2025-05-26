"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Edit, 
  MoreHorizontal, 
  Trash2,
  ArrowUp,
  ArrowRight 
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { Task, TaskWithProject } from "@/lib/types";

type TaskListProps = {
  tasks: TaskWithProject[];
  onTaskUpdate: () => void;
};

export function TaskList({ tasks, onTaskUpdate }: TaskListProps) {
  const router = useRouter();
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);

  // Format a date to show "Today", "Tomorrow", or the formatted date
  const formatRelativeDate = (dateString: string | null) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
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
  };

  // Priority and status color mappings
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <ArrowUp className="h-3 w-3 text-red-500" />;
      case "medium":
        return <ArrowRight className="h-3 w-3 text-amber-500" />;
      default:
        return null;
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setLoadingTaskId(taskId);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }
      
      onTaskUpdate();
      
      if (newStatus === "completed") {
        toast({
          title: "Task completed",
          description: "Good job! The task has been marked as completed.",
        });
      } else {
        toast({
          description: "Task status updated",
        });
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingTaskId(null);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }
    
    setLoadingTaskId(taskId);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      
      onTaskUpdate();
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
      setLoadingTaskId(null);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No tasks found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div 
          key={task.id} 
          className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-md border"
        >
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 rounded-full p-0 mt-1"
              onClick={() => handleStatusChange(
                task.id, 
                task.status === "completed" ? "pending" : "completed"
              )}
              disabled={loadingTaskId === task.id}
            >
              {task.status === "completed" ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="sr-only">Toggle status</span>
            </Button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </span>
                {getPriorityIcon(task.priority)}
              </div>
              
              {task.description && (
                <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                  {task.description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-2 mt-2">
                {task.project && (
                  <Badge 
                    variant="outline"
                    className="text-xs font-normal"
                    style={{
                      backgroundColor: task.project.color || undefined,
                      color: task.project.color ? 'white' : undefined
                    }}
                  >
                    {task.project.name}
                  </Badge>
                )}
                
                {task.dueDate && (
                  <Badge variant="outline" className="text-xs font-normal flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatRelativeDate(task.dueDate)}
                  </Badge>
                )}
                
                {task.status === "in-progress" && (
                  <Badge className="bg-amber-500 hover:bg-amber-600 text-xs font-normal">
                    In Progress
                  </Badge>
                )}
              </div>
            </div>
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
              
              <DropdownMenuItem onClick={() => router.push(`/tasks/${task.id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => handleStatusChange(task.id, "pending")}>
                <Circle className="h-4 w-4 mr-2" />
                Mark as Pending
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => handleStatusChange(task.id, "in-progress")}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Mark as In Progress
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => handleStatusChange(task.id, "completed")}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Completed
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="text-red-500 focus:text-red-500" 
                onClick={() => handleDelete(task.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}