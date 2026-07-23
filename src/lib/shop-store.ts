import { useEffect, useState, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  adminAddCategory,
  adminAddProduct,
  adminRemoveCategory,
  adminRemoveProduct,
  cartAdd,
  cartClear,
  cartRemove,
  cartSetQty,
} from "@/lib/shop.functions";

export type Category = { id: string; name: string };
export type Product = {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  description?: string;
  images: string[];
  sizes: string[];
  createdAt: number;
};
export type CartItem = { productId: string; qty: number; size: string };

export const SIZES = ["S", "M", "L", "XL", "XXL"] as const;

type Data = { categories: Category[]; products: Product[] };

let dataCache: Data = { categories: [], products: [] };
let cartCache: CartItem[] = [];
let initialized = false;
let cartInitialized = false;

const listeners = new Set<() => void>();
const cartListeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}
function emitCart() {
  cartListeners.forEach((l) => l());
}

type CategoryRow = { id: string; name: string };
type ProductRow = {
  id: string;
  name: string;
  price: number | string;
  category_id: string | null;
  description: string | null;
  images: string[] | null;
  sizes: string[] | null;
  created_at: string;
};
type CartRow = { product_id: string; size: string; qty: number };

function mapProduct(r: ProductRow): Product {
  return {
    id: r.id,
    name: r.name,
    price: Number(r.price),
    categoryId: r.category_id ?? "",
    description: r.description ?? "",
    images: r.images ?? [],
    sizes: r.sizes && r.sizes.length > 0 ? r.sizes : [...SIZES],
    createdAt: new Date(r.created_at).getTime(),
  };
}

let loaded = false;
export function isLoaded() {
  return loaded;
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
  loaded = true;
  emit();
}

async function loadCart() {
  const { data } = await supabase
    .from("cart_items")
    .select("product_id,size,qty")
    .order("created_at", { ascending: true });
  cartCache = (data ?? []).map((r: CartRow) => ({
    productId: r.product_id,
    size: r.size,
    qty: r.qty,
  }));
  emitCart();
}

function subscribeRealtime() {
  supabase
    .channel("shop-store")
    .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, () => {
      void initialLoad();
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
      void initialLoad();
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "cart_items" }, () => {
      void loadCart();
    })
    .subscribe();
}

function ensureInit() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  void initialLoad();
  subscribeRealtime();
}
function ensureCartInit() {
  if (cartInitialized || typeof window === "undefined") return;
  cartInitialized = true;
  void loadCart();
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
  async addCategory(name: string, password: string) {
    await adminAddCategory({ data: { password, name } });
    await initialLoad();
  },
  async removeCategory(id: string, password: string) {
    await adminRemoveCategory({ data: { password, id } });
    await initialLoad();
  },
  async addProduct(p: Omit<Product, "id" | "createdAt">, password: string) {
    await adminAddProduct({
      data: {
        password,
        name: p.name,
        price: p.price,
        categoryId: p.categoryId,
        description: p.description ?? "",
        images: p.images,
        sizes: p.sizes as ("S" | "M" | "L" | "XL" | "XXL")[],
      },
    });
    await initialLoad();
  },
  async removeProduct(id: string, password: string) {
    await adminRemoveProduct({ data: { password, id } });
    await initialLoad();
  },
};

type Size = "S" | "M" | "L" | "XL" | "XXL";

export const cart = {
  get: () => cartCache,
  subscribe(l: () => void) {
    ensureInit();
    ensureCartInit();
    cartListeners.add(l);
    return () => {
      cartListeners.delete(l);
    };
  },
  async add(productId: string, size: string) {
    await cartAdd({ data: { productId, size: size as Size } });
    await loadCart();
  },
  async remove(productId: string, size: string) {
    await cartRemove({ data: { productId, size: size as Size } });
    await loadCart();
  },
  async setQty(productId: string, size: string, qty: number) {
    await cartSetQty({ data: { productId, size: size as Size, qty } });
    await loadCart();
  },
  async clear() {
    await cartClear();
    await loadCart();
  },
};

const emptyData: Data = { categories: [], products: [] };
const emptyCart: CartItem[] = [];

export function useStore() {
  return useSyncExternalStore(store.subscribe, store.get, () => emptyData);
}
export function useCart() {
  return useSyncExternalStore(cart.subscribe, cart.get, () => emptyCart);
}

export function useStoreLoaded() {
  const [state, setState] = useState(loaded);
  useEffect(() => {
    ensureInit();
    if (loaded) setState(true);
    const unsub = store.subscribe(() => {
      if (loaded) setState(true);
    });
    return () => {
      unsub();
    };
  }, []);
  return state;
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

/**
 * Upload an image to the public `product-images` bucket and return its public URL.
 * Much faster than embedding base64 data URLs in the product row.
 */
export async function uploadProductImage(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type || undefined,
      upsert: false,
    });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}
