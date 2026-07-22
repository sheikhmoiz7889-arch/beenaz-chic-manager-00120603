import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, MapPin, Phone, Sparkles, Truck } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { useStore, useStoreLoaded, whatsappOrderUrl } from "@/lib/shop-store";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  component: Home,
});

function ProductSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="aspect-[3/4] w-full animate-pulse bg-muted" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="h-8 animate-pulse rounded bg-muted" />
          <div className="h-8 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

function CategorySkeleton() {
  return <div className="aspect-[4/3] animate-pulse rounded-xl bg-muted" />;
}

function Home() {
  const { products, categories } = useStore();
  const loaded = useStoreLoaded();
  const featured = products.slice(0, 8);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/40 px-3 py-1 text-xs font-medium text-accent-foreground">
              <Sparkles className="h-3 w-3" /> New stitched collection
            </span>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] text-foreground md:text-6xl">
              Elegance <em className="text-primary">stitched</em> for every woman.
            </h1>
            <p className="mt-5 max-w-md text-base text-muted-foreground">
              Beenaz Fashion House brings you a premium stitched variety of
              suits, formals, casuals and bridal wear — designed in Lahore,
              delivered to your door.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/shop">
                  Shop collection <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-[#25D366] text-[#128C7E] hover:bg-[#25D366]/10">
                <a
                  href={whatsappOrderUrl("Assalam-o-Alaikum! I'd like to know more about your collection.")}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="mr-1 h-4 w-4" /> Chat on WhatsApp
                </a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" /> Bahria Town, Lahore
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-primary" /> 0308 6844441
              </span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary/20 via-accent/30 to-transparent blur-2xl" />
            <img
              src={heroImg}
              alt="Beenaz Fashion House stitched collection"
              width={1600}
              height={1000}
              className="aspect-[4/5] w-full rounded-2xl object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl">Shop by category</h2>
            <p className="text-sm text-muted-foreground">Browse our stitched variety</p>
          </div>
          <Link to="/shop" className="text-sm font-medium text-primary hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/shop"
              search={{ cat: c.id }}
              className="group flex aspect-[4/3] flex-col items-center justify-center rounded-xl border border-border bg-card p-4 text-center transition-all hover:border-primary hover:shadow-md"
            >
              <span className="font-display text-lg group-hover:text-primary">
                {c.name}
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                {products.filter((p) => p.categoryId === c.id).length} items
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8">
          <h2 className="font-display text-3xl">Featured pieces</h2>
          <p className="text-sm text-muted-foreground">Handpicked from the latest collection</p>
        </div>
        {featured.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">
              No products yet. Visit the{" "}
              <Link to="/admin" className="text-primary underline">
                admin panel
              </Link>{" "}
              to add your first product.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
