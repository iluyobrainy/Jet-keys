"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode, memo } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = memo(({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        "relative flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-900 text-slate-950",
        className
      )}
      {...props}
    >
      {/* Simplified Aurora Background - Performance Optimized */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            "absolute inset-0 opacity-30",
            "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
            "dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20",
            showRadialGradient && "bg-gradient-radial from-transparent via-blue-50/50 to-transparent",
            "animate-aurora-simple"
          )}
          style={{
            willChange: 'opacity',
            transform: 'translateZ(0)',
          }}
        />
      </div>
      <div className="relative z-10 pointer-events-auto">
        {children}
      </div>
    </div>
  );
});

AuroraBackground.displayName = "AuroraBackground";
