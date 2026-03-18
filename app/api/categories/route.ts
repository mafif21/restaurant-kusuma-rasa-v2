import { NextResponse } from "next/server";
import { getCategories, saveCategories } from "@/lib/store";
import type { Category } from "@/lib/types";

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Pick<Category, "name" | "description" | "color">;
  const categories = await getCategories();

  const category: Category = {
    id: crypto.randomUUID(),
    name: body.name,
    description: body.description,
    color: body.color,
    createdAt: new Date().toISOString()
  };

  const nextCategories = [...categories, category];
  await saveCategories(nextCategories);

  return NextResponse.json(category, { status: 201 });
}
