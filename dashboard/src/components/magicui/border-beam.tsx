"use client";

import { cn } from "@/lib/utils";
import { CSSProperties } from "react";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  borderWidth?: number;
}

export function BorderBeam({
  className,
  size = 200,
  duration = 12,
  delay = 0,
  colorFrom = "#F59E0B",
  colorTo = "#5E81AC",
  borderWidth = 1.5,
}: BorderBeamProps) {
  return (
    <div
      style={
        {
          "--size": size,
          "--duration": duration,
          "--anchor": 90,
          "--border-width": borderWidth,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          "--delay": `-${delay}s`,
        } as CSSProperties
      }
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent]",
        "[background:linear-gradient(white,white)_padding-box,conic-gradient(from_calc(360deg*(var(--anchor)/360)-90deg),var(--color-from)_calc(1*360deg/5),var(--color-to)_calc(2*360deg/5),transparent_calc(3*360deg/5))_border-box] dark:[background:linear-gradient(#12151A,#12151A)_padding-box,conic-gradient(from_calc(360deg*(var(--anchor)/360)-90deg),var(--color-from)_calc(1*360deg/5),var(--color-to)_calc(2*360deg/5),transparent_calc(3*360deg/5))_border-box]",
        "animate-border-beam",
        className
      )}
    />
  );
}
