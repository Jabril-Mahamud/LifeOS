"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileEdit, CheckCircle2, LayoutGrid, ListTodo, Plus, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Journal", href: "/journal", icon: FileEdit },
  { name: "Habits", href: "/habits", icon: CheckCircle2 },
  { name: "Projects", href: "/projects", icon: LayoutGrid },
  { name: "Tasks", href: "/tasks", icon: ListTodo },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:shrink-0 border-r">
      <div className="h-14 sm:h-16" />
      <nav className="px-3 py-4 space-y-1">
        {navItems.map(({ name, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-purple-100/70 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium"
                  : "hover:bg-purple-50/50 dark:hover:bg-purple-900/20 text-foreground"
              )}
            >
              <Icon className="h-4 w-4 text-purple-400 dark:text-purple-300" />
              <span>{name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-3">
        <CreateMenuButton />
      </div>
    </aside>
  );
}

function CreateMenuButton() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Link href="/journal/new">
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Journal
        </Button>
      </Link>
      <Link href="/habits/new">
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Habit
        </Button>
      </Link>
      <Link href="/projects/new">
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Project
        </Button>
      </Link>
      <Link href="/tasks/new">
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Task
        </Button>
      </Link>
    </div>
  );
}

export default Sidebar;

