import { useSyncExternalStore } from "react";

export type Category = { id: string; name: string };
export type Product = {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  description?: string;
  images: string[]; // base64 data URLs
  createdAt: number;
};
export type CartItem = { productId: string; qty: number; size: string };

export const SIZES = ["S", "M", "L", "XL", "XXL"] as const;

const KEY = "beenaz_data_v1";
const CART_KEY = "beenaz_cart_v1";

type Data = { categories: Category[]; products: Product[] };

const seed: Data = {
  categories: [
    { id: "c1", name: "Stitched Suits" },
    { id: "c2", name: "Formal Wear" },
    { id: "c3", name: "Casual Wear" },
    { id: "c4", name: "Bridal Collection" },
  ],
  products: [],
};

const listeners = new Set<() => void>();
const cartListeners = new Set<() => void>();

let dataCache: Data | null = null;
let cartCache: CartItem[] | null = null;

function read(): Data {
  if (dataCache) return dataCache;
  if (typeof window === "undefined") return (dataCache = seed);
  try {
    const raw = localStorage.getItem(KEY);
    dataCache = raw ? JSON.parse(raw) : seed;
  } catch {
    dataCache = seed;
  }
  return dataCache!;
}
function write(d: Data) {
  dataCache = d;
  localStorage.setItem(KEY, JSON.stringify(d));
  listeners.forEach((l) => l());
}
function readCart(): CartItem[] {
  if (cartCache) return cartCache;
  if (typeof window === "undefined") return (cartCache = []);
  try {
    cartCache = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    cartCache = [];
  }
  return cartCache!;
}
function writeCart(c: CartItem[]) {
  cartCache = c;
  localStorage.setItem(CART_KEY, JSON.stringify(c));
  cartListeners.forEach((l) => l());
}

export const store = {
  get: read,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  addCategory(name: string) {
    const d = read();
    write({ ...d, categories: [...d.categories, { id: crypto.randomUUID(), name }] });
  },
  removeCategory(id: string) {
    const d = read();
    write({
      categories: d.categories.filter((c) => c.id !== id),
      products: d.products.filter((p) => p.categoryId !== id),
    });
  },
  addProduct(p: Omit<Product, "id" | "createdAt">) {
    const d = read();
    write({
      ...d,
      products: [{ ...p, id: crypto.randomUUID(), createdAt: Date.now() }, ...d.products],
    });
  },
  removeProduct(id: string) {
    const d = read();
    write({ ...d, products: d.products.filter((p) => p.id !== id) });
  },
  updateProduct(id: string, patch: Partial<Product>) {
    const d = read();
    write({ ...d, products: d.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  },
};

export const cart = {
  get: readCart,
  subscribe(l: () => void) {
    cartListeners.add(l);
    return () => cartListeners.delete(l);
  },
  add(productId: string, size: string) {
    const c = readCart();
    const existing = c.find((i) => i.productId === productId && i.size === size);
    const next = existing
      ? c.map((i) =>
          i.productId === productId && i.size === size ? { ...i, qty: i.qty + 1 } : i,
        )
      : [...c, { productId, qty: 1, size }];
    writeCart(next);
  },
  remove(productId: string, size: string) {
    writeCart(readCart().filter((i) => !(i.productId === productId && i.size === size)));
  },
  setQty(productId: string, size: string, qty: number) {
    if (qty <= 0) return cart.remove(productId, size);
    writeCart(
      readCart().map((i) =>
        i.productId === productId && i.size === size ? { ...i, qty } : i,
      ),
    );
  },
  clear() {
    writeCart([]);
  },
};

export function useStore() {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}
export function useCart() {
  return useSyncExternalStore(cart.subscribe, cart.get, cart.get);
}

export const WHATSAPP_NUMBER = "923086844441";

export function whatsappOrderUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
