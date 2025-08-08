"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function useLocalStorageNumber(key: string, initial: number) {
  const [value, setValue] = useState<number>(() => {
    const v = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
    return v ? Number(v) : initial;
  });
  useEffect(() => {
    window.localStorage.setItem(key, String(value));
  }, [key, value]);
  return [value, setValue] as const;
}

export default function PomodoroPage() {
  const [workMins, setWorkMins] = useLocalStorageNumber("pomodoro_workMins", 25);
  const [breakMins, setBreakMins] = useLocalStorageNumber("pomodoro_breakMins", 5);
  const [secondsLeft, setSecondsLeft] = useLocalStorageNumber("pomodoro_secondsLeft", workMins * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isWork, setIsWork] = useState<boolean>(() => {
    const v = typeof window !== "undefined" ? window.localStorage.getItem("pomodoro_isWork") : null;
    return v ? v === "true" : true;
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    window.localStorage.setItem("pomodoro_isWork", String(isWork));
  }, [isWork]);

  useEffect(() => {
    if (!isRunning) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          const nextIsWork = !isWork;
          setIsWork(nextIsWork);
          return (nextIsWork ? workMins : breakMins) * 60;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isWork, workMins, breakMins]);

  const reset = () => {
    setIsRunning(false);
    setIsWork(true);
    setSecondsLeft(workMins * 60);
  };

  const toggle = () => setIsRunning((r) => !r);

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold">Pomodoro</h1>
      <Card>
        <CardHeader>
          <CardTitle>{isWork ? "Focus" : "Break"} Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-6xl font-mono text-center">
            {minutes}:{seconds}
          </div>
          <div className="flex gap-2 justify-center">
            <Button onClick={toggle}>{isRunning ? "Pause" : "Start"}</Button>
            <Button variant="outline" onClick={reset}>Reset</Button>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm">Work (minutes)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                min={1}
                value={workMins}
                onChange={(e) => setWorkMins(Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="text-sm">Break (minutes)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                min={1}
                value={breakMins}
                onChange={(e) => setBreakMins(Number(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

