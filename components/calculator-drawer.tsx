"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/date";
import type { Category, MenuItem } from "@/lib/types";

type QuantityMap = Record<string, number>;

type CalculatorDrawerProps = {
  open: boolean;
  menuItems: MenuItem[];
  categories: Category[];
  onClose: () => void;
  onConfirm: () => Promise<void>;
  submitting: boolean;
};

export function CalculatorDrawer({
  open,
  menuItems,
  categories,
  onClose,
  onConfirm,
  submitting
}: CalculatorDrawerProps) {
  const [quantities, setQuantities] = useState<QuantityMap>({});
  const [localSubmitting, setLocalSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuantities({});
      setLocalSubmitting(false);
    }
  }, [open]);

  const groupedMenu = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      items: menuItems.filter((item) => item.categoryId === category.id)
    }));
  }, [categories, menuItems]);

  const total = useMemo(
    () =>
      menuItems.reduce((sum, item) => {
        const quantity = quantities[item.id] ?? 0;
        return sum + item.value * quantity;
      }, 0),
    [menuItems, quantities]
  );
  const totalItems = useMemo(
    () => Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0),
    [quantities]
  );

  async function confirmOrder() {
    const items = Object.entries(quantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([menuItemId, quantity]) => ({ menuItemId, quantity }));

    if (items.length === 0) {
      return;
    }

    setLocalSubmitting(true);

    try {
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items })
      });

      await onConfirm();
      onClose();
    } finally {
      setLocalSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="calculator-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0.12, duration: 0.45 }}
          >
            <div className="drawer-grabber" aria-hidden="true" />
            <div className="drawer-header">
              <div>
                <span className="eyebrow">Calculator</span>
                <h2>Build a new order</h2>
              </div>
              <button type="button" className="ghost-button" onClick={onClose}>
                Close
              </button>
            </div>

            <div className="animated-total">
              <div className="animated-total-meta">
                <span>Live total</span>
                <small>{totalItems} item selected</small>
              </div>
              <motion.strong key={total} initial={{ scale: 0.94 }} animate={{ scale: 1 }}>
                {formatCurrency(total)}
              </motion.strong>
            </div>

            <div className="drawer-body">
              {groupedMenu.map((group) => (
                <section key={group.id} className="menu-group">
                  <div className="menu-group-header">
                    <div className="color-dot" style={{ backgroundColor: group.color }} />
                    <h3>{group.name}</h3>
                  </div>
                  <div className="drawer-card-list">
                    {group.items.map((item) => {
                      const quantity = quantities[item.id] ?? 0;
                      return (
                        <article key={item.id} className="drawer-item-card">
                          <div className="drawer-item-copy">
                            <strong>{item.name}</strong>
                            <p>{formatCurrency(item.value)}</p>
                          </div>
                          <div className="quantity-control">
                            <button
                              type="button"
                              className="icon-button"
                              onClick={() =>
                                setQuantities((current) => ({
                                  ...current,
                                  [item.id]: Math.max(0, (current[item.id] ?? 0) - 1)
                                }))
                              }
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={quantity}
                              onChange={(event) =>
                                setQuantities((current) => ({
                                  ...current,
                                  [item.id]: Number(event.target.value) || 0
                                }))
                              }
                            />
                            <button
                              type="button"
                              className="icon-button"
                              onClick={() =>
                                setQuantities((current) => ({
                                  ...current,
                                  [item.id]: (current[item.id] ?? 0) + 1
                                }))
                              }
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            <div className="drawer-footer">
              <div className="drawer-footer-total">
                <span>Total bayar</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
              <button
                type="button"
                className="primary-button wide-button"
                onClick={confirmOrder}
                disabled={submitting || localSubmitting || totalItems === 0}
              >
                {submitting || localSubmitting ? "Saving..." : "Confirm Order"}
              </button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
