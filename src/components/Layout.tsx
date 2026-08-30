import { useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { ArrowRight, Menu, Shield, X } from "lucide-react";
import { OfflineStatusBadge } from "./OfflineStatusBadge";
import { ThemeToggle } from "./ThemeToggle";
import { Sparkle3DBackground } from "./Sparkle3DBackground";

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About", end: false },
  { to: "/architecture", label: "Architecture", end: false },
  { to: "/dashboard", label: "Live Demo", end: false },
];

export function Layout({ children }: { children: ReactNode }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="sentinel-app min-h-screen bg-grid" style={{ backgroundColor: "var(--color-base)" }}>
      <Sparkle3DBackground />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[var(--color-accent)] focus:px-4 focus:py-2 focus:text-[var(--color-base)]"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b backdrop-blur-sm" style={{ borderColor: "var(--color-border)", backgroundColor: "color-mix(in srgb, var(--color-base) 88%, transparent)" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3" onClick={() => setIsMobileNavOpen(false)}>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-md"
              style={{ backgroundColor: "color-mix(in srgb, var(--color-accent) 16%, transparent)" }}
            >
              <Shield size={16} style={{ color: "var(--color-accent)" }} />
            </div>
            <div>
              <div className="text-base font-semibold tracking-tight text-[var(--color-text-primary)]">ShieldNet</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Shieldnet · NTRO</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setIsMobileNavOpen(false)}
                className={({ isActive }) =>
                  `nav-glow rounded-md px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "active text-[var(--color-accent)]"
                      : "text-[var(--color-text-secondary)]"
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? "color-mix(in srgb, var(--color-accent) 12%, transparent)" : "transparent",
                })}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <OfflineStatusBadge />
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-base)] transition-opacity hover:opacity-90 shadow-sm"
            >
              Try Live Demo
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              aria-label="Toggle navigation menu"
              className="inline-flex items-center justify-center rounded-md border p-2 glow-box"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
            >
              {isMobileNavOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {isMobileNavOpen && (
          <div className="border-t px-4 py-3 md:hidden" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={({ isActive }) =>
                    `nav-glow rounded-md px-3 py-2 text-sm font-medium ${
                      isActive
                        ? "active text-[var(--color-accent)]"
                        : "text-[var(--color-text-secondary)]"
                    }`
                  }
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? "color-mix(in srgb, var(--color-accent) 12%, transparent)" : "transparent",
                  })}
                >
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3" style={{ borderColor: "var(--color-border)" }}>
              <OfflineStatusBadge />
              <Link
                to="/dashboard"
                onClick={() => setIsMobileNavOpen(false)}
                className="inline-flex items-center gap-2 rounded-md bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-[var(--color-base)]"
              >
                Try Live Demo
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </header>

      <main id="main-content" className="relative z-10 mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="relative z-10 border-t" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-base font-semibold text-[var(--color-text-primary)]">Forecasting attacks before they complete.</div>
              <div className="mt-1 text-sm text-[var(--color-text-secondary)]">ShieldNet helps defenders see the next state of the network before compromise.</div>
            </div>
            <div className="inline-flex w-fit items-center rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-secondary)]" style={{ borderColor: "var(--color-border)" }}>
              ShieldNet · NTRO · Blockchain &amp; Cybersecurity
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t pt-4 text-sm md:flex-row md:items-center md:justify-between" style={{ borderColor: "var(--color-border)" }}>
            <div className="font-mono text-xs text-[var(--color-text-muted)]">
              Offline Neural World Model Architecture (Constraint C4 Compliant)
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[var(--color-text-muted)]">
              <NavLink to="/" className="hover:text-[var(--color-text-primary)]">Home</NavLink>
              <NavLink to="/about" className="hover:text-[var(--color-text-primary)]">About</NavLink>
              <NavLink to="/architecture" className="hover:text-[var(--color-text-primary)]">Architecture</NavLink>
              <NavLink to="/dashboard" className="hover:text-[var(--color-text-primary)]">Live Demo</NavLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

