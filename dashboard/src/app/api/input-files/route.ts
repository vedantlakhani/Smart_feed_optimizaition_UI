import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const INPUT_DIR = path.resolve(process.cwd(), "..", "input");

export async function GET() {
  try {
    const files = fs
      .readdirSync(INPUT_DIR)
      .filter((f) => f.endsWith(".json"))
      .sort((a, b) => {
        if (a === "demo_3stream.json") return -1;
        if (b === "demo_3stream.json") return 1;
        return a.localeCompare(b);
      });
    return NextResponse.json({ files });
  } catch {
    return NextResponse.json({ files: [] });
  }
}
