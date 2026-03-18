"use client";

import { useEffect, useState } from "react";
import type { Category, MenuItem } from "@/lib/types";
import { formatCurrency } from "@/lib/date";

const initialForm = { key: "", name: "", value: 0, categoryId: "" };

export function MenuManager() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const [menuResponse, categoriesResponse] = await Promise.all([
      fetch("/api/menu"),
      fetch("/api/categories")
    ]);
    const [menuData, categoriesData] = await Promise.all([
      menuResponse.json(),
      categoriesResponse.json()
    ]);

    setMenuItems(menuData);
    setCategories(categoriesData);
    setForm((current) => ({
      ...current,
      categoryId: current.categoryId || categoriesData[0]?.id || ""
    }));
    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const url = editingId ? `/api/menu/${editingId}` : "/api/menu";
    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, value: Number(form.value) })
    });

    setEditingId(null);
    setForm({ ...initialForm, categoryId: categories[0]?.id || "" });
    await loadData();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/menu/${id}`, { method: "DELETE" });
    await loadData();
  }

  function handleEdit(item: MenuItem) {
    setEditingId(item.id);
    setForm({
      key: item.key,
      name: item.name,
      value: item.value,
      categoryId: item.categoryId
    });
  }

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Menu</span>
          <h1>Adjust dishes and pricing</h1>
          <p>Manage the visible catalog for the cashier and calculator flow with category-linked pricing.</p>
        </div>
      </header>

      <section className="content-grid">
        <article className="glass-panel">
          <div className="section-heading">
            <span className="eyebrow">Editor</span>
            <h2>{editingId ? "Update menu item" : "Create menu item"}</h2>
          </div>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="field">
              <span>Key</span>
              <input
                value={form.key}
                onChange={(event) => setForm((current) => ({ ...current, key: event.target.value }))}
                required
              />
            </label>
            <label className="field">
              <span>Name</span>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </label>
            <label className="field">
              <span>Price</span>
              <input
                type="number"
                min="0"
                value={form.value}
                onChange={(event) =>
                  setForm((current) => ({ ...current, value: Number(event.target.value) }))
                }
                required
              />
            </label>
            <label className="field">
              <span>Category</span>
              <select
                value={form.categoryId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, categoryId: event.target.value }))
                }
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="button-row">
              <button type="submit" className="primary-button">
                {editingId ? "Save Changes" : "Add Menu Item"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ ...initialForm, categoryId: categories[0]?.id || "" });
                  }}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </article>

        <article className="glass-panel">
          <div className="section-heading">
            <span className="eyebrow">Catalog</span>
            <h2>Current menu</h2>
          </div>
          {loading ? (
            <div className="skeleton-list">
              <div className="skeleton-line" />
              <div className="skeleton-line" />
              <div className="skeleton-line short" />
            </div>
          ) : menuItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-illustration" />
              <p>No menu items yet. Add dishes to unlock the calculator flow.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Key</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.key}</td>
                      <td>{categories.find((category) => category.id === item.categoryId)?.name ?? "-"}</td>
                      <td>{formatCurrency(item.value)}</td>
                      <td className="table-actions">
                        <button type="button" className="secondary-button" onClick={() => handleEdit(item)}>
                          Edit
                        </button>
                        <button type="button" className="ghost-button" onClick={() => handleDelete(item.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>
    </section>
  );
}
