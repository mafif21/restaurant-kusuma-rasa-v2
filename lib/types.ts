export type Category = {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
};

export type MenuItem = {
  id: string;
  key: string;
  name: string;
  value: number;
  categoryId: string;
  createdAt: string;
};

export type OrderLine = {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
};

export type TransactionStatus = "paid" | "queued";

export type Transaction = {
  id: string;
  createdAt: string;
  status: TransactionStatus;
  total: number;
  items: OrderLine[];
};

export type DailyRecap = {
  date: string;
  restaurant: string;
  transactions: Transaction[];
  totalRevenue: number;
};
