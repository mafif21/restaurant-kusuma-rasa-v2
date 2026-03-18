import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-hero">
        <div className="brand-pill">Kusuma Rasa</div>
        <h1>Warm service, sharp operations.</h1>
        <p>
          Manage categories, menu pricing, and daily orders from one polished control room.
        </p>
        <div className="hero-orbs" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>
      <LoginForm />
    </main>
  );
}
