"use client";

import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import { CalculatorDrawer } from "@/components/calculator-drawer";
import { formatCurrency, formatDateTime } from "@/lib/date";
import {
  appendTransactionInBrowser,
  getCategoriesFromBrowser,
  getDailyRecapFromBrowser,
  getMenuItemsFromBrowser
} from "@/lib/browser-store";
import type { Category, DailyRecap, MenuItem } from "@/lib/types";

export function TransactionsManager() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recap, setRecap] = useState<DailyRecap | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    setLoading(true);
    const menuData = getMenuItemsFromBrowser();
    const categoriesData = getCategoriesFromBrowser();
    const recapData = getDailyRecapFromBrowser();

    setMenuItems(menuData);
    setCategories(categoriesData);
    setRecap(recapData);
    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleConfirmOrder(items: Array<{ menuItemId: string; quantity: number }>) {
    setSubmitting(true);
    appendTransactionInBrowser(items);
    await loadData();
    setSubmitting(false);
  }

  function downloadPdf() {
    if (!recap) {
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Kusuma Rasa Daily Recap", 14, 18);
    doc.setFontSize(11);
    doc.text(`Date: ${recap.date}`, 14, 26);
    doc.text(`Revenue: ${formatCurrency(recap.totalRevenue)}`, 14, 33);

    let y = 45;
    recap.transactions.forEach((transaction, index) => {
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${formatDateTime(transaction.createdAt)}`, 14, y);
      y += 6;
      transaction.items.forEach((item) => {
        doc.setFontSize(10);
        doc.text(
          `${item.name} x${item.quantity} - ${formatCurrency(item.subtotal)}`,
          18,
          y
        );
        y += 5;
      });
      doc.text(`Total: ${formatCurrency(transaction.total)}`, 18, y);
      y += 9;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`${recap.date}_kusuma_rasa.pdf`);
  }

  return (
    <section className="page-stack">
      <header className="page-header feature-banner">
        <div>
          <span className="eyebrow">Transaction</span>
          <h1>Run live orders and recap the shift</h1>
          <p>Open the calculator, confirm new orders, and export today's recap as a PDF.</p>
        </div>
        <div className="button-row">
          <button type="button" className="secondary-button" onClick={downloadPdf}>
            Download PDF
          </button>
          <button type="button" className="primary-button" onClick={() => setDrawerOpen(true)}>
            Open Calculator
          </button>
        </div>
      </header>

      <div className="stats-grid">
        <article className="stat-card glass-panel">
          <p>Today's orders</p>
          <strong>{loading || !recap ? "..." : recap.transactions.length}</strong>
        </article>
        <article className="stat-card glass-panel">
          <p>Total revenue</p>
          <strong>{loading || !recap ? "..." : formatCurrency(recap.totalRevenue)}</strong>
        </article>
      </div>

      <article className="glass-panel">
        <div className="section-heading">
          <span className="eyebrow">Recap</span>
          <h2>Today's transactions</h2>
        </div>
        {loading ? (
          <div className="skeleton-list">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
          </div>
        ) : recap && recap.transactions.length > 0 ? (
          <div className="card-list">
            {recap.transactions
              .slice()
              .reverse()
              .map((transaction) => (
                <article key={transaction.id} className="record-card">
                  <div className="record-card-row">
                    <div>
                      <h3>{formatDateTime(transaction.createdAt)}</h3>
                      <p>{transaction.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}</p>
                    </div>
                    <span className="status-badge paid">{transaction.status}</span>
                  </div>
                  <div className="order-line-list">
                    {transaction.items.map((item) => (
                      <div key={`${transaction.id}-${item.menuItemId}`} className="order-line-row">
                        <span>{item.name}</span>
                        <span>{formatCurrency(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="record-card-row">
                    <strong>Total</strong>
                    <strong>{formatCurrency(transaction.total)}</strong>
                  </div>
                </article>
              ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-illustration" />
            <p>No transactions recorded for today. Create one with the calculator.</p>
          </div>
        )}
      </article>

      <CalculatorDrawer
        open={drawerOpen}
        menuItems={menuItems}
        categories={categories}
        onClose={() => setDrawerOpen(false)}
        onConfirmOrder={handleConfirmOrder}
        submitting={submitting}
      />
    </section>
  );
}
