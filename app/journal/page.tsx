"use client";

import { FileEdit, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JournalList } from "@/components/journal/journal-list";
import { useRouter } from "next/navigation";

export default function JournalPage() {
  const router = useRouter();
  
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <FileEdit className="h-6 w-6 mr-2" />
            Journal
          </h1>
          <p className="text-muted-foreground">
            Record your thoughts and track your progress
          </p>
        </div>
        
        <Button onClick={() => router.push("/journal/new")}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>
      
      <JournalList />
    </div>
  );
}