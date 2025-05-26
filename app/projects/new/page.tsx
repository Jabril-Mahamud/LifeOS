"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { LayoutGrid } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { COLOR_OPTIONS, PROJECT_ICONS, ProjectFormData } from "@/lib/types";


export default function NewProject() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);
  const [selectedIcon, setSelectedIcon] = useState(PROJECT_ICONS[0]);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ProjectFormData>({
    defaultValues: {
      name: "",
      description: "",
      icon: PROJECT_ICONS[0],
      color: COLOR_OPTIONS[0].value,
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    // Update data with current selections
    data.icon = selectedIcon;
    data.color = selectedColor;
    
    setLoading(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create project");
      }

      toast({
        title: "Success",
        description: "Project created successfully!",
      });
      
      router.push("/projects");
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create project",
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
            <LayoutGrid className="h-5 w-5 mr-2" />
            Create New Project
          </CardTitle>
          <CardDescription>
            Add a new project to organize your tasks
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
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}