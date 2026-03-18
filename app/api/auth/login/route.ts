import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as { username?: string; password?: string };

  if (body.username !== "atun" || body.password !== "123") {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("cms_session", "authenticated", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12
  });

  return response;
}
