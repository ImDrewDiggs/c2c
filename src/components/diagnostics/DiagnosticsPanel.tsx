import React, { useEffect, useState, useCallback } from "react";
import { Bug, X, Trash2, AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type Severity = "error" | "warning" | "info";
type Category = "module" | "auth" | "network" | "runtime";

interface DiagnosticEntry {
  id: string;
  ts: number;
  severity: Severity;
  category: Category;
  title: string;
  message: string;
  guidance: string;
  source?: string;
}

const MAX_ENTRIES = 50;
const STORAGE_KEY = "c2c-diagnostics-open";

// ---- Classification ---------------------------------------------------------
function classify(message: string, source?: string): {
  category: Category;
  title: string;
  guidance: string;
  severity: Severity;
} {
  const m = (message || "").toLowerCase();
  const s = (source || "").toLowerCase();

  if (
    m.includes("importing a module script failed") ||
    m.includes("failed to fetch dynamically imported module") ||
    m.includes("error loading dynamically imported")
  ) {
    return {
      category: "module",
      severity: "warning",
      title: "Module script failed to load",
      guidance:
        "This is usually caused by a stale browser cache after a new deploy, or by the Lovable preview's fetch proxy interfering with chunk loading. Try a hard refresh (Ctrl/Cmd+Shift+R). If it persists in the preview only, test on the published URL (c2c.lovable.app).",
    };
  }

  if (
    s.includes("/auth/v1/") ||
    m.includes("invalid login") ||
    m.includes("invalid credentials") ||
    m.includes("email not confirmed") ||
    m.includes("auth session missing") ||
    m.includes("refresh token") ||
    m.includes("jwt expired")
  ) {
    let guidance =
      "Check that you're signed in and your session is valid. If it expired, sign in again.";
    if (m.includes("invalid login") || m.includes("invalid credentials")) {
      guidance = "The email or password is incorrect. Double-check both, or reset your password.";
    } else if (m.includes("email not confirmed")) {
      guidance = "Check your inbox and confirm your email before signing in.";
    } else if (m.includes("refresh token") || m.includes("jwt expired")) {
      guidance = "Your session expired. Please sign in again to continue.";
    }
    return {
      category: "auth",
      severity: "error",
      title: "Authentication issue",
      guidance,
    };
  }

  if (m.includes("failed to fetch") || m.includes("networkerror") || m.includes("load failed")) {
    return {
      category: "network",
      severity: "warning",
      title: "Network request failed",
      guidance:
        "Check your internet connection. If you're on the preview URL, the Lovable preview proxy can occasionally block requests — try the published URL.",
    };
  }

  return {
    category: "runtime",
    severity: "error",
    title: "Runtime error",
    guidance:
      "An unexpected error occurred. If this keeps happening, copy the message below and share it so we can investigate.",
  };
}

// ---- Global capture bus ----------------------------------------------------
type Listener = (e: DiagnosticEntry) => void;
const listeners = new Set<Listener>();
const buffer: DiagnosticEntry[] = [];
let initialized = false;

function emit(entry: DiagnosticEntry) {
  buffer.unshift(entry);
  if (buffer.length > MAX_ENTRIES) buffer.length = MAX_ENTRIES;
  listeners.forEach((l) => {
    try {
      l(entry);
    } catch {
      /* noop */
    }
  });
  // Best-effort persist to Supabase for admin review. RLS blocks reads for
  // non-admins, so this is write-only from the client perspective.
  void persistEntry(entry);
}

async function persistEntry(entry: DiagnosticEntry) {
  try {
    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes?.user?.id ?? null;
    const sevMap: Record<Severity, "info" | "warning" | "error" | "critical"> = {
      info: "info",
      warning: "warning",
      error: "error",
    };
    await (supabase.from as any)("diagnostics_logs").insert({
      user_id: userId,
      category: entry.category,
      severity: sevMap[entry.severity] ?? "error",
      title: entry.title,
      message: entry.message.slice(0, 4000),
      source: entry.source?.slice(0, 2000) ?? null,
      guidance: entry.guidance,
      url: typeof window !== "undefined" ? window.location.href : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      metadata: {},
    });
  } catch {
    /* swallow — never let diagnostics persistence cause more errors */
  }
}

/** Programmatic API for the rest of the app to log diagnostic events. */
export function reportDiagnostic(input: {
  message: string;
  source?: string;
  category?: Category;
  severity?: Severity;
  title?: string;
  guidance?: string;
}) {
  const c = classify(input.message, input.source);
  emit({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ts: Date.now(),
    severity: input.severity ?? c.severity,
    category: input.category ?? c.category,
    title: input.title ?? c.title,
    message: input.message,
    guidance: input.guidance ?? c.guidance,
    source: input.source,
  });
}

function initGlobalCapture() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  window.addEventListener("error", (ev) => {
    const msg = ev?.message || (ev?.error && ev.error.message) || "Unknown error";
    const src = ev?.filename || (ev?.error && ev.error.stack) || undefined;
    reportDiagnostic({ message: String(msg), source: src });
  });

  window.addEventListener("unhandledrejection", (ev: PromiseRejectionEvent) => {
    const reason: any = ev?.reason;
    const msg =
      (reason && (reason.message || reason.error_description || reason.msg)) ||
      (typeof reason === "string" ? reason : "Unhandled promise rejection");
    const src = reason?.url || reason?.stack || undefined;
    reportDiagnostic({ message: String(msg), source: src });
  });
}

// ---- UI ---------------------------------------------------------------------
const SEVERITY_ICON: Record<Severity, React.ComponentType<{ className?: string }>> = {
  error: ShieldAlert,
  warning: AlertTriangle,
  info: Info,
};

const SEVERITY_TONE: Record<Severity, string> = {
  error: "text-destructive border-destructive/40 bg-destructive/10",
  warning: "text-amber-500 border-amber-500/40 bg-amber-500/10",
  info: "text-primary border-primary/40 bg-primary/10",
};

export function DiagnosticsPanel() {
  const { isAdmin, isSuperAdmin } = useAuth();
  const [entries, setEntries] = useState<DiagnosticEntry[]>(buffer);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    initGlobalCapture();

    // Restore last open state + diagnostic mode (admin only)
    if (!isAdmin && !isSuperAdmin) return;

    try {
      const url = new URL(window.location.href);
      const fromQuery = url.searchParams.get("debug") === "1";
      const fromStorage = localStorage.getItem(STORAGE_KEY) === "1";
      if (fromQuery || fromStorage) setOpen(true);
    } catch {
      /* noop */
    }

    const listener: Listener = (e) => {
      setEntries([...buffer]);
      setUnread((u) => (open ? 0 : u + 1));
      void e;
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, [open, isAdmin, isSuperAdmin]);

  useEffect(() => {
    if (!isAdmin && !isSuperAdmin) return;
    try {
      localStorage.setItem(STORAGE_KEY, open ? "1" : "0");
    } catch {
      /* noop */
    }
    if (open) setUnread(0);
  }, [open, isAdmin, isSuperAdmin]);

  const clear = useCallback(() => {
    buffer.length = 0;
    setEntries([]);
    setUnread(0);
  }, []);

  if (!isAdmin && !isSuperAdmin) return null;

  return (
    <>
      {/* Floating toggle */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle diagnostics panel"
        className="fixed bottom-4 right-4 z-[60] flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition hover:bg-accent"
      >
        <Bug className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Diagnostics panel"
          className="fixed bottom-20 right-4 z-[60] flex max-h-[70vh] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-2xl"
        >
          <header className="flex items-center justify-between border-b border-border px-3 py-2">
            <div className="flex items-center gap-2">
              <Bug className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Diagnostics</span>
              <Badge variant="secondary" className="text-[10px]">
                {entries.length}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" onClick={clear} aria-label="Clear diagnostics">
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setOpen(false)} aria-label="Close diagnostics">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-3 py-2">
            {entries.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No issues captured. Auth and module-loading errors will appear here automatically.
              </p>
            ) : (
              <ul className="space-y-2">
                {entries.map((e) => {
                  const Icon = SEVERITY_ICON[e.severity];
                  return (
                    <li
                      key={e.id}
                      className={`rounded-md border p-2 text-xs ${SEVERITY_TONE[e.severity]}`}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate font-medium text-foreground">{e.title}</p>
                            <span className="shrink-0 text-[10px] text-muted-foreground">
                              {new Date(e.ts).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="mt-1 break-words text-muted-foreground">{e.message}</p>
                          <p className="mt-1 text-foreground/90">{e.guidance}</p>
                          {e.source && (
                            <p className="mt-1 truncate text-[10px] text-muted-foreground" title={e.source}>
                              {e.source}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <footer className="border-t border-border px-3 py-2 text-[10px] text-muted-foreground">
            Press the bug icon to hide. Add <code>?debug=1</code> to any URL to auto-open.
          </footer>
        </div>
      )}
    </>
  );
}

export default DiagnosticsPanel;