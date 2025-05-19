"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  ListTodo,
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

type Project = {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
};

type TaskFormData = {
  title: string;
  description: string;
  projectId: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  dueDate: Date | null;
};

export default function NewTask() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    defaultValues: {
      title: "",
      description: "",
      projectId: "",
      priority: "medium",
      status: "pending",
      dueDate: null,
    },
  });

  // Fetch projects for the dropdown
  useEffect(() => {
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
        toast({
          title: "Error",
          description: "Failed to load projects. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchProjects();
  }, []);

  // Update the form when date changes
  useEffect(() => {
    setValue("dueDate", date ?? null);
  }, [date, setValue]);

  const onSubmit = async (data: TaskFormData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create task");
      }

      toast({
        title: "Success",
        description: "Task created successfully!",
      });

      router.push("/tasks");
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <ListTodo className="h-5 w-5 mr-2" />
            Create New Task
          </CardTitle>
          <CardDescription>
            Add a new task to organize your work
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Task Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter task title"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter task description"
                className="min-h-[100px]"
                {...register("description")}
              />
            </div>

            {/* Project */}
            <div className="space-y-2">
              <Label htmlFor="projectId">Project</Label>
              <Select
                onValueChange={(value) =>
                  setValue("projectId", value === "none" ? "" : value)
                }
                defaultValue="none"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.icon} {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("priority", value as "low" | "medium" | "high")
                  }
                  defaultValue="medium"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  onValueChange={(value) =>
                    setValue(
                      "status",
                      value as "pending" | "in-progress" | "completed"
                    )
                  }
                  defaultValue="pending"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
