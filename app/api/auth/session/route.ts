import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("cms_session")?.value === "authenticated";
  return NextResponse.json({ isAuthenticated });
}
