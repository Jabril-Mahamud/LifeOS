"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { LayoutGrid, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { COLOR_OPTIONS, PROJECT_ICONS, ProjectFormData } from "@/lib/types";


interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditProject({ params }: PageProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);
  const [selectedIcon, setSelectedIcon] = useState(PROJECT_ICONS[0]);
  const [completed, setCompleted] = useState(false);
  const [archived, setArchived] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProjectFormData>({
    defaultValues: {
      name: "",
      description: "",
      icon: PROJECT_ICONS[0],
      color: COLOR_OPTIONS[0].value,
      completed: false,
      archived: false,
    },
  });

  // Resolve params and extract id
  useEffect(() => {
    const resolveParams = async () => {
      const { id } = await params;
      setProjectId(id);
    };
    resolveParams();
  }, [params]);

  // Fetch project data
  useEffect(() => {
    if (!projectId) return;

    const fetchProjectData = async () => {
      setFetchingData(true);
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch project data");
        }
        const data = await response.json();
        
        // Set form values
        setValue("name", data.project.name);
        setValue("description", data.project.description || "");
        setValue("icon", data.project.icon || PROJECT_ICONS[0]);
        setValue("color", data.project.color || COLOR_OPTIONS[0].value);
        setValue("completed", data.project.completed);
        setValue("archived", data.project.archived);
        
        // Set state values
        setSelectedIcon(data.project.icon || PROJECT_ICONS[0]);
        setSelectedColor(data.project.color || COLOR_OPTIONS[0].value);
        setCompleted(data.project.completed);
        setArchived(data.project.archived);
      } catch (error) {
        console.error("Error fetching project data:", error);
        toast({
          title: "Error",
          description: "Failed to load project data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setFetchingData(false);
      }
    };

    fetchProjectData();
  }, [projectId, setValue]);

  const onSubmit = async (data: ProjectFormData) => {
    if (!projectId) return;
    
    // Update data with current selections
    data.icon = selectedIcon;
    data.color = selectedColor;
    data.completed = completed;
    data.archived = archived;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update project");
      }

      toast({
        title: "Success",
        description: "Project updated successfully!",
      });
      
      router.push(`/projects/${projectId}`);
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update project",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="container mx-auto max-w-3xl p-4 md:p-6 lg:p-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Loading project data...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl p-4 md:p-6 lg:p-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Edit Project</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <LayoutGrid className="h-5 w-5 mr-2" />
            Edit Project Details
          </CardTitle>
          <CardDescription>
            Update your project information
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Project Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                placeholder="Enter project name"
                {...register("name", { required: "Project name is required" })}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter project description"
                className="min-h-[100px]"
                {...register("description")}
              />
            </div>
            
            {/* Icon Selection */}
            <div className="space-y-2">
              <Label>Project Icon</Label>
              <div className="grid grid-cols-8 gap-2">
                {PROJECT_ICONS.map((icon) => (
                  <Button
                    key={icon}
                    type="button"
                    variant={selectedIcon === icon ? "default" : "outline"}
                    className="h-10 w-10 p-0"
                    onClick={() => setSelectedIcon(icon)}
                  >
                    <span className="text-lg">{icon}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Color Selection */}
            <div className="space-y-2">
              <Label>Project Color</Label>
              <div className="grid grid-cols-8 gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <Button
                    key={color.value}
                    type="button"
                    variant="outline"
                    className="h-10 w-10 p-0 rounded-full border-2"
                    style={{ 
                      backgroundColor: color.value,
                      borderColor: selectedColor === color.value ? "white" : color.value,
                      outline: selectedColor === color.value ? `2px solid ${color.value}` : "none"
                    }}
                    onClick={() => setSelectedColor(color.value)}
                  />
                ))}
              </div>
            </div>
            
            {/* Status Toggles */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="completed">Completed Status</Label>
                  <Switch
                    id="completed"
                    checked={completed}
                    onCheckedChange={setCompleted}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {completed ? "This project is marked as completed" : "This project is in progress"}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="archived">Archive Status</Label>
                  <Switch
                    id="archived"
                    checked={archived}
                    onCheckedChange={setArchived}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {archived ? "This project is archived and hidden from active projects" : "This project is active and visible in your project list"}
                </p>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}