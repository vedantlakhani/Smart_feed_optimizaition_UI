"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Zap } from "lucide-react";

interface TopbarProps {
  selectedFile: string;
  onFileChange: (file: string) => void;
}

export function Topbar({ selectedFile, onFileChange }: TopbarProps) {
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/input-files")
      .then((r) => r.json())
      .then((d) => {
        setFiles(d.files ?? []);
        if (!selectedFile && d.files?.length > 0) {
          onFileChange(d.files[0]);
        }
      })
      .catch(() => setFiles([]));
  }, []);

  return (
    <div className="topbar px-6 py-3 flex items-center justify-between">
      {/* Wordmark */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900">
          <Zap className="w-4 h-4 text-[#06b6d4]" />
        </div>
        <div>
          <span className="text-slate-900 font-bold text-lg tracking-tight leading-none">
            Ax
          </span>
          <span className="text-[#06b6d4] font-bold text-lg tracking-tight leading-none">
            Optimize
          </span>
        </div>
        <div className="ml-3 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
          <span className="text-slate-500 text-xs font-medium tracking-wide">
            Smart-Feed v9
          </span>
        </div>
      </div>

      {/* Right: file selector */}
      <div className="flex items-center gap-3">
        <span className="text-slate-400 text-sm">Waste Manifest:</span>
        <Select value={selectedFile} onValueChange={(v) => v && onFileChange(v)}>
          <SelectTrigger className="w-52 text-sm bg-white border-slate-200 shadow-sm">
            <SelectValue placeholder="Select input file…" />
          </SelectTrigger>
          <SelectContent>
            {files.map((f) => (
              <SelectItem key={f} value={f} className="text-sm">
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
