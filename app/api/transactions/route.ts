import { NextResponse } from "next/server";
import { appendTransaction, getDailyRecap, getMenuItems } from "@/lib/store";
import { getLocalDateString } from "@/lib/date";
import type { OrderLine, Transaction } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? getLocalDateString();
  const recap = await getDailyRecap(date);
  return NextResponse.json(recap);
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    items: Array<{ menuItemId: string; quantity: number }>;
  };

  const menuItems = await getMenuItems();
  const orderLines: OrderLine[] = body.items
    .filter((item) => item.quantity > 0)
    .map((item) => {
      const menuItem = menuItems.find((entry) => entry.id === item.menuItemId);
      if (!menuItem) {
        throw new Error(`Menu item not found: ${item.menuItemId}`);
      }

      return {
        menuItemId: menuItem.id,
        name: menuItem.name,
        quantity: item.quantity,
        price: menuItem.value,
        subtotal: menuItem.value * item.quantity
      };
    });

  const total = orderLines.reduce((sum, item) => sum + item.subtotal, 0);
  const transaction: Transaction = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "paid",
    total,
    items: orderLines
  };

  const recap = await appendTransaction(transaction);
  return NextResponse.json(recap, { status: 201 });
}
