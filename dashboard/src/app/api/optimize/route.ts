import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import os from "os";

// Locate python: prefer conda axnano-smartfeed env, fall back to python3
function getPythonPath(): string {
  const homeDir = os.homedir();
  const candidates = [
    path.join(homeDir, "opt", "anaconda3", "envs", "axnano-smartfeed", "bin", "python"),
    path.join(homeDir, "anaconda3", "envs", "axnano-smartfeed", "bin", "python"),
    path.join(homeDir, "miniconda3", "envs", "axnano-smartfeed", "bin", "python"),
    path.join(homeDir, "miniforge3", "envs", "axnano-smartfeed", "bin", "python"),
    "/usr/bin/python3",
    "python3",
  ];
  // Return first existing; spawn will error if none work
  const fs = require("fs");
  for (const p of candidates) {
    try {
      if (p.startsWith("/") && fs.existsSync(p)) return p;
    } catch { /* ignore */ }
  }
  return "python3";
}

const PROJECT_ROOT = path.resolve(process.cwd(), "..");
const RUNNER_SCRIPT = path.join(PROJECT_ROOT, "run_optimization.py");

export async function POST(req: NextRequest) {
  const body = await req.json();

  return new Promise<NextResponse>((resolve) => {
    const pythonPath = getPythonPath();
    const proc = spawn(pythonPath, [RUNNER_SCRIPT], {
      cwd: PROJECT_ROOT,
    });

    let stdout = "";
    let stderr = "";

    proc.stdin.write(JSON.stringify(body));
    proc.stdin.end();

    proc.stdout.on("data", (chunk: Buffer) => { stdout += chunk.toString(); });
    proc.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString(); });

    proc.on("close", (code) => {
      if (code !== 0) {
        resolve(
          NextResponse.json(
            { error: "Optimization failed", detail: stderr },
            { status: 500 }
          )
        );
        return;
      }
      try {
        const result = JSON.parse(stdout);
        resolve(NextResponse.json(result));
      } catch {
        resolve(
          NextResponse.json(
            { error: "Failed to parse optimization output", detail: stdout },
            { status: 500 }
          )
        );
      }
    });

    proc.on("error", (err) => {
      resolve(
        NextResponse.json(
          { error: "Failed to start Python process", detail: err.message },
          { status: 500 }
        )
      );
    });
  });
}
