"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileEdit, ListTodo, CheckCircle2 } from "lucide-react";

export function QuickAdd() {
  const router = useRouter();
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Quick Add</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Button variant="outline" onClick={() => router.push("/journal/new")}> 
          <FileEdit className="h-4 w-4 mr-2" /> Journal
        </Button>
        <Button variant="outline" onClick={() => router.push("/tasks/new")}> 
          <ListTodo className="h-4 w-4 mr-2" /> Task
        </Button>
        <Button variant="outline" onClick={() => router.push("/habits/new")}> 
          <CheckCircle2 className="h-4 w-4 mr-2" /> Habit
        </Button>
      </CardContent>
    </Card>
  );
}

export default QuickAdd;

