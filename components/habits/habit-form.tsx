// This updated version uses shadcn/ui components for a better habit form
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from '@/hooks/use-toast';

type Habit = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  active: boolean;
  createdAt: string;
};

type HabitFormProps = {
  onHabitCreated?: (habit: Habit) => void;
};

type FormValues = {
  name: string;
  description: string;
  icon: string;
  color: string;
};

export function HabitForm({ onHabitCreated }: HabitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    defaultValues: {
      name: '',
      description: '',
      icon: '🎯',
      color: '#4299e1', // Default blue color
    }
  });

  // Available icons
  const icons = ['🎯', '💪', '📚', '🏃', '💧', '🧘', '🥗', '💤', '🌱', '📝', '❤️', '⏰'];
  
  // Available colors
  const colors = [
    '#4299e1', // blue
    '#48bb78', // green
    '#ed8936', // orange
    '#9f7aea', // purple
    '#f56565', // red
    '#38b2ac', // teal
    '#ecc94b', // yellow
    '#667eea', // indigo
    '#f687b3', // pink
    '#a0aec0', // gray
  ];

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create habit');
      }
      
      form.reset({
        name: '',
        description: '',
        icon: '🎯',
        color: '#4299e1'
      });
      
      if (onHabitCreated) {
        onHabitCreated(data.habit);
      }
      
      toast({
        title: "Habit created",
        description: `${values.name} has been added to your habits.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      
      toast({
        title: "Failed to create habit",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Create New Habit</CardTitle>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Habit name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habit Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Drink water, Meditate, Exercise" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Why is this habit important to you?" 
                      className="resize-none" 
                      rows={2}
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <div className="grid grid-cols-6 gap-2">
                      {icons.map((emoji) => (
                        <Button
                          key={emoji}
                          type="button"
                          variant={field.value === emoji ? "default" : "outline"}
                          className="h-10 aspect-square p-0"
                          onClick={() => form.setValue("icon", emoji)}
                        >
                          <span className="text-xl">{emoji}</span>
                        </Button>
                      ))}
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <div className="grid grid-cols-5 gap-2">
                      {colors.map((c) => (
                        <Button
                          key={c}
                          type="button"
                          variant="outline"
                          className={`h-10 aspect-square p-0 ${
                            field.value === c ? 'ring-2 ring-offset-2 ring-gray-500' : ''
                          }`}
                          style={{ backgroundColor: c }}
                          onClick={() => form.setValue("color", c)}
                        >
                          {field.value === c && (
                            <span className="text-white">✓</span>
                          )}
                        </Button>
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              disabled={isSubmitting || !form.watch("name").trim()}
            >
              {isSubmitting ? 'Creating...' : 'Create Habit'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}