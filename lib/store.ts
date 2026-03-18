import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { getLocalDateString } from "@/lib/date";
import type { Category, DailyRecap, MenuItem, Transaction } from "@/lib/types";

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, "data");
const RECAP_DIR = path.join(ROOT_DIR, "recap");
const CATEGORY_FILE = path.join(DATA_DIR, "categories.json");
const MENU_FILE = path.join(DATA_DIR, "menu.json");
const RESTAURANT_SLUG = "kusuma_rasa";

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "cat-mains",
    name: "Main Course",
    description: "Signature rice plates and house specialties.",
    color: "#f59e0b",
    createdAt: "2026-03-18T12:00:00.000Z"
  },
  {
    id: "cat-drinks",
    name: "Beverages",
    description: "Fresh teas, coffee, and iced drinks.",
    color: "#7c2d12",
    createdAt: "2026-03-18T12:00:00.000Z"
  }
];

const DEFAULT_MENU: MenuItem[] = [
  {
    id: "menu-lele",
    key: "lele",
    name: "Pecel Lele",
    value: 18000,
    categoryId: "cat-mains",
    createdAt: "2026-03-18T12:00:00.000Z"
  },
  {
    id: "menu-ayam",
    key: "ayam",
    name: "Ayam",
    value: 28000,
    categoryId: "cat-mains",
    createdAt: "2026-03-18T12:00:00.000Z"
  },
  {
    id: "menu-dara",
    key: "dara",
    name: "Dara",
    value: 55000,
    categoryId: "cat-mains",
    createdAt: "2026-03-18T12:00:00.000Z"
  },
  {
    id: "menu-bebek-dada",
    key: "bebek-dada",
    name: "Bebek Dada",
    value: 60000,
    categoryId: "cat-mains",
    createdAt: "2026-03-18T12:00:00.000Z"
  },
  {
    id: "menu-bebek-paha",
    key: "bebek-paha",
    name: "Bebek Dada Paha",
    value: 55000,
    categoryId: "cat-mains",
    createdAt: "2026-03-18T12:00:00.000Z"
  },
  {
    id: "menu-udang-cumi",
    key: "udang-cumi",
    name: "Udang / Cumi",
    value: 75000,
    categoryId: "cat-mains",
    createdAt: "2026-03-18T12:00:00.000Z"
  },
  {
    id: "menu-kepiting",
    key: "kepiting",
    name: "Kepiting",
    value: 175000,
    categoryId: "cat-mains",
    createdAt: "2026-03-18T12:00:00.000Z"
  },
  {
    id: "menu-nasi",
    key: "nasi",
    name: "Nasi",
    value: 5000,
    categoryId: "cat-mains",
    createdAt: "2026-03-18T12:00:00.000Z"
  },
  {
    id: "menu-es-teh",
    key: "teh",
    name: "Teh Manis",
    value: 5000,
    categoryId: "cat-drinks",
    createdAt: "2026-03-18T12:00:00.000Z"
  },
  {
    id: "menu-es-jeruk",
    key: "jeruk",
    name: "Jeruk Manis",
    value: 8000,
    categoryId: "cat-drinks",
    createdAt: "2026-03-18T12:00:00.000Z"
  },
  {
    id: "menu-air-mineral",
    key: "air-mineral",
    name: "Air Mineral",
    value: 5000,
    categoryId: "cat-drinks",
    createdAt: "2026-03-18T12:00:00.000Z"
  }
];

async function ensureDir(dirPath: string) {
  await mkdir(dirPath, { recursive: true });
}

async function ensureJsonFile<T>(filePath: string, fallback: T) {
  try {
    await readFile(filePath, "utf-8");
  } catch {
    await ensureDir(path.dirname(filePath));
    await writeFile(filePath, JSON.stringify(fallback, null, 2), "utf-8");
  }
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  await ensureJsonFile(filePath, fallback);
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

async function writeJson<T>(filePath: string, data: T) {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function getCategories() {
  return readJson<Category[]>(CATEGORY_FILE, DEFAULT_CATEGORIES);
}

export async function saveCategories(categories: Category[]) {
  await writeJson(CATEGORY_FILE, categories);
}

export async function getMenuItems() {
  return readJson<MenuItem[]>(MENU_FILE, DEFAULT_MENU);
}

export async function saveMenuItems(menuItems: MenuItem[]) {
  await writeJson(MENU_FILE, menuItems);
}

function recapFilePath(date: string) {
  return path.join(RECAP_DIR, `${date}_${RESTAURANT_SLUG}.json`);
}

export async function getDailyRecap(date = getLocalDateString()) {
  const fallback: DailyRecap = {
    date,
    restaurant: "Kusuma Rasa",
    transactions: [],
    totalRevenue: 0
  };
  return readJson<DailyRecap>(recapFilePath(date), fallback);
}

export async function saveDailyRecap(recap: DailyRecap) {
  await writeJson(recapFilePath(recap.date), recap);
}

export async function appendTransaction(transaction: Transaction, date = getLocalDateString()) {
  const recap = await getDailyRecap(date);
  const transactions = [...recap.transactions, transaction];
  const totalRevenue = transactions.reduce((sum, item) => sum + item.total, 0);
  const nextRecap: DailyRecap = {
    ...recap,
    transactions,
    totalRevenue
  };
  await saveDailyRecap(nextRecap);
  return nextRecap;
}
