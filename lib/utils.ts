import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, startOfDay, isSameDay } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date for display
export function formatDisplayDate(date: string | Date, formatStr: string = 'EEEE, MMMM d, yyyy'): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, formatStr);
}

// Get normalized today date (without time component)
export function getTodayDate(): Date {
  return startOfDay(new Date());
}

// Check if a date is today
export function isDateToday(date: string | Date): boolean {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return isSameDay(parsedDate, new Date());
}

// Safely parse a date string
export function safeParseDateString(dateStr: string): Date {
  const parsed = parseISO(dateStr);
  if (isNaN(parsed.getTime())) {
    console.warn(`Invalid date string: ${dateStr}`);
    return new Date(); // Fallback to current date
  }
  return parsed;
}