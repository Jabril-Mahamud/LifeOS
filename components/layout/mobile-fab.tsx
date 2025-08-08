"use client";

import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

const createItems = [
  { name: "Journal Entry", href: "/journal/new" },
  { name: "Habit", href: "/habits/new" },
  { name: "Project", href: "/projects/new" },
  { name: "Task", href: "/tasks/new" },
];

export function MobileFab() {
  const pathname = usePathname();

  // Don't show FAB on new/edit pages
  if (pathname.includes("/new") || pathname.includes("/edit")) {
    return null;
  }

  return (
    <div className="lg:hidden fixed right-4 bottom-20 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg"
            aria-label="Create new"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {createItems.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href}>{item.name}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}