"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  size?: "sm" | "md" | "lg";
  thickness?: "thin" | "regular" | "thick";
  showValue?: boolean;
  color?: string;
  label?: string;
  backgroundColor?: string;
  textClassName?: string;
  icon?: React.ReactNode;
}

export function CircularProgress({
  value,
  size = "md",
  thickness = "regular",
  showValue = true,
  color = "currentColor",
  label,
  backgroundColor = "hsl(var(--muted))",
  className,
  textClassName,
  icon,
  ...props
}: CircularProgressProps) {
  // Ensure value is between 0 and 100 and is a number
  const normalizedValue = isNaN(value) ? 0 : Math.min(Math.max(value, 0), 100);
  
  // Calculate SVG parameters
  const sizeMap = {
    sm: 60,
    md: 100,
    lg: 160,
  };
  
  const thicknessMap = {
    thin: 2,
    regular: 6,
    thick: 10,
  };
  
  const svgSize = sizeMap[size];
  const strokeWidth = thicknessMap[thickness];
  const radius = (svgSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;
  
  // Font size based on circle size
  const getFontSize = () => {
    switch (size) {
      case "sm":
        return "text-sm";
      case "md":
        return "text-lg";
      case "lg":
        return "text-2xl";
      default:
        return "text-lg";
    }
  };

  // Label font size
  const getLabelFontSize = () => {
    switch (size) {
      case "sm":
        return "text-xs";
      case "md":
        return "text-sm";
      case "lg":
        return "text-base";
      default:
        return "text-sm";
    }
  };

  return (
    <div 
      className={cn("relative inline-flex items-center justify-center", className)} 
      {...props}
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="transparent"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={String(strokeDashoffset)} 
          strokeLinecap="round"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {icon && (
          <div className="mb-1">
            {icon}
          </div>
        )}
        
        {showValue && (
          <span 
            className={cn(
              "font-medium", 
              getFontSize(),
              textClassName
            )}
          >
            {Math.round(normalizedValue)}%
          </span>
        )}
        
        {label && (
          <span 
            className={cn(
              "text-muted-foreground", 
              getLabelFontSize()
            )}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}