// This updated version uses shadcn/ui components for a better habit item display
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Trash } from "lucide-react";
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

type HabitItemProps = {
  habit: Habit;
  onUpdate?: (habit: Habit) => void;
  onDelete?: (id: string) => void;
};

export function HabitItem({ habit, onUpdate, onDelete }: HabitItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(habit.name);
  const [description, setDescription] = useState(habit.description || '');
  const [icon, setIcon] = useState(habit.icon || '🎯');
  const [color, setColor] = useState(habit.color || '#4299e1');
  const [active, setActive] = useState(habit.active);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { toast } = useToast();

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

  const startEditing = () => {
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setName(habit.name);
    setDescription(habit.description || '');
    setIcon(habit.icon || '🎯');
    setColor(habit.color || '#4299e1');
    setActive(habit.active);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      const response = await fetch(`/api/habits/${habit.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete habit');
      }
      
      onDelete(habit.id);
      toast({
        title: "Habit deleted",
        description: `${habit.name} has been deleted.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const saveEdit = async () => {
    if (!onUpdate) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/habits/${habit.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description, icon, color, active }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update habit');
      }
      
      setIsEditing(false);
      onUpdate(data.habit);
      toast({
        title: "Habit updated",
        description: `${name} has been updated successfully.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async () => {
    if (!onUpdate) return;
    
    try {
      const newActiveState = !active;
      setActive(newActiveState);
      
      const response = await fetch(`/api/habits/${habit.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: newActiveState }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setActive(active); // Revert on error
        throw new Error(data.error || 'Failed to update habit');
      }
      
      onUpdate(data.habit);
      toast({
        title: newActiveState ? "Habit activated" : "Habit deactivated",
        description: `${habit.name} is now ${newActiveState ? 'active' : 'inactive'}.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (isEditing) {
    return (
      <Card className="mb-3">
        <CardHeader className="pb-3">
          <div className="flex justify-between">
            <h3 className="text-lg font-medium">Edit Habit</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {errorMsg}
            </div>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="habitName">Habit Name</Label>
            <Input
              id="habitName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none"
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block mb-2">Icon</Label>
              <div className="grid grid-cols-6 gap-2">
                {icons.map((emoji) => (
                  <Button
                    key={emoji}
                    type="button"
                    variant={icon === emoji ? "default" : "outline"}
                    className="h-10 aspect-square p-0"
                    onClick={() => setIcon(emoji)}
                  >
                    <span className="text-xl">{emoji}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="block mb-2">Color</Label>
              <div className="grid grid-cols-5 gap-2">
                {colors.map((c) => (
                  <Button
                    key={c}
                    type="button"
                    variant="outline"
                    className={`h-10 aspect-square p-0 ${
                      color === c ? 'ring-2 ring-offset-2 ring-gray-500' : ''
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  >
                    {color === c && (
                      <span className="text-white">✓</span>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch id="active-state" checked={active} onCheckedChange={setActive} />
            <Label htmlFor="active-state">Active</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={cancelEditing}
          >
            Cancel
          </Button>
          <Button
            onClick={saveEdit}
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card 
      className={`mb-3 ${active ? 'bg-card' : 'bg-gray-50 opacity-70'}`}
      style={{ borderLeft: `4px solid ${habit.color || '#4299e1'}` }}
    >
      <CardContent className="p-3 pt-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-xl mr-3">{habit.icon}</span>
            <div>
              <h4 className="font-medium">{habit.name}</h4>
              {habit.description && (
                <p className="text-sm text-gray-600">{habit.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge
              variant={active ? "default" : "outline"}
              className={active ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
            >
              {active ? 'Active' : 'Inactive'}
            </Badge>
            
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={startEditing}
                className="h-8 w-8"
                aria-label="Edit habit"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              
              <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-red-600"
                    aria-label="Delete habit"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                      This will permanently delete the habit "{habit.name}" and all of its tracking data.
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-3 py-2 border-t flex justify-end">
        <Button
          variant="ghost" 
          size="sm"
          onClick={toggleActive}
        >
          {active ? 'Deactivate' : 'Activate'}
        </Button>
      </CardFooter>
    </Card>
  );
}