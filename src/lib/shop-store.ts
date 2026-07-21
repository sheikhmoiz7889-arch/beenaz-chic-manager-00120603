import { useEffect, useState, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Category = { id: string; name: string };
export type Product = {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  description?: string;
  images: string[];
  createdAt: number;
};
export type CartItem = { productId: string; qty: number; size: string };

export const SIZES = ["S", "M", "L", "XL", "XXL"] as const;

const CART_KEY = "beenaz_cart_v1";

type Data = { categories: Category[]; products: Product[] };

let dataCache: Data = { categories: [], products: [] };
let cartCache: CartItem[] | null = null;
let initialized = false;

const listeners = new Set<() => void>();
const cartListeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

type CategoryRow = { id: string; name: string };
type ProductRow = {
  id: string;
  name: string;
  price: number | string;
  category_id: string | null;
  description: string | null;
  images: string[] | null;
  created_at: string;
};

function mapProduct(r: ProductRow): Product {
  return {
    id: r.id,
    name: r.name,
    price: Number(r.price),
    categoryId: r.category_id ?? "",
    description: r.description ?? "",
    images: r.images ?? [],
    createdAt: new Date(r.created_at).getTime(),
  };
}

async function initialLoad() {
  const [cats, prods] = await Promise.all([
    supabase.from("categories").select("id,name").order("created_at", { ascending: true }),
    supabase.from("products").select("*").order("created_at", { ascending: false }),
  ]);
  dataCache = {
    categories: (cats.data ?? []).map((c: CategoryRow) => ({ id: c.id, name: c.name })),
    products: (prods.data ?? []).map((p) => mapProduct(p as ProductRow)),
  };
  emit();
}

function subscribeRealtime() {
  const channel = supabase
    .channel("shop-store")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "categories" },
      () => {
        void initialLoad();
      },
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "products" },
      () => {
        void initialLoad();
      },
    )
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}

function ensureInit() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  void initialLoad();
  subscribeRealtime();
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
  get: () => dataCache,
  subscribe(l: () => void) {
    ensureInit();
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  async addCategory(name: string) {
    const { error } = await supabase.from("categories").insert({ name });
    if (error) throw error;
    await initialLoad();
  },
  async removeCategory(id: string) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
    await initialLoad();
  },
  async addProduct(p: Omit<Product, "id" | "createdAt">) {
    const { error } = await supabase.from("products").insert({
      name: p.name,
      price: p.price,
      category_id: p.categoryId,
      description: p.description ?? "",
      images: p.images,
    });
    if (error) throw error;
    await initialLoad();
  },
  async removeProduct(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    await initialLoad();
  },
};

export const cart = {
  get: readCart,
  subscribe(l: () => void) {
    cartListeners.add(l);
    return () => {
      cartListeners.delete(l);
    };
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

const emptyData: Data = { categories: [], products: [] };

export function useStore() {
  return useSyncExternalStore(store.subscribe, store.get, () => emptyData);
}
export function useCart() {
  return useSyncExternalStore(cart.subscribe, cart.get, () => [] as CartItem[]);
}

/** Hook to know if initial load from cloud has happened (for empty-state UX). */
export function useStoreReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    ensureInit();
    let cancelled = false;
    const check = () => {
      if (cancelled) return;
      if (initialized) setReady(true);
    };
    check();
    const unsub = store.subscribe(() => setReady(true));
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);
  return ready;
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
