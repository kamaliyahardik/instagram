import { NextResponse } from "next/server";
import { platformStatus } from "@/lib/resolver/manager";

export async function GET() {
  return NextResponse.json({ success: true, platforms: platformStatus });
}
