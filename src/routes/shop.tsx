import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { ProductCard } from "@/components/product-card";
import { useStore, useStoreLoaded } from "@/lib/shop-store";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  cat: z.string().optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  component: Shop,
});

function ProductSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="aspect-[3/4] w-full animate-pulse bg-muted" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

function Shop() {
  const { cat } = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const { products, categories } = useStore();
  const loaded = useStoreLoaded();

  const filtered = cat ? products.filter((p) => p.categoryId === cat) : products;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="font-display text-4xl">Shop</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => navigate({ search: {} })}
            className={cn(
              "rounded-full border border-border px-4 py-1.5 text-sm transition-colors",
              !cat ? "bg-primary text-primary-foreground" : "hover:bg-accent",
            )}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate({ search: { cat: c.id } })}
              className={cn(
                "rounded-full border border-border px-4 py-1.5 text-sm transition-colors",
                cat === c.id ? "bg-primary text-primary-foreground" : "hover:bg-accent",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No products in this category yet.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
