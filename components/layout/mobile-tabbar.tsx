"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileEdit, CheckCircle2, LayoutGrid, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { name: "Dashboard", href: "/dashboard", Icon: BarChart3 },
  { name: "Journal", href: "/journal", Icon: FileEdit },
  { name: "Habits", href: "/habits", Icon: CheckCircle2 },
  { name: "Projects", href: "/projects", Icon: LayoutGrid },
  { name: "Tasks", href: "/tasks", Icon: ListTodo },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="grid grid-cols-5 px-2 py-2" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {items.map(({ name, href, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-md text-xs",
                isActive ? "text-purple-700 dark:text-purple-300" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-purple-500" : "")} />
              <span>{name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default MobileTabBar;

