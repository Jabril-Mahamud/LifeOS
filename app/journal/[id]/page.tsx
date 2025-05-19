"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FileEdit, 
  ArrowLeft, 
  Smile, 
  Meh, 
  Frown, 
  Calendar,
  Edit,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

type Journal = {
  id: string;
  title: string;
  content: string | null;
  mood: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
  habitLogs: Array<{
    id: string;
    completed: boolean;
    notes: string | null;
    habit: {
      id: string;
      name: string;
      icon: string | null;
      color: string | null;
    };
  }>;
};

// Correct Next.js page props interface
interface PageProps {
  params: Promise<{ id: string }>;
}

export default function JournalDetailPage({ params }: PageProps) {
  const [journal, setJournal] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [journalId, setJournalId] = useState<string | null>(null);
  const router = useRouter();

  // Resolve params and extract id
  useEffect(() => {
    const resolveParams = async () => {
      const { id } = await params;
      setJournalId(id);
    };
    resolveParams();
  }, [params]);

  // Fetch journal entry
  useEffect(() => {
    if (!journalId) return;

    const fetchJournal = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/journal/${journalId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch journal entry");
        }
        const data = await response.json();
        
        setJournal(data.entry);
      } catch (error) {
        console.error("Error fetching journal entry:", error);
        toast({
          title: "Error",
          description: "Failed to load journal entry. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJournal();
  }, [journalId]);

  // Delete journal entry
  const handleDeleteJournal = async () => {
    if (!journalId) return;

    try {
      const response = await fetch(`/api/journal/${journalId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete journal entry");
      }
      
      toast({
        description: "Journal entry deleted successfully",
      });
      
      router.push("/journal");
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      toast({
        title: "Error",
        description: "Failed to delete journal entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  // Get emoji for mood
  const getMoodEmoji = (mood: string | null) => {
    switch (mood) {
      case "happy":
        return <Smile className="h-6 w-6 text-green-500" />;
      case "sad":
        return <Frown className="h-6 w-6 text-blue-500" />;
      case "neutral":
      default:
        return <Meh className="h-6 w-6 text-amber-500" />;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "EEEE, MMMM d, yyyy");
  };

  if (loading || !journalId) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Loading journal entry...</h1>
        </div>
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Journal entry not found</h1>
        </div>
        <p className="text-muted-foreground">
          The requested journal entry could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Journal Entry</h1>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/journal/${journalId}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          
          <Button variant="outline" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{journal.title}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(journal.date)}
              </CardDescription>
            </div>
            
            {journal.mood && (
              <div className="flex items-center">
                <Badge className="flex items-center gap-1 px-3 py-1">
                  {getMoodEmoji(journal.mood)}
                  <span className="capitalize">{journal.mood}</span>
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          {journal.content ? (
            <div className="whitespace-pre-wrap">{journal.content}</div>
          ) : (
            <p className="text-muted-foreground italic">No content</p>
          )}
        </CardContent>
        
        {journal.habitLogs && journal.habitLogs.length > 0 && (
          <CardFooter className="flex flex-col items-start border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Habits Tracked</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
              {journal.habitLogs.map(log => (
                <div 
                  key={log.id} 
                  className="flex items-center p-3 rounded-md border"
                  style={{
                    borderColor: log.completed ? (log.habit.color || 'green') : undefined,
                    borderWidth: log.completed ? '2px' : '1px'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                        log.completed ? 'bg-green-500' : 'bg-muted'
                      }`}
                      style={{ 
                        backgroundColor: log.completed ? (log.habit.color || 'green') : undefined 
                      }}
                    >
                      {log.habit.icon || "✓"}
                    </div>
                    <div>
                      <div className="font-medium">{log.habit.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {log.completed ? "Completed" : "Not completed"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardFooter>
        )}
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Journal Entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this journal entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteJournal}>
              Delete Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}