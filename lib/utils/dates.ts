import {
  startOfDay,
  endOfDay,
  isToday,
  isTomorrow,
  isYesterday,
  parseISO,
  formatISO,
} from "date-fns";

// Get user's timezone from browser
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

// Get start of day in user's timezone
export const startOfUserDay = (date: Date | string = new Date()): Date => {
  const inputDate = typeof date === "string" ? parseISO(date) : date;
  return startOfDay(inputDate);
};

// Get end of day in user's timezone
export const endOfUserDay = (date: Date | string = new Date()): Date => {
  const inputDate = typeof date === "string" ? parseISO(date) : date;
  return endOfDay(inputDate);
};

// Format a date for storage (UTC ISO string)
export const formatForStorage = (date: Date | string): string => {
  const utcDate = typeof date === "string" ? parseISO(date) : date;
  return formatISO(utcDate);
};

// Format a date for display with relative terms
export const formatForDisplay = (date: Date | string): string => {
  const inputDate = typeof date === "string" ? parseISO(date) : date;
  const timezone = getUserTimezone();
  
  if (isToday(inputDate)) {
    return "Today";
  } else if (isTomorrow(inputDate)) {
    return "Tomorrow";
  } else if (isYesterday(inputDate)) {
    return "Yesterday";
  }
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: timezone,
  }).format(inputDate);
};

// Format a date with time for display
export const formatWithTime = (date: Date | string): string => {
  const inputDate = typeof date === "string" ? parseISO(date) : date;
  const timezone = getUserTimezone();
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZone: timezone,
  }).format(inputDate);
};