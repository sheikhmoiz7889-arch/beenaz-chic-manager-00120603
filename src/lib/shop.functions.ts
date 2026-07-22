import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SIZE_ENUM = z.enum(["S", "M", "L", "XL", "XXL"]);

const adminSchema = z.object({
  password: z.string().min(1),
});

function checkAdmin(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || password !== expected) {
    throw new Error("Unauthorized");
  }
}

async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const adminAddCategory = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    adminSchema.extend({ name: z.string().trim().min(1).max(80) }).parse(d),
  )
  .handler(async ({ data }) => {
    checkAdmin(data.password);
    const db = await getAdmin();
    const { error } = await db.from("categories").insert({ name: data.name });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminRemoveCategory = createServerFn({ method: "POST" })
  .inputValidator((d) => adminSchema.extend({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    checkAdmin(data.password);
    const db = await getAdmin();
    const { error } = await db.from("categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminAddProduct = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    adminSchema
      .extend({
        name: z.string().trim().min(1).max(200),
        price: z.number().nonnegative().max(10_000_000),
        categoryId: z.string().uuid(),
        description: z.string().max(4000).optional().default(""),
        images: z.array(z.string().max(3_000_000)).min(1).max(20),
        sizes: z.array(SIZE_ENUM).min(1),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    checkAdmin(data.password);
    const db = await getAdmin();
    const { error } = await db.from("products").insert({
      name: data.name,
      price: data.price,
      category_id: data.categoryId,
      description: data.description ?? "",
      images: data.images,
      sizes: data.sizes,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminRemoveProduct = createServerFn({ method: "POST" })
  .inputValidator((d) => adminSchema.extend({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    checkAdmin(data.password);
    const db = await getAdmin();
    const { error } = await db.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Cart: publicly writable but server-validated (product/size must exist).
const cartKey = z.object({
  productId: z.string().uuid(),
  size: SIZE_ENUM,
});

async function assertValidProductSize(productId: string, size: string) {
  const db = await getAdmin();
  const { data, error } = await db
    .from("products")
    .select("sizes")
    .eq("id", productId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Product not found");
  const sizes: string[] = data.sizes ?? [];
  if (!sizes.includes(size)) throw new Error("Invalid size for product");
}

export const cartAdd = createServerFn({ method: "POST" })
  .inputValidator((d) => cartKey.parse(d))
  .handler(async ({ data }) => {
    await assertValidProductSize(data.productId, data.size);
    const db = await getAdmin();
    const { data: existing } = await db
      .from("cart_items")
      .select("id,qty")
      .eq("product_id", data.productId)
      .eq("size", data.size)
      .maybeSingle();
    if (existing) {
      const nextQty = Math.min((existing.qty ?? 0) + 1, 999);
      const { error } = await db
        .from("cart_items")
        .update({ qty: nextQty })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await db
        .from("cart_items")
        .insert({ product_id: data.productId, size: data.size, qty: 1 });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const cartRemove = createServerFn({ method: "POST" })
  .inputValidator((d) => cartKey.parse(d))
  .handler(async ({ data }) => {
    const db = await getAdmin();
    const { error } = await db
      .from("cart_items")
      .delete()
      .eq("product_id", data.productId)
      .eq("size", data.size);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const cartSetQty = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    cartKey.extend({ qty: z.number().int().min(0).max(999) }).parse(d),
  )
  .handler(async ({ data }) => {
    const db = await getAdmin();
    if (data.qty <= 0) {
      const { error } = await db
        .from("cart_items")
        .delete()
        .eq("product_id", data.productId)
        .eq("size", data.size);
      if (error) throw new Error(error.message);
      return { ok: true };
    }
    await assertValidProductSize(data.productId, data.size);
    const { error } = await db
      .from("cart_items")
      .update({ qty: data.qty })
      .eq("product_id", data.productId)
      .eq("size", data.size);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const cartClear = createServerFn({ method: "POST" })
  .handler(async () => {
    const db = await getAdmin();
    const { error } = await db
      .from("cart_items")
      .delete()
      .neq("product_id", "00000000-0000-0000-0000-000000000000");
    if (error) throw new Error(error.message);
    return { ok: true };
  });
