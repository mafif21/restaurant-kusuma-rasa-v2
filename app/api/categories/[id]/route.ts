import { NextResponse } from "next/server";
import { getCategories, saveCategories } from "@/lib/store";
import type { Category } from "@/lib/types";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, context: Params) {
  const { id } = await context.params;
  const body = (await request.json()) as Pick<Category, "name" | "description" | "color">;
  const categories = await getCategories();

  const nextCategories = categories.map((category) =>
    category.id === id ? { ...category, ...body } : category
  );

  await saveCategories(nextCategories);
  return NextResponse.json(nextCategories.find((category) => category.id === id));
}

export async function DELETE(_request: Request, context: Params) {
  const { id } = await context.params;
  const categories = await getCategories();
  const nextCategories = categories.filter((category) => category.id !== id);
  await saveCategories(nextCategories);
  return NextResponse.json({ success: true });
}
