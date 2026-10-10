import { NextRequest, NextResponse } from "next/server";
import { getAdminAiQueries } from "@/lib/admin-data";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim();
    const intent = searchParams.get("intent");

    let queries = getAdminAiQueries();

    if (intent && intent !== "ALL") {
      queries = queries.filter((q) => q.intent === intent);
    }

    if (search) {
      queries = queries.filter(
        (q) =>
          q.prompt.toLowerCase().includes(search) ||
          q.destination.toLowerCase().includes(search)
      );
    }

    return NextResponse.json(queries);
  } catch (error) {
    console.error("Admin queries error:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI queries" },
      { status: 500 }
    );
  }
}
