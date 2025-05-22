"use client";

import { Clock } from "lucide-react";
import { PomodoroTimer } from "@/components/widgets/pomodoro-timer";

export default function PomodoroPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Clock className="h-6 w-6 mr-2" />
            Pomodoro Timer
          </h1>
          <p className="text-muted-foreground">
            Use the Pomodoro technique to stay focused and productive
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <PomodoroTimer />
      </div>

      <div className="max-w-2xl mx-auto mt-8">
        <h2 className="text-xl font-semibold mb-4">About the Pomodoro Technique</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s.
            It uses a timer to break work into intervals, traditionally 25 minutes in length, separated by short breaks.
          </p>
          <h3 className="text-lg font-medium text-foreground">How it works:</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Choose a task you want to work on</li>
            <li>Set the timer for 25 minutes (one "Pomodoro")</li>
            <li>Work on the task until the timer rings</li>
            <li>Take a short break (5 minutes)</li>
            <li>After four Pomodoros, take a longer break (15-30 minutes)</li>
          </ol>
          <p>
            This technique helps improve focus and concentration by working in short, focused bursts with regular breaks to rest your mind.
          </p>
        </div>
      </div>
    </div>
  );
}