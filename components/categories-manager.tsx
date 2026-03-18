"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Category } from "@/lib/types";

const initialForm = { name: "", description: "", color: "#f59e0b" };

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadCategories() {
    setLoading(true);
    const response = await fetch("/api/categories");
    setCategories(await response.json());
    setLoading(false);
  }

  useEffect(() => {
    void loadCategories();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setForm(initialForm);
    setEditingId(null);
    await loadCategories();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    await loadCategories();
  }

  function handleEdit(category: Category) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      description: category.description,
      color: category.color
    });
  }

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Category</span>
          <h1>Organize the dining catalog</h1>
          <p>Group dishes and drinks into visual sections with editable descriptions and color tags.</p>
        </div>
      </header>

      <section className="content-grid">
        <article className="glass-panel">
          <div className="section-heading">
            <span className="eyebrow">Editor</span>
            <h2>{editingId ? "Update category" : "Create category"}</h2>
          </div>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="field">
              <span>Name</span>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </label>
            <label className="field">
              <span>Description</span>
              <textarea
                rows={4}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                required
              />
            </label>
            <label className="field">
              <span>Accent color</span>
              <input
                type="color"
                value={form.color}
                onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))}
              />
            </label>
            <div className="button-row">
              <button type="submit" className="primary-button">
                {editingId ? "Save Changes" : "Add Category"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(initialForm);
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
            <span className="eyebrow">Library</span>
            <h2>Current categories</h2>
          </div>
          {loading ? (
            <div className="skeleton-list">
              <div className="skeleton-line" />
              <div className="skeleton-line" />
              <div className="skeleton-line short" />
            </div>
          ) : categories.length === 0 ? (
            <div className="empty-state">
              <div className="empty-illustration" />
              <p>No categories yet. Add one to start organizing the menu.</p>
            </div>
          ) : (
            <div className="card-list">
              {categories.map((category, index) => (
                <motion.article
                  key={category.id}
                  className="record-card"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <div className="record-card-row">
                    <div className="color-dot" style={{ backgroundColor: category.color }} />
                    <div>
                      <h3>{category.name}</h3>
                      <p>{category.description}</p>
                    </div>
                  </div>
                  <div className="button-row">
                    <button type="button" className="secondary-button" onClick={() => handleEdit(category)}>
                      Edit
                    </button>
                    <button type="button" className="ghost-button" onClick={() => handleDelete(category.id)}>
                      Delete
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </article>
      </section>
    </section>
  );
}
