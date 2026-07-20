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
export type CartItem = { productId: string; qty: number };

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

function read(): Data {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed;
    return JSON.parse(raw);
  } catch {
    return seed;
  }
}
function write(d: Data) {
  localStorage.setItem(KEY, JSON.stringify(d));
  listeners.forEach((l) => l());
}
function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeCart(c: CartItem[]) {
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
    d.categories.push({ id: crypto.randomUUID(), name });
    write(d);
  },
  removeCategory(id: string) {
    const d = read();
    d.categories = d.categories.filter((c) => c.id !== id);
    d.products = d.products.filter((p) => p.categoryId !== id);
    write(d);
  },
  addProduct(p: Omit<Product, "id" | "createdAt">) {
    const d = read();
    d.products.unshift({ ...p, id: crypto.randomUUID(), createdAt: Date.now() });
    write(d);
  },
  removeProduct(id: string) {
    const d = read();
    d.products = d.products.filter((p) => p.id !== id);
    write(d);
  },
  updateProduct(id: string, patch: Partial<Product>) {
    const d = read();
    d.products = d.products.map((p) => (p.id === id ? { ...p, ...patch } : p));
    write(d);
  },
};

export const cart = {
  get: readCart,
  subscribe(l: () => void) {
    cartListeners.add(l);
    return () => cartListeners.delete(l);
  },
  add(productId: string) {
    const c = readCart();
    const existing = c.find((i) => i.productId === productId);
    if (existing) existing.qty += 1;
    else c.push({ productId, qty: 1 });
    writeCart(c);
  },
  remove(productId: string) {
    writeCart(readCart().filter((i) => i.productId !== productId));
  },
  setQty(productId: string, qty: number) {
    if (qty <= 0) return cart.remove(productId);
    writeCart(readCart().map((i) => (i.productId === productId ? { ...i, qty } : i)));
  },
  clear() {
    writeCart([]);
  },
};

export function useStore() {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}
export function useCart() {
  return useSyncExternalStore(cart.subscribe, cart.get, () => []);
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
