import { NextResponse } from "next/server";
import { getAdminMetricsSummary } from "@/lib/admin-data";

export async function GET() {
  try {
    const summary = getAdminMetricsSummary();
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Admin overview error:", error);
    return NextResponse.json(
      { error: "Failed to load admin overview metrics" },
      { status: 500 }
    );
  }
}
