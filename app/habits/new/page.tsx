"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

type HabitFormData = {
  name: string;
  description: string;
  icon: string;
  color: string;
};

// Predefined colors for habit selection
const colorOptions = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Emerald", value: "#10b981" },
  { name: "Orange", value: "#f97316" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Indigo", value: "#6366f1" },
];

// Common emoji icons for habits
const iconOptions = [
  "🏃", "💪", "🧘", "💧", "🥗", "🍎", "📚", "✍️", 
  "💭", "🛌", "⏰", "💊", "🚶", "🧠", "🌱", "🧹",
];

export default function NewHabit() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].value);
  const [selectedIcon, setSelectedIcon] = useState(iconOptions[0]);
  
  const { register, handleSubmit, formState: { errors } } = useForm<HabitFormData>({
    defaultValues: {
      name: "",
      description: "",
      icon: iconOptions[0],
      color: colorOptions[0].value,
    },
  });

  const onSubmit = async (data: HabitFormData) => {
    // Update data with current selections
    data.icon = selectedIcon;
    data.color = selectedColor;
    
    setLoading(true);
    try {
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create habit");
      }

      toast({
        title: "Success",
        description: "Habit created successfully!",
      });
      
      router.push("/habits");
    } catch (error) {
      console.error("Error creating habit:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create habit",
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
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Create New Habit
          </CardTitle>
          <CardDescription>
            Add a new habit to track in your daily routine
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Habit Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Habit Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                placeholder="Enter habit name (e.g., 'Drink water', 'Read', 'Exercise')"
                {...register("name", { required: "Habit name is required" })}
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
                placeholder="Enter a description or goal for this habit"
                className="min-h-[100px]"
                {...register("description")}
              />
            </div>
            
            {/* Icon Selection */}
            <div className="space-y-2">
              <Label>Habit Icon</Label>
              <div className="grid grid-cols-8 gap-2">
                {iconOptions.map((icon) => (
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
              <Label>Habit Color</Label>
              <div className="grid grid-cols-8 gap-2">
                {colorOptions.map((color) => (
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
              {loading ? "Creating..." : "Create Habit"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}