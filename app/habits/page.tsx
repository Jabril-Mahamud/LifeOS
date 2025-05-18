// app/habits/page.tsx
import { HabitsList } from "@/components/habits/habits-list";
import { HabitDashboard } from "@/components/habits/habit-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HabitsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Habit Management</CardTitle>
          <CardDescription>
            Configure the habits you want to track in your daily journal entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            On this page, you can create, edit, and manage your habits. These habits will be available to track in your daily journal entries.
          </p>
          <div className="flex gap-4">
            <Button asChild variant="outline">
              <Link href="/journal">Return to Journal</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex flex-col-reverse lg:flex-row gap-6">
        <div className="flex-1">
          <HabitsList />
        </div>
        <div className="lg:w-96">
          <HabitDashboard />
        </div>
      </div>
    </div>
  );
}