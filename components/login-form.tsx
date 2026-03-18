"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { motion } from "framer-motion";

const allowedRoutes: Route[] = ["/dashboard", "/categories", "/menu", "/transactions"];

export function LoginForm() {
  const [username, setUsername] = useState("atun");
  const [password, setPassword] = useState("123");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        setError("Use username atun and password 123.");
        return;
      }

      const nextPath = searchParams.get("next");
      const targetRoute = allowedRoutes.find((route) => route === nextPath) ?? "/dashboard";
      router.push(targetRoute);
      router.refresh();
    });
  }

  return (
    <motion.section
      className="login-card glass-panel"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="section-heading">
        <span className="eyebrow">Staff Login</span>
        <h2>Open the front-of-house panel</h2>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="field">
          <span>Username</span>
          <input value={username} onChange={(event) => setUsername(event.target.value)} />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" className="primary-button" disabled={isPending}>
          {isPending ? "Signing in..." : "Login"}
        </button>
      </form>
      <div className="login-hint">
        <span>Demo credentials</span>
        <strong>atun / 123</strong>
      </div>
    </motion.section>
  );
}
