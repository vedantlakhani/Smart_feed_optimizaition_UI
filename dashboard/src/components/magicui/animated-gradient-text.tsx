"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface AnimatedGradientTextProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedGradientText({
  children,
  className,
}: AnimatedGradientTextProps) {
  return (
    <div
      className={cn(
        "group relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-2xl bg-white/10 px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#ffffff1f] backdrop-blur-sm transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#ffffff3f] dark:bg-black/10",
        className
      )}
    >
      <span
        className={cn(
          "animate-gradient bg-gradient-to-r from-[#F59E0B] via-[#5E81AC] to-[#F59E0B] bg-[length:200%_auto] bg-clip-text text-transparent"
        )}
      >
        {children}
      </span>
    </div>
  );
}
