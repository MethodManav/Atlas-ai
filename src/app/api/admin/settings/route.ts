import { NextRequest, NextResponse } from "next/server";
import {
  getAdminSettings,
  updateAdminSettings,
  clearAllAdminData,
} from "@/lib/admin-data";

export async function GET() {
  try {
    const settings = getAdminSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Admin settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = updateAdminSettings(body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

// POST is used to clear data
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body.action === "clear-data" || body.action === "reset-defaults") {
      const state = clearAllAdminData();
      return NextResponse.json({
        success: true,
        message: "All admin data cleared successfully",
        data: state,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Settings action error:", error);
    return NextResponse.json(
      { error: "Failed to execute settings action" },
      { status: 500 }
    );
  }
}
