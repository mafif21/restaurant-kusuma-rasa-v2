import { NextResponse } from "next/server";
import { getMenuItems, saveMenuItems } from "@/lib/store";
import type { MenuItem } from "@/lib/types";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, context: Params) {
  const { id } = await context.params;
  const body = (await request.json()) as Pick<MenuItem, "key" | "name" | "value" | "categoryId">;
  const menuItems = await getMenuItems();

  const nextMenuItems = menuItems.map((item) =>
    item.id === id ? { ...item, ...body, value: Number(body.value) } : item
  );

  await saveMenuItems(nextMenuItems);
  return NextResponse.json(nextMenuItems.find((item) => item.id === id));
}

export async function DELETE(_request: Request, context: Params) {
  const { id } = await context.params;
  const menuItems = await getMenuItems();
  const nextMenuItems = menuItems.filter((item) => item.id !== id);
  await saveMenuItems(nextMenuItems);
  return NextResponse.json({ success: true });
}
