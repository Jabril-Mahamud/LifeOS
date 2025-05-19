"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FileEdit, 
  PlusCircle, 
  Calendar, 
  Smile, 
  Meh, 
  Frown, 
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Journal = {
  id: string;
  title: string;
  content: string | null;
  mood: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export function JournalList() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<Journal | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<"list" | "calendar">("list");
  const router = useRouter();

  // Fetch journal entries
  useEffect(() => {
    const fetchJournals = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/journal");
        if (!response.ok) {
          throw new Error("Failed to fetch journal entries");
        }
        const data = await response.json();
        
        setJournals(data.entries);
      } catch (error) {
        console.error("Error fetching journal entries:", error);
        toast({
          title: "Error",
          description: "Failed to load journal entries. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJournals();
  }, []);

  // Delete journal entry
  const handleDeleteJournal = async () => {
    if (!selectedEntry) return;
    
    try {
      const response = await fetch(`/api/journal/${selectedEntry.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete journal entry");
      }
      
      setJournals(prevJournals => prevJournals.filter(j => j.id !== selectedEntry.id));
      
      toast({
        description: "Journal entry deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      toast({
        title: "Error",
        description: "Failed to delete journal entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSelectedEntry(null);
      setDeleteDialogOpen(false);
    }
  };

  // Filter journals by search term
  const filteredJournals = journals.filter(journal => 
    journal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (journal.content && journal.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get days for the current month view
  const getDaysInMonth = () => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    return eachDayOfInterval({ start, end });
  };

  // Check if a specific day has a journal entry
  const getJournalForDay = (date: Date) => {
    return journals.find(journal => 
      isSameDay(new Date(journal.date), date)
    );
  };

  // Navigate to previous month
  const prevMonth = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  // Navigate to next month
  const nextMonth = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  // Get emoji for mood
  const getMoodEmoji = (mood: string | null) => {
    switch (mood) {
      case "happy":
        return <Smile className="h-5 w-5 text-green-500" />;
      case "sad":
        return <Frown className="h-5 w-5 text-blue-500" />;
      case "neutral":
      default:
        return <Meh className="h-5 w-5 text-amber-500" />;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMMM d, yyyy");
  };

  // Journal entry card component
  const JournalCard = ({ journal }: { journal: Journal }) => (
    <Card key={journal.id} className="mb-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/journal/${journal.id}`)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{journal.title}</CardTitle>
            <CardDescription>
              {formatDate(journal.date)}
            </CardDescription>
          </div>
          
          <div className="flex items-center">
            {journal.mood && (
              <div className="mr-2">
                {getMoodEmoji(journal.mood)}
              </div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/journal/${journal.id}/edit`);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  className="text-red-500 focus:text-red-500" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEntry(journal);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {journal.content ? (
          <p className="text-muted-foreground line-clamp-3">{journal.content}</p>
        ) : (
          <p className="text-muted-foreground italic">No content</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div>
      <div className="flex justify-between items-center">
        <Tabs 
          defaultValue="list" 
          onValueChange={(value) => setCurrentView(value as "list" | "calendar")}
          value={currentView}
        >
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex-1 max-w-xs ml-auto">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search journals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading journal entries...</p>
        </div>
      ) : journals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No journal entries found</p>
          <Button onClick={() => router.push("/journal/new")}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Your First Entry
          </Button>
        </div>
      ) : currentView === "list" ? (
        <div>
          {filteredJournals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No matching journal entries found</p>
            </div>
          ) : (
            <div>
              {filteredJournals.map(journal => (
                <JournalCard key={journal.id} journal={journal} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Journal Calendar</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  {format(selectedDate, "MMMM yyyy")}
                </span>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-xs font-medium py-1">
                  {day}
                </div>
              ))}
              
              {/* Get the first day of the month and calculate offset */}
              {Array.from({ length: startOfMonth(selectedDate).getDay() }).map((_, i) => (
                <div key={`empty-start-${i}`} className="h-24 rounded-md p-1" />
              ))}
              
              {/* Days in month */}
              {getDaysInMonth().map((day) => {
                const journalEntry = getJournalForDay(day);
                const hasEntry = Boolean(journalEntry);
                
                return (
                  <div 
                    key={day.toString()} 
                    className={`h-24 rounded-md p-1 relative border ${hasEntry ? 'hover:shadow-md cursor-pointer' : ''}`}
                    onClick={() => {
                      if (hasEntry && journalEntry) {
                        router.push(`/journal/${journalEntry.id}`);
                      } else {
                        // Create new entry for this date
                        router.push(`/journal/new?date=${format(day, 'yyyy-MM-dd')}`);
                      }
                    }}
                  >
                    <div className="text-right font-medium text-sm">
                      {day.getDate()}
                    </div>
                    
                    {hasEntry && journalEntry && (
                      <div className="mt-1 px-1">
                        <div className="flex items-center">
                          {journalEntry.mood && (
                            <span className="mr-1">{getMoodEmoji(journalEntry.mood)}</span>
                          )}
                          <span className="text-xs line-clamp-1">{journalEntry.title}</span>
                        </div>
                        {journalEntry.content && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {journalEntry.content}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Fill remaining cells in the last row */}
              {Array.from({ length: 6 - endOfMonth(selectedDate).getDay() }).map((_, i) => (
                <div key={`empty-end-${i}`} className="h-24 rounded-md p-1" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
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