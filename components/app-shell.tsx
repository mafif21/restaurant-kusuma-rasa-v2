"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ListTree, LogOut, ScrollText, UtensilsCrossed } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const navItems: Array<{ href: Route; label: string; icon: typeof LayoutDashboard }> = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/categories", label: "Category", icon: ListTree },
  { href: "/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/transactions", label: "Transaction", icon: ScrollText }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="app-shell">
      <aside className="sidebar glass-panel">
        <div>
          <div className="brand-pill">Kusuma Rasa</div>
          <h2 className="sidebar-title">Dining Room Console</h2>
          <p className="sidebar-copy">Smooth service flow for your floor, kitchen, and cashier.</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                type="button"
                className={`nav-link ${isActive ? "active" : ""}`}
                onClick={() => router.push(item.href)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <button type="button" className="logout-button" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </aside>
      <main className="content-area">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
