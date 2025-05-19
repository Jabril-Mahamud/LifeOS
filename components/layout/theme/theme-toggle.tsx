"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          {theme === "light" && <Sun className="h-[1.2rem] w-[1.2rem]" />}
          {theme === "dark" && <Moon className="h-[1.2rem] w-[1.2rem]" />}
          {theme === "colorful" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[1.2rem] w-[1.2rem]"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a4.2 4.2 0 0 0 4 4 4.2 4.2 0 0 1 3 2 4.2 4.2 0 0 1-1 5 4.2 4.2 0 0 0-1 3 4.2 4.2 0 0 1-2 3 4.2 4.2 0 0 1-5-1 4.2 4.2 0 0 0-3-1 4.2 4.2 0 0 1-3-2 4.2 4.2 0 0 1 1-5 4.2 4.2 0 0 0 1-3 4.2 4.2 0 0 1 2-3 4.2 4.2 0 0 1 5 1 4.2 4.2 0 0 0 3 1" />
            </svg>
          )}
          {(!theme || theme === "system") && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[1.2rem] w-[1.2rem]"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" x2="16" y1="21" y2="21" />
              <line x1="12" x2="12" y1="17" y2="21" />
            </svg>
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="h-4 w-4 mr-2" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="h-4 w-4 mr-2" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("colorful")}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 mr-2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a4.2 4.2 0 0 0 4 4 4.2 4.2 0 0 1 3 2 4.2 4.2 0 0 1-1 5 4.2 4.2 0 0 0-1 3 4.2 4.2 0 0 1-2 3 4.2 4.2 0 0 1-5-1 4.2 4.2 0 0 0-3-1 4.2 4.2 0 0 1-3-2 4.2 4.2 0 0 1 1-5 4.2 4.2 0 0 0 1-3 4.2 4.2 0 0 1 2-3 4.2 4.2 0 0 1 5 1 4.2 4.2 0 0 0 3 1" />
          </svg>
          Colorful
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 mr-2"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" x2="16" y1="21" y2="21" />
            <line x1="12" x2="12" y1="17" y2="21" />
          </svg>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}