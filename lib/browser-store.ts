"use client";

import seedCategories from "@/data/categories.json";
import seedMenuItems from "@/data/menu.json";
import { getLocalDateString } from "@/lib/date";
import type { Category, DailyRecap, MenuItem, OrderLine, Transaction } from "@/lib/types";

const CATEGORIES_KEY = "kusuma-rasa:categories";
const MENU_KEY = "kusuma-rasa:menu";
const RECAP_PREFIX = "kusuma-rasa:recap:";

function hasWindow() {
  return typeof window !== "undefined";
}

function readStorage<T>(key: string, fallback: T): T {
  if (!hasWindow()) {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getCategoriesFromBrowser() {
  return readStorage<Category[]>(CATEGORIES_KEY, seedCategories as Category[]);
}

export function saveCategoriesToBrowser(categories: Category[]) {
  writeStorage(CATEGORIES_KEY, categories);
}

export function getMenuItemsFromBrowser() {
  return readStorage<MenuItem[]>(MENU_KEY, seedMenuItems as MenuItem[]);
}

export function saveMenuItemsToBrowser(menuItems: MenuItem[]) {
  writeStorage(MENU_KEY, menuItems);
}

export function getDailyRecapFromBrowser(date = getLocalDateString()) {
  const fallback: DailyRecap = {
    date,
    restaurant: "Kusuma Rasa",
    transactions: [],
    totalRevenue: 0
  };

  return readStorage<DailyRecap>(`${RECAP_PREFIX}${date}`, fallback);
}

export function saveDailyRecapToBrowser(recap: DailyRecap) {
  writeStorage(`${RECAP_PREFIX}${recap.date}`, recap);
}

export function appendTransactionInBrowser(
  items: Array<{ menuItemId: string; quantity: number }>,
  date = getLocalDateString()
) {
  const menuItems = getMenuItemsFromBrowser();
  const orderLines: OrderLine[] = items
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

  const transaction: Transaction = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "paid",
    total: orderLines.reduce((sum, item) => sum + item.subtotal, 0),
    items: orderLines
  };

  const recap = getDailyRecapFromBrowser(date);
  const transactions = [...recap.transactions, transaction];
  const nextRecap: DailyRecap = {
    ...recap,
    transactions,
    totalRevenue: transactions.reduce((sum, entry) => sum + entry.total, 0)
  };

  saveDailyRecapToBrowser(nextRecap);
  return nextRecap;
}
