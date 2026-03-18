import { NextResponse } from "next/server";
import { getMenuItems, saveMenuItems } from "@/lib/store";
import type { MenuItem } from "@/lib/types";

export async function GET() {
  const menuItems = await getMenuItems();
  return NextResponse.json(menuItems);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Pick<MenuItem, "key" | "name" | "value" | "categoryId">;
  const menuItems = await getMenuItems();

  const menuItem: MenuItem = {
    id: crypto.randomUUID(),
    key: body.key,
    name: body.name,
    value: Number(body.value),
    categoryId: body.categoryId,
    createdAt: new Date().toISOString()
  };

  const nextMenuItems = [...menuItems, menuItem];
  await saveMenuItems(nextMenuItems);

  return NextResponse.json(menuItem, { status: 201 });
}
