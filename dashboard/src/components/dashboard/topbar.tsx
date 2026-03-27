"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      <div className="flex items-center gap-3">
        <span
          className="text-xl font-extrabold uppercase tracking-wider text-white"
          style={{ fontFamily: "'Open Sans', system-ui, sans-serif" }}
        >
          Ax<span style={{ color: "#2aabe1" }}>Nano</span>
        </span>
        <div
          className="px-2 py-0.5 text-xs font-semibold uppercase tracking-widest"
          style={{
            border: "1px solid #2aabe1",
            color: "#2aabe1",
            background: "transparent",
          }}
        >
          SmartFeed v9
        </div>
      </div>

      {/* Right: file selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm uppercase tracking-wider font-semibold" style={{ color: "#737373" }}>
          Waste Manifest:
        </span>
        <Select value={selectedFile} onValueChange={(v) => v && onFileChange(v)}>
          <SelectTrigger
            className="w-52 text-sm"
            style={{
              background: "#1e1e1e",
              border: "1px solid #3d3d3d",
              color: "#ffffff",
              borderRadius: 0,
            }}
          >
            <SelectValue placeholder="Select input file…" />
          </SelectTrigger>
          <SelectContent
            style={{
              background: "#1e1e1e",
              border: "1px solid #3d3d3d",
              borderRadius: 0,
            }}
          >
            {files.map((f) => (
              <SelectItem
                key={f}
                value={f}
                className="text-sm text-white"
                style={{ borderRadius: 0 }}
              >
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
