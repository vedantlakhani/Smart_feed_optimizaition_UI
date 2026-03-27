import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface SensitivityNoteProps {
  className?: string;
}

export function SensitivityNote({ className }: SensitivityNoteProps) {
  return (
    <p className={cn("text-xs text-amber-600/80 flex items-start gap-1 mt-1", className)}>
      <Info className="w-3 h-3 shrink-0 mt-0.5" />
      Directional estimate — savings figures will shift when calibration parameters are measured from reactor data.
    </p>
  );
}
