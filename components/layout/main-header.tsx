// components/layout/main-header.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  ChevronDown, 
  FileEdit, 
  CheckCircle2, 
  Plus, 
  LayoutGrid, 
  ListTodo,
  BarChart3,
  X
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme/theme-toggle";

export function MainHeader() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Check if current path is in journal/habits system
  const isJournalHabitsActive = () => {
    return pathname.startsWith('/journal') || pathname.startsWith('/habits');
  };

  // Check if current path is in projects/tasks system
  const isProjectsTasksActive = () => {
    return pathname.startsWith('/projects') || pathname.startsWith('/tasks');
  };

  // Journal & Habits navigation items
  const journalHabitsItems = [
    {
      name: "Journal",
      href: "/journal",
      icon: FileEdit,
      description: "View all journal entries"
    },
    {
      name: "Manage Habits",
      href: "/habits",
      icon: CheckCircle2,
      description: "Track and manage habits"
    },
    {
      name: "New Journal Entry",
      href: "/journal/new",
      icon: Plus,
      description: "Write a new journal entry"
    },
    {
      name: "New Habit",
      href: "/habits/new",
      icon: Plus,
      description: "Create a new habit"
    },
  ];

  // Projects & Tasks navigation items
  const projectsTasksItems = [
    {
      name: "Projects",
      href: "/projects",
      icon: LayoutGrid,
      description: "View all projects"
    },
    {
      name: "Tasks",
      href: "/tasks",
      icon: ListTodo,
      description: "View all tasks"
    },
    {
      name: "New Project",
      href: "/projects/new",
      icon: Plus,
      description: "Create a new project"
    },
    {
      name: "New Task",
      href: "/tasks/new",
      icon: Plus,
      description: "Create a new task"
    },
  ];

  return (
    <header className="bg-background border-b border-purple-100/30 dark:border-purple-800/30 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-purple-300 dark:text-purple-400 sm:w-8 sm:h-8"
                >
                  <path
                    d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 12H15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 16H15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9 12H9.01"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9 16H9.01"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 3V7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9 7H15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="ml-2 text-base sm:text-lg font-medium text-foreground">
                  LifeOS
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:ml-6 lg:flex lg:space-x-8">
              <SignedIn>
                {/* Dashboard Link */}
                <Link
                  href="/dashboard"
                  className={`${
                    pathname === "/dashboard"
                      ? "border-purple-300 dark:border-purple-400 text-foreground"
                      : "border-transparent text-muted-foreground hover:border-purple-200 dark:hover:border-purple-600 hover:text-foreground"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                >
                  <BarChart3 className="h-4 w-4 mr-2 text-purple-300 dark:text-purple-400" />
                  Dashboard
                </Link>

                {/* Journal & Habits Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`${
                        isJournalHabitsActive()
                          ? "border-purple-300 dark:border-purple-400 text-foreground"
                          : "border-transparent text-muted-foreground hover:border-purple-200 dark:hover:border-purple-600 hover:text-foreground"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16 transition-colors`}
                    >
                      <FileEdit className="h-4 w-4 mr-2 text-purple-300 dark:text-purple-400" />
                      Journal & Habits
                      <ChevronDown className="h-3 w-3 ml-1 text-purple-300 dark:text-purple-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 border-purple-100/30 dark:border-purple-800/30">
                    <DropdownMenuLabel className="text-purple-400 dark:text-purple-300">Journal & Habits</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-purple-100/30 dark:bg-purple-800/30" />
                    {journalHabitsItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem key={item.name} asChild>
                          <Link href={item.href} className="flex items-start gap-2 p-2 hover:bg-purple-50/50 dark:hover:bg-purple-900/20">
                            <Icon className="h-4 w-4 mt-0.5 text-purple-300 dark:text-purple-400" />
                            <div className="flex flex-col">
                              <span className="font-medium">{item.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {item.description}
                              </span>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Projects & Tasks Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`${
                        isProjectsTasksActive()
                          ? "border-purple-300 dark:border-purple-400 text-foreground"
                          : "border-transparent text-muted-foreground hover:border-purple-200 dark:hover:border-purple-600 hover:text-foreground"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16 transition-colors`}
                    >
                      <LayoutGrid className="h-4 w-4 mr-2 text-purple-300 dark:text-purple-400" />
                      Projects & Tasks
                      <ChevronDown className="h-3 w-3 ml-1 text-purple-300 dark:text-purple-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 border-purple-100/30 dark:border-purple-800/30">
                    <DropdownMenuLabel className="text-purple-400 dark:text-purple-300">Projects & Tasks</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-purple-100/30 dark:bg-purple-800/30" />
                    {projectsTasksItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem key={item.name} asChild>
                          <Link href={item.href} className="flex items-start gap-2 p-2 hover:bg-purple-50/50 dark:hover:bg-purple-900/20">
                            <Icon className="h-4 w-4 mt-0.5 text-purple-300 dark:text-purple-400" />
                            <div className="flex flex-col">
                              <span className="font-medium">{item.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {item.description}
                              </span>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SignedIn>
            </div>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <ThemeToggle />
            <SignedIn>
              <div className="flex items-center gap-4">
                {user && (
                  <span className="text-sm text-muted-foreground">
                    {user.firstName}
                  </span>
                )}
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-8 w-8",
                    },
                  }}
                />
              </div>
            </SignedIn>
            <SignedOut>
              <div className="flex items-center space-x-3">
                <Link href="/sign-in">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-purple-50/50 dark:hover:bg-purple-900/20">
                    Sign in
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-purple-300 hover:bg-purple-400 dark:bg-purple-600 dark:hover:bg-purple-700 text-white border-0">
                    Sign up
                  </Button>
                </Link>
              </div>
            </SignedOut>
          </div>

          {/* Mobile Right Side */}
          <div className="flex items-center space-x-2 lg:hidden">
            <SignedIn>
              {/* Mobile Navigation Sheet */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 sm:w-96 p-0">
                  <div className="flex flex-col h-full">
                    <SheetHeader className="px-6 py-4 border-b">
                      <SheetTitle className="text-left flex items-center gap-2">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                                                      className="text-purple-300 dark:text-purple-400"
                        >
                          <path
                            d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <path
                            d="M12 12H15"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <path
                            d="M12 16H15"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <path
                            d="M9 12H9.01"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <path
                            d="M9 16H9.01"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <path
                            d="M12 3V7"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <path
                            d="M9 7H15"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        LifeOS
                      </SheetTitle>
                    </SheetHeader>
                    
                    <div className="flex-1 overflow-y-auto">
                      <nav className="px-6 py-4 space-y-6">
                        {/* User Section */}
                        {user && (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50/50 dark:bg-purple-900/20">
                            <UserButton
                              afterSignOutUrl="/"
                              appearance={{
                                elements: {
                                  userButtonAvatarBox: "h-10 w-10",
                                },
                              }}
                            />
                            <div>
                              <p className="font-medium text-foreground">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {user.primaryEmailAddress?.emailAddress}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Dashboard */}
                        <div>
                          <Link
                            href="/dashboard"
                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                              pathname === "/dashboard"
                                ? "bg-purple-100/70 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium"
                                : "hover:bg-purple-50/50 dark:hover:bg-purple-900/20 text-foreground"
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <BarChart3 className="h-5 w-5 text-purple-400 dark:text-purple-300" />
                            <span className="text-base">Dashboard</span>
                          </Link>
                        </div>

                        {/* Journal & Habits Section */}
                        <div>
                          <h3 className="px-3 mb-3 text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                            Journal & Habits
                          </h3>
                          <div className="space-y-1">
                            {journalHabitsItems.map((item) => {
                              const Icon = item.icon;
                              const isActive = pathname === item.href;
                              return (
                                <Link
                                  key={item.name}
                                  href={item.href}
                                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                    isActive
                                      ? "bg-purple-100/70 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium"
                                      : "hover:bg-purple-50/50 dark:hover:bg-purple-900/20 text-foreground"
                                  }`}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  <Icon className="h-5 w-5 text-purple-400 dark:text-purple-300" />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-base block">{item.name}</span>
                                    <span className="text-sm text-muted-foreground block truncate">
                                      {item.description}
                                    </span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>

                        {/* Projects & Tasks Section */}
                        <div>
                          <h3 className="px-3 mb-3 text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                            Projects & Tasks
                          </h3>
                          <div className="space-y-1">
                            {projectsTasksItems.map((item) => {
                              const Icon = item.icon;
                              const isActive = pathname === item.href;
                              return (
                                <Link
                                  key={item.name}
                                  href={item.href}
                                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                    isActive
                                      ? "bg-purple-100/70 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium"
                                      : "hover:bg-purple-50/50 dark:hover:bg-purple-900/20 text-foreground"
                                  }`}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  <Icon className="h-5 w-5 text-purple-400 dark:text-purple-300" />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-base block">{item.name}</span>
                                    <span className="text-sm text-muted-foreground block truncate">
                                      {item.description}
                                    </span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>

                        {/* Settings Section */}
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between p-3">
                            <span className="text-sm font-medium text-foreground">Theme</span>
                            <ThemeToggle />
                          </div>
                        </div>
                      </nav>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </SignedIn>

            <SignedOut>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <Link href="/sign-in">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground hover:bg-purple-50/50 dark:hover:bg-purple-900/20 text-sm px-3"
                  >
                    Sign in
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button
                    size="sm"
                    className="bg-purple-300 hover:bg-purple-400 dark:bg-purple-600 dark:hover:bg-purple-700 text-white border-0 text-sm px-3"
                  >
                    Sign up
                  </Button>
                </Link>
              </div>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
}