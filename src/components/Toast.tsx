"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Toast = { id: number; message: string; tone: "success" | "error" | "info" };

type ToastContextValue = {
  push: (message: string, tone?: Toast["tone"]) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-6 left-1/2 z-[90] flex w-[min(92vw,420px)] -translate-x-1/2 flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            data-testid="toast"
            className={`pointer-events-auto rounded-2xl border px-5 py-3 text-sm shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl ${
              toast.tone === "success"
                ? "border-gold/50 bg-gold/15 text-gold-light"
                : toast.tone === "error"
                  ? "border-red-400/40 bg-red-500/15 text-red-200"
                  : "border-white/20 bg-white/10 text-white"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}

/** Small hook for a "loading" button label. */
export function usePending() {
  const [pending, setPending] = useState(false);
  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => setPending(false), 15000);
    return () => window.clearTimeout(timer);
  }, [pending]);
  return { pending, setPending };
}
