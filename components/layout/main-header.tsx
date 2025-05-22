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
import { 
  Menu, 
  ChevronDown, 
  FileEdit, 
  CheckCircle2, 
  Plus, 
  LayoutGrid, 
  ListTodo,
  BarChart3
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
    <header className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-foreground"
                >
                  <path
                    d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 12H15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 16H15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9 12H9.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9 16H9.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 3V7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9 7H15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="ml-2 text-lg font-semibold text-foreground">
                  LifeOS
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <SignedIn>
                {/* Dashboard Link */}
                <Link
                  href="/dashboard"
                  className={`${
                    pathname === "/dashboard"
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>

                {/* Journal & Habits Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`${
                        isJournalHabitsActive()
                          ? "border-primary text-foreground"
                          : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16`}
                    >
                      <FileEdit className="h-4 w-4 mr-2" />
                      Journal & Habits
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>Journal & Habits</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {journalHabitsItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem key={item.name} asChild>
                          <Link href={item.href} className="flex items-start gap-2 p-2">
                            <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
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
                          ? "border-primary text-foreground"
                          : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16`}
                    >
                      <LayoutGrid className="h-4 w-4 mr-2" />
                      Projects & Tasks
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>Projects & Tasks</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {projectsTasksItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem key={item.name} asChild>
                          <Link href={item.href} className="flex items-start gap-2 p-2">
                            <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
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

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* Theme toggle */}
            <ThemeToggle />

            <SignedIn>
              <div className="flex items-center gap-4 ml-4">
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
              <div className="flex items-center space-x-4">
                <Link href="/sign-in">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link href="/sign-up">
                  <Button>Sign up</Button>
                </Link>
              </div>
            </SignedOut>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            {/* Theme toggle for mobile */}
            <ThemeToggle />

            <SignedIn>
              <DropdownMenu
                open={isMobileMenuOpen}
                onOpenChange={setIsMobileMenuOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 ml-2"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open main menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 mt-2 rounded-md"
                >
                  <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Dashboard */}
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard"
                      className={`flex items-center gap-2 ${
                        pathname === "/dashboard" ? "bg-accent font-semibold" : ""
                      }`}
                    >
                      <BarChart3 className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs">Journal & Habits</DropdownMenuLabel>
                  
                  {/* Journal & Habits Items */}
                  {journalHabitsItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-2 ${
                            pathname === item.href ? "bg-accent font-semibold" : ""
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs">Projects & Tasks</DropdownMenuLabel>
                  
                  {/* Projects & Tasks Items */}
                  {projectsTasksItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-2 ${
                            pathname === item.href ? "bg-accent font-semibold" : ""
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                  
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          userButtonAvatarBox: "h-8 w-8",
                        },
                      }}
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </SignedIn>

            <SignedOut>
              <Link href="/sign-in">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground text-sm font-medium px-4 py-2"
                >
                  Sign in
                </Button>
              </Link>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
}