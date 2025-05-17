import { HabitsList } from "@/app/components/habits/habits-list";
import { HabitDashboard } from "@/app/components/habits/habit-dashboard";

export default function HabitsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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