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
  Plus, 
  BarChart3,
  FileEdit,
  CheckCircle2,
  LayoutGrid,
  ListTodo
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

  // Unified create items
  const createItems = [
    { name: "Journal Entry", href: "/journal/new" },
    { name: "Habit", href: "/habits/new" },
    { name: "Project", href: "/projects/new" },
    { name: "Task", href: "/tasks/new" },
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
              </SignedIn>
            </div>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <ThemeToggle />
            <SignedIn>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" aria-label="Create new">
                      <Plus className="h-4 w-4 mr-2" />
                      Create
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Create New</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {createItems.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href}>{item.name}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
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
                    aria-label="Open navigation menu"
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

                        {/* Browse */}
                        <div>
                          <h3 className="px-3 mb-3 text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                            Browse
                          </h3>
                          <div className="space-y-1">
                            {[
                              { name: "Dashboard", href: "/dashboard", Icon: BarChart3 },
                              { name: "Journal", href: "/journal", Icon: FileEdit },
                              { name: "Habits", href: "/habits", Icon: CheckCircle2 },
                              { name: "Projects", href: "/projects", Icon: LayoutGrid },
                              { name: "Tasks", href: "/tasks", Icon: ListTodo },
                            ].map(({ name, href, Icon }) => {
                              const isActive = pathname === href;
                              return (
                                <Link
                                  key={href}
                                  href={href}
                                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                    isActive
                                      ? "bg-purple-100/70 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium"
                                      : "hover:bg-purple-50/50 dark:hover:bg-purple-900/20 text-foreground"
                                  }`}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  <Icon className="h-5 w-5 text-purple-400 dark:text-purple-300" />
                                  <span className="text-base block">{name}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>

                        {/* Create */}
                        <div>
                          <h3 className="px-3 mb-3 text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                            Create
                          </h3>
                          <div className="space-y-1">
                            {[
                              { name: "Journal Entry", href: "/journal/new" },
                              { name: "Habit", href: "/habits/new" },
                              { name: "Project", href: "/projects/new" },
                              { name: "Task", href: "/tasks/new" },
                            ].map(({ name, href }) => (
                              <Link
                                key={href}
                                href={href}
                                className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-purple-50/50 dark:hover:bg-purple-900/20 text-foreground"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                <Plus className="h-5 w-5 text-purple-400 dark:text-purple-300" />
                                <span className="text-base block">{name}</span>
                              </Link>
                            ))}
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