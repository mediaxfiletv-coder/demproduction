"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  key: string;
  productId: number;
  variantId: number;
  productName: string;
  sizeLabel: string;
  frameLabel: string;
  frameType: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
  uploadedImageUrl: string;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "key">, quantity?: number) => void;
  remove: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  hydrated: boolean;
};

const STORAGE_KEY = "dem_cart_v1";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) {
          setItems(parsed.filter((item) => item && item.variantId && item.unitPrice > 0));
        }
      }
    } catch {
      /* ignore corrupted cart */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items, hydrated]);

  const add = useCallback((item: Omit<CartItem, "key">, quantity = 1) => {
    setItems((current) => {
      const key = `${item.variantId}:${item.uploadedImageUrl || "stock"}`;
      const existing = current.find((row) => row.key === key);
      if (existing) {
        return current.map((row) =>
          row.key === key
            ? { ...row, quantity: Math.min(50, row.quantity + quantity) }
            : row,
        );
      }
      return [...current, { ...item, key, quantity: Math.min(50, quantity) }];
    });
  }, []);

  const remove = useCallback((key: string) => {
    setItems((current) => current.filter((row) => row.key !== key));
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((row) => row.key !== key)
        : current.map((row) =>
            row.key === key ? { ...row, quantity: Math.min(50, quantity) } : row,
          ),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    return { items, count, subtotal, add, remove, setQuantity, clear, hydrated };
  }, [items, add, remove, setQuantity, clear, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
