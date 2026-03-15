"use client";

import React, { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "#F59E0B",
      shimmerSize = "0.1em",
      shimmerDuration = "2s",
      borderRadius = "8px",
      background = "rgba(15, 20, 30, 0.95)",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
          } as CSSProperties
        }
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-amber-500/30 px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)]",
          "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px",
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Shimmer layer */}
        <div
          className={cn(
            "-z-30 blur-[2px]",
            "absolute inset-0 overflow-visible [container-type:size]"
          )}
        >
          <div className="absolute inset-0 h-full w-full animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
            <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </div>
        </div>

        {children}

        {/* Punch through */}
        <div
          className={cn(
            "insert-0 absolute size-full",
            "rounded-[inherit] px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#F59E0B1f]",
            "transform-gpu transition-all duration-300 ease-in-out",
            "group-hover:shadow-[inset_0_-6px_10px_#F59E0B3f]",
            "group-active:shadow-[inset_0_-10px_10px_#F59E0B3f]"
          )}
        />
      </button>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";
