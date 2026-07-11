import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Use POST via /newsletter/unsubscribe" },
    { status: 405 },
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "Use /newsletter/unsubscribe" },
    { status: 405 },
  );
}
