"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, RotateCcw, Bell, Coffee, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

// Timer settings type
type TimerSettings = {
  pomodoro: number;  // in minutes
  shortBreak: number;  // in minutes
  longBreak: number;  // in minutes
  longBreakInterval: number;  // after how many pomodoros
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  notifications: boolean;
};

// Timer states
type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

// Default settings
const defaultSettings: TimerSettings = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  autoStartBreaks: true,
  autoStartPomodoros: false,
  notifications: true,
};

export function PomodoroTimer() {
  // States
  const [settings, setSettings] = useState<TimerSettings>(defaultSettings);
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(settings.pomodoro * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(100);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio on component mount
  useEffect(() => {
    audioRef.current = new Audio("/sounds/bell.mp3"); // You'll need to add this sound file to your public folder
    
    // Load settings from localStorage if available
    const savedSettings = localStorage.getItem("pomodoroSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    // Load pomodoro count from localStorage if available
    const savedCount = localStorage.getItem("pomodoroCount");
    if (savedCount) {
      setPomodoroCount(parseInt(savedCount, 10));
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Update timer when settings or mode changes
  useEffect(() => {
    let duration = 0;
    switch (mode) {
      case "pomodoro":
        duration = settings.pomodoro * 60;
        break;
      case "shortBreak":
        duration = settings.shortBreak * 60;
        break;
      case "longBreak":
        duration = settings.longBreak * 60;
        break;
    }
    
    setTimeLeft(duration);
    setProgress(100);
    
    // Stop timer when switching modes
    if (isRunning) {
      setIsRunning(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [mode, settings]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer finished
            clearInterval(timerRef.current!);
            setIsRunning(false);
            
            // Play sound
            if (settings.notifications && audioRef.current) {
              audioRef.current.play().catch(error => {
                console.error("Error playing sound:", error);
              });
            }
            
            // Show notification
            if (settings.notifications) {
              if (mode === "pomodoro") {
                setNotificationMessage("Pomodoro completed! Time for a break.");
              } else {
                setNotificationMessage("Break time is over! Back to work.");
              }
              setShowNotification(true);
              
              // Auto-hide notification after 5 seconds
              setTimeout(() => {
                setShowNotification(false);
              }, 5000);
              
              // Browser notification
              if (Notification.permission === "granted") {
                new Notification(
                  mode === "pomodoro" ? "Pomodoro completed!" : "Break time is over!",
                  {
                    body: mode === "pomodoro" ? "Time for a break." : "Back to work.",
                    icon: "/favicon.ico",
                  }
                );
              }
            }
            
            // Handle pomodoro completion
            if (mode === "pomodoro") {
              const newCount = pomodoroCount + 1;
              setPomodoroCount(newCount);
              localStorage.setItem("pomodoroCount", newCount.toString());
              
              // Determine if we should take a long break
              if (newCount % settings.longBreakInterval === 0) {
                if (settings.autoStartBreaks) {
                  setMode("longBreak");
                  startTimer();
                } else {
                  setMode("longBreak");
                }
              } else {
                if (settings.autoStartBreaks) {
                  setMode("shortBreak");
                  startTimer();
                } else {
                  setMode("shortBreak");
                }
              }
            } else {
              // Break completed, start next pomodoro
              if (settings.autoStartPomodoros) {
                setMode("pomodoro");
                startTimer();
              } else {
                setMode("pomodoro");
              }
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [isRunning, mode, pomodoroCount, settings]);

  // Update progress bar
  useEffect(() => {
    let totalSeconds = 0;
    switch (mode) {
      case "pomodoro":
        totalSeconds = settings.pomodoro * 60;
        break;
      case "shortBreak":
        totalSeconds = settings.shortBreak * 60;
        break;
      case "longBreak":
        totalSeconds = settings.longBreak * 60;
        break;
    }
    
    const calculatedProgress = (timeLeft / totalSeconds) * 100;
    setProgress(calculatedProgress);
  }, [timeLeft, mode, settings]);

  // Format time for display (mm:ss)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Start timer
  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
    }
  };

  // Pause timer
  const pauseTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Reset timer
  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
    
    let duration = 0;
    switch (mode) {
      case "pomodoro":
        duration = settings.pomodoro * 60;
        break;
      case "shortBreak":
        duration = settings.shortBreak * 60;
        break;
      case "longBreak":
        duration = settings.longBreak * 60;
        break;
    }
    
    setTimeLeft(duration);
    setProgress(100);
  };

  // Skip to next timer
  const skipTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
    
    if (mode === "pomodoro") {
      // If current mode is pomodoro, check if we should start a long break or short break
      const newCount = pomodoroCount + 1;
      setPomodoroCount(newCount);
      localStorage.setItem("pomodoroCount", newCount.toString());
      
      if (newCount % settings.longBreakInterval === 0) {
        setMode("longBreak");
      } else {
        setMode("shortBreak");
      }
    } else {
      // If current mode is a break, switch to pomodoro
      setMode("pomodoro");
    }
  };

  // Save settings
  const saveSettings = (newSettings: TimerSettings) => {
    setSettings(newSettings);
    localStorage.setItem("pomodoroSettings", JSON.stringify(newSettings));
    setSettingsOpen(false);
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.log("Notification permission denied");
      }
    }
  };

  useEffect(() => {
    if (settings.notifications) {
      requestNotificationPermission();
    }
  }, [settings.notifications]);

  // Settings component
  const SettingsDialog = () => {
    const [tempSettings, setTempSettings] = useState<TimerSettings>(settings);
    
    const handleChange = (key: keyof TimerSettings, value: any) => {
      setTempSettings(prev => ({
        ...prev,
        [key]: value
      }));
    };
    
    return (
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Timer Settings</DialogTitle>
            <DialogDescription>
              Customize your pomodoro timer settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="pomodoro">Pomodoro Duration</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="pomodoro"
                  type="number"
                  min="1"
                  max="60"
                  value={tempSettings.pomodoro}
                  onChange={(e) => handleChange("pomodoro", parseInt(e.target.value))}
                  className="w-20"
                />
                <span>minutes</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="shortBreak">Short Break</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="shortBreak"
                  type="number"
                  min="1"
                  max="30"
                  value={tempSettings.shortBreak}
                  onChange={(e) => handleChange("shortBreak", parseInt(e.target.value))}
                  className="w-20"
                />
                <span>minutes</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="longBreak">Long Break</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="longBreak"
                  type="number"
                  min="1"
                  max="60"
                  value={tempSettings.longBreak}
                  onChange={(e) => handleChange("longBreak", parseInt(e.target.value))}
                  className="w-20"
                />
                <span>minutes</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="longBreakInterval">Long Break After</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="longBreakInterval"
                  type="number"
                  min="1"
                  max="10"
                  value={tempSettings.longBreakInterval}
                  onChange={(e) => handleChange("longBreakInterval", parseInt(e.target.value))}
                  className="w-20"
                />
                <span>pomodoros</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="autoStartBreaks">Auto-start Breaks</Label>
              <Switch
                id="autoStartBreaks"
                checked={tempSettings.autoStartBreaks}
                onCheckedChange={(checked) => handleChange("autoStartBreaks", checked)}
              />
            </div>
            
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="autoStartPomodoros">Auto-start Pomodoros</Label>
              <Switch
                id="autoStartPomodoros"
                checked={tempSettings.autoStartPomodoros}
                onCheckedChange={(checked) => handleChange("autoStartPomodoros", checked)}
              />
            </div>
            
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="notifications">Sound & Notifications</Label>
              <Switch
                id="notifications"
                checked={tempSettings.notifications}
                onCheckedChange={(checked) => handleChange("notifications", checked)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => saveSettings(tempSettings)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Get color based on current mode
  const getModeColor = () => {
    switch (mode) {
      case "pomodoro":
        return "bg-red-500";
      case "shortBreak":
        return "bg-green-500";
      case "longBreak":
        return "bg-blue-500";
    }
  };

  return (
    <Card className="shadow-md">
      {/* Notification */}
      {showNotification && (
        <div className="absolute top-4 right-4 bg-card border p-4 rounded shadow-lg z-10 max-w-xs">
          <p>{notificationMessage}</p>
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Pomodoro Timer</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
        <CardDescription>
          Completed today: {pomodoroCount} pomodoros
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center space-y-4">
        {/* Timer Mode Selection */}
        <div className="flex rounded-lg overflow-hidden divide-x divide-border">
          <Button
            variant={mode === "pomodoro" ? "default" : "ghost"}
            className={`px-4 py-2 ${mode === "pomodoro" ? "bg-red-500 hover:bg-red-600" : ""}`}
            onClick={() => setMode("pomodoro")}
          >
            Pomodoro
          </Button>
          <Button
            variant={mode === "shortBreak" ? "default" : "ghost"}
            className={`px-4 py-2 ${mode === "shortBreak" ? "bg-green-500 hover:bg-green-600" : ""}`}
            onClick={() => setMode("shortBreak")}
          >
            Short Break
          </Button>
          <Button
            variant={mode === "longBreak" ? "default" : "ghost"}
            className={`px-4 py-2 ${mode === "longBreak" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
            onClick={() => setMode("longBreak")}
          >
            Long Break
          </Button>
        </div>
        
        {/* Timer Display */}
        <div className="text-6xl font-mono font-light mt-4 mb-2">
          {formatTime(timeLeft)}
        </div>
        
        {/* Progress Bar */}
        <Progress value={progress} className="w-full h-2" />
        
        {/* Controls */}
        <div className="flex gap-4 mt-4">
          {isRunning ? (
            <Button variant="outline" size="icon" onClick={pauseTimer}>
              <Pause className="h-5 w-5" />
              <span className="sr-only">Pause</span>
            </Button>
          ) : (
            <Button 
              size="icon" 
              onClick={startTimer}
              className={`${mode === "pomodoro" ? "bg-red-500 hover:bg-red-600" : mode === "shortBreak" ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"}`}
            >
              <Play className="h-5 w-5" />
              <span className="sr-only">Start</span>
            </Button>
          )}
          
          <Button variant="outline" size="icon" onClick={resetTimer}>
            <RotateCcw className="h-5 w-5" />
            <span className="sr-only">Reset</span>
          </Button>
          
          <Button variant="outline" size="icon" onClick={skipTimer}>
            <SkipForward className="h-5 w-5" />
            <span className="sr-only">Skip</span>
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <p className="text-sm text-muted-foreground w-full text-center">
          {mode === "pomodoro" ? (
            "Focus on your task"
          ) : (
            "Take a break and relax"
          )}
        </p>
      </CardFooter>
      
      {/* Settings Dialog */}
      <SettingsDialog />
    </Card>
  );
}