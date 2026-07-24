import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { ProductCard } from "@/components/product-card";
import { useStore, useStoreLoaded } from "@/lib/shop-store";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

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

  const filtered = useMemo(
    () => (cat ? products.filter((p) => p.categoryId === cat) : products),
    [products, cat],
  );

  const [visible, setVisible] = useState(PAGE_SIZE);
  // Reset paging when category or dataset size changes
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [cat, filtered.length]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible((v) => Math.min(v + PAGE_SIZE, filtered.length));
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [hasMore, filtered.length]);

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

        {!loaded ? (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No products in this category yet.
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {shown.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
              {hasMore &&
                Array.from({ length: Math.min(PAGE_SIZE, filtered.length - visible) }).map(
                  (_, i) => <ProductSkeleton key={`s-${i}`} />,
                )}
            </div>
            {hasMore && <div ref={sentinelRef} className="h-1" aria-hidden />}
          </>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
