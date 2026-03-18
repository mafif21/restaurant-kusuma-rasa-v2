"use client";

import { useEffect, useState } from "react";
import { ListTree, ReceiptText, UtensilsCrossed } from "lucide-react";
import { formatCurrency } from "@/lib/date";
import type { Category, DailyRecap, MenuItem } from "@/lib/types";

export function DashboardHome() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [recap, setRecap] = useState<DailyRecap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [categoriesResponse, menuResponse, recapResponse] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/menu"),
        fetch("/api/transactions")
      ]);

      const [categoriesData, menuData, recapData] = await Promise.all([
        categoriesResponse.json(),
        menuResponse.json(),
        recapResponse.json()
      ]);

      setCategories(categoriesData);
      setMenuItems(menuData);
      setRecap(recapData);
      setLoading(false);
    }

    void load();
  }, []);

  const stats = [
    {
      label: "Categories",
      value: categories.length,
      icon: ListTree
    },
    {
      label: "Menu Items",
      value: menuItems.length,
      icon: UtensilsCrossed
    },
    {
      label: "Today's Revenue",
      value: recap ? formatCurrency(recap.totalRevenue) : formatCurrency(0),
      icon: ReceiptText
    }
  ];

  return (
    <section className="page-stack">
      <header className="page-header feature-banner">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1>Service pulse at a glance</h1>
          <p>Track menu structure, order throughput, and today's revenue from one warm-toned hub.</p>
        </div>
      </header>

      <div className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article key={stat.label} className="stat-card glass-panel">
              <div className="stat-icon">
                <Icon size={20} />
              </div>
              <div>
                <p>{stat.label}</p>
                <strong>{loading ? "..." : stat.value}</strong>
              </div>
            </article>
          );
        })}
      </div>

      <section className="content-grid">
        <article className="glass-panel">
          <div className="section-heading">
            <span className="eyebrow">Today</span>
            <h2>Recent transactions</h2>
          </div>
          {loading ? (
            <div className="skeleton-list">
              <div className="skeleton-line" />
              <div className="skeleton-line" />
              <div className="skeleton-line short" />
            </div>
          ) : recap && recap.transactions.length > 0 ? (
            <div className="order-preview-list">
              {recap.transactions.slice(-4).reverse().map((transaction) => (
                <div key={transaction.id} className="order-preview-card">
                  <div>
                    <strong>{transaction.items.map((item) => item.name).join(", ")}</strong>
                    <p>{transaction.items.reduce((sum, item) => sum + item.quantity, 0)} items</p>
                  </div>
                  <span className="status-badge paid">{formatCurrency(transaction.total)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-illustration" />
              <p>No orders yet today. Open the calculator to create the first transaction.</p>
            </div>
          )}
        </article>

        <article className="glass-panel">
          <div className="section-heading">
            <span className="eyebrow">Flow</span>
            <h2>Shift notes</h2>
          </div>
          <ul className="insight-list">
            <li>Hardcoded login protects all CMS routes with cookie-based session checks.</li>
            <li>Categories and menu pricing persist into local JSON files under `data/`.</li>
            <li>Transactions append into dated recap files under `recap/` for later backend migration.</li>
          </ul>
        </article>
      </section>
    </section>
  );
}
