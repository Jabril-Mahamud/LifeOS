// components/journal/journal-entry.tsx
"use client";

import { useState, useEffect } from 'react';
import { formatDistanceToNow, format, isSameDay } from 'date-fns';
import { HabitTracker } from '../habits/habit-tracker';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, Pencil, Trash, ChevronUp, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Types for habit and habit logs
type Habit = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
};

// Original HabitLog from API
type HabitLog = {
  id: string;
  habitId: string;
  completed: boolean;
  notes: string | null;
  habit: Habit;
};

// For form state and tracking - with optional id
type HabitLogForm = {
  id?: string;
  habitId: string;
  completed: boolean;
  notes: string | null;
};

type JournalEntryProps = {
  id: string;
  title: string;
  content: string | null;
  mood?: string;
  date: string;
  createdAt: string;
  habitLogs?: HabitLog[];
  onDelete?: (id: string) => void;
  onEdit?: (id: string, title: string, content: string, mood: string, habitLogs: HabitLogForm[]) => void;
};

export function JournalEntry({ 
  id, 
  title, 
  content, 
  mood = 'neutral',
  date,
  createdAt, 
  habitLogs = [],
  onDelete,
  onEdit
}: JournalEntryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editContent, setEditContent] = useState(content || '');
  const [editMood, setEditMood] = useState(mood);
  const [editHabitLogs, setEditHabitLogs] = useState<HabitLogForm[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [allHabits, setAllHabits] = useState<Habit[]>([]);
  const [isLoadingHabits, setIsLoadingHabits] = useState(false);

  const entryDate = new Date(date);
  const formattedDate = format(entryDate, 'EEEE, MMMM d, yyyy');
  const isToday = isSameDay(entryDate, new Date());
  
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  // Fetch all habits when editing starts
  useEffect(() => {
    if (isEditing) {
      fetchAllHabits();
    }
  }, [isEditing]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Fetch all habits to ensure we have the complete list for the habit tracker
  async function fetchAllHabits() {
    try {
      setIsLoadingHabits(true);
      const response = await fetch('/api/habits');
      
      if (!response.ok) {
        throw new Error('Failed to fetch habits');
      }
      
      const data = await response.json();
      setAllHabits(data.habits || []);
      
      // Initialize edit habit logs from existing habit logs
      const formattedLogs: HabitLogForm[] = habitLogs.map(log => ({
        id: log.id,
        habitId: log.habitId,
        completed: log.completed,
        notes: log.notes
      }));
      
      // Make sure all habits are included in the edit logs
      const currentHabitIds = formattedLogs.map(log => log.habitId);
      
      // Add missing habits without an id (will be created when saved)
      for (const habit of data.habits) {
        if (!currentHabitIds.includes(habit.id)) {
          // Add any missing habits to the edit logs (uncompleted by default)
          formattedLogs.push({
            habitId: habit.id,
            completed: false,
            notes: null
          });
        }
      }
      
      setEditHabitLogs(formattedLogs);
    } catch (err) {
      console.error('Error fetching habits:', err);
    } finally {
      setIsLoadingHabits(false);
    }
  }

  const startEditing = () => {
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditTitle(title);
    setEditContent(content || '');
    setEditMood(mood);
  };

  const saveEdit = () => {
    if (onEdit) {
      onEdit(id, editTitle, editContent, editMood, editHabitLogs);
    }
    setIsEditing(false);
  };

  const handleHabitLogsChange = (newHabitLogs: HabitLogForm[]) => {
    setEditHabitLogs(newHabitLogs);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    }
    setConfirmDelete(false);
  };

  // Render different mood emojis based on the mood
  const getMoodEmoji = (mood: string) => {
    switch(mood.toLowerCase()) {
      case 'happy': return '😊';
      case 'sad': return '😔';
      case 'angry': return '😠';
      case 'anxious': return '😰';
      case 'calm': return '😌';
      case 'excited': return '🤩';
      case 'tired': return '😴';
      default: return '😐';
    }
  };

  // Count completed habits
  const completedHabits = habitLogs.filter(log => log.completed).length;
  const totalHabits = habitLogs.length;

  if (isEditing) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Edit Journal Entry</CardTitle>
          <CardDescription>
            {format(new Date(date), 'EEEE, MMMM d, yyyy')} 
            {!isToday && <span className="ml-1 text-blue-500">(Past Entry)</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="editTitle">Title</Label>
            <Input
              id="editTitle"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Entry title"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="editContent">Content</Label>
            <Textarea
              id="editContent"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Write your thoughts here..."
              className="min-h-[150px]"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="editMood">How were you feeling?</Label>
            <Select value={editMood} onValueChange={setEditMood}>
              <SelectTrigger>
                <SelectValue placeholder="Select a mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="neutral">Neutral 😐</SelectItem>
                <SelectItem value="happy">Happy 😊</SelectItem>
                <SelectItem value="sad">Sad 😔</SelectItem>
                <SelectItem value="angry">Angry 😠</SelectItem>
                <SelectItem value="anxious">Anxious 😰</SelectItem>
                <SelectItem value="calm">Calm 😌</SelectItem>
                <SelectItem value="excited">Excited 🤩</SelectItem>
                <SelectItem value="tired">Tired 😴</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Habit Tracker for editing - with loading state */}
          <div>
            <Label>Track Your Habits</Label>
            <div className="mt-2">
              {isLoadingHabits ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <HabitTracker
                  habitLogs={editHabitLogs}
                  onHabitLogsChange={handleHabitLogsChange}
                  date={date} 
                />
              )}
            </div>
            {!isToday && (
              <Alert variant="default" className="mt-3 bg-blue-50 text-blue-800 border-blue-200">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You can retroactively track habits on past journal entries
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={cancelEditing}>
            Cancel
          </Button>
          <Button onClick={saveEdit}>
            Save
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <>
      <Card className={`mb-4 ${isToday ? 'border-blue-400' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                {title}
                <span className="ml-2 text-base">{getMoodEmoji(mood)}</span>
                {isToday && (
                  <Badge className="ml-2" variant="secondary">Today</Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-1">
                {formattedDate} · {timeAgo}
              </CardDescription>
            </div>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={startEditing}
                aria-label="Edit entry"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    aria-label="Delete entry"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                      This will permanently delete this journal entry and all associated habit logs.
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
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleExpand}
                aria-label={isExpanded ? "Collapse entry" : "Expand entry"}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Habit Tracking Summary */}
          {habitLogs.length > 0 && (
            <div className="mt-3 flex items-center">
              <div className="mr-2 text-xs font-medium text-gray-500">Habits:</div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="ml-2 text-xs text-gray-600">
                {completedHabits}/{totalHabits}
              </div>
            </div>
          )}
        </CardHeader>
        
        {isExpanded && (
          <CardContent>
            {content && (
              <div className="text-gray-600 whitespace-pre-wrap mb-4">
                {content}
              </div>
            )}
            
            {/* Tracked Habits Details */}
            {habitLogs.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Habits Tracked</h4>
                <div className="space-y-2">
                  {habitLogs.map(log => (
                    <div 
                      key={log.id} 
                      className="flex items-center p-2 bg-gray-50 rounded-md"
                      style={{ borderLeft: `3px solid ${log.habit.color || '#4299e1'}` }}
                    >
                      <div className={`mr-2 ${log.completed ? 'text-green-500' : 'text-gray-400'}`}>
                        {log.completed ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{log.habit.icon}</span>
                          <span className={`font-medium ${log.completed ? 'text-gray-800' : 'text-gray-500'}`}>
                            {log.habit.name}
                          </span>
                        </div>
                        {log.notes && (
                          <div className="mt-1 text-sm text-gray-600">
                            {log.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Button to edit habits on past entries */}
            {!isToday && habitLogs.length === 0 && (
              <div className="mt-4 flex justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={startEditing}
                  className="text-sm"
                >
                  Add Habit Tracking to This Entry
                </Button>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </>
  );
}