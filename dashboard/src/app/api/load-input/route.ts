import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const INPUT_DIR = path.resolve(process.cwd(), "..", "input");

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get("file");

  if (!file || !file.endsWith(".json")) {
    return NextResponse.json({ error: "Invalid file parameter" }, { status: 400 });
  }

  // Prevent directory traversal
  const safeName = path.basename(file);
  const filePath = path.join(INPUT_DIR, safeName);

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return NextResponse.json(JSON.parse(content));
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
