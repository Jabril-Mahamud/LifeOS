"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  title?: boolean;
  description?: boolean;
  items?: number;
  itemHeight?: string;
  className?: string;
}

export function LoadingSkeleton({
  title = true,
  description = true,
  items = 3,
  itemHeight = "h-16",
  className = "",
}: LoadingSkeletonProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        {title && <Skeleton className="h-6 w-32" />}
        {description && <Skeleton className="h-4 w-48 mt-2" />}
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: items }).map((_, i) => (
          <Skeleton key={i} className={itemHeight} />
        ))}
      </CardContent>
    </Card>
  );
}

export function LoadingSkeletonGrid({
  columns = 1,
  items = 3,
  ...props
}: LoadingSkeletonProps & { columns?: number }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-6`}>
      {Array.from({ length: items }).map((_, i) => (
        <LoadingSkeleton key={i} {...props} />
      ))}
    </div>
  );
}