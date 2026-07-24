import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ShoppingBag, MessageCircle, ArrowLeft, Truck, ShieldCheck, Phone } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { cart, useStore, useStoreLoaded, whatsappOrderUrl } from "@/lib/shop-store";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
  head: ({ params }) => ({
    meta: [
      { title: `Product ${params.id.slice(0, 6)} — Beenaz Fashion House` },
      { name: "description", content: "Premium stitched women's wear from Beenaz Fashion House, Lahore. Cash on delivery all over Pakistan." },
      { property: "og:title", content: "Beenaz Fashion House — Product" },
      { property: "og:description", content: "Premium stitched women's wear. Cash on delivery all over Pakistan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function ProductPage() {
  const { id } = Route.useParams();
  const { products, categories } = useStore();
  const loaded = useStoreLoaded();
  const product = products.find((p) => p.id === id);

  if (loaded && !product) throw notFound();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link to="/shop" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>

        {!product ? (
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            <div className="aspect-[3/4] w-full animate-pulse rounded-2xl bg-muted" />
            <div className="space-y-4">
              <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-24 w-full animate-pulse rounded bg-muted" />
            </div>
          </div>
        ) : (
          <ProductDetail product={product} categoryName={categories.find((c) => c.id === product.categoryId)?.name} />
        )}
      </div>
      <SiteFooter />
    </div>
  );
}

function ProductDetail({
  product,
  categoryName,
}: {
  product: NonNullable<ReturnType<typeof useStore>["products"][number]>;
  categoryName?: string;
}) {
  const images = product.images.length > 0 ? product.images : [""];
  const [activeImg, setActiveImg] = useState(0);
  const available = product.sizes.length > 0 ? product.sizes : ["M"];
  const [size, setSize] = useState<string>(available[0]);
  const [qty, setQty] = useState(1);
  const sku = `BFH-${product.id.slice(0, 8).toUpperCase()}`;

  const orderMsg = `Assalam-o-Alaikum! I want to order:\n\n*${product.name}*\nSKU: ${sku}\nSize: ${size}\nQty: ${qty}\nPrice: Rs. ${(product.price * qty).toLocaleString()}\n\nPlease share details.`;

  const addToCart = async () => {
    try {
      for (let i = 0; i < qty; i++) await cart.add(product.id, size);
      toast.success(`Added ${qty} × ${product.name} (Size ${size}) to cart`);
    } catch (e) {
      toast.error((e as Error).message || "Failed to add");
    }
  };

  return (
    <div className="mt-6 grid gap-10 md:grid-cols-2">
      <div>
        <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
          {images[activeImg] ? (
            <img
              src={images[activeImg]}
              alt={product.name}
              className="h-full w-full object-cover"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image</div>
          )}
        </div>
        {images.length > 1 && (
          <div className="mt-3 grid grid-cols-5 gap-2">
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImg(i)}
                className={`aspect-square overflow-hidden rounded-md border-2 transition-colors ${
                  activeImg === i ? "border-primary" : "border-transparent"
                }`}
              >
                <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        {categoryName && (
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{categoryName}</p>
        )}
        <h1 className="mt-1 font-display text-3xl md:text-4xl">{product.name}</h1>
        <p className="mt-1 text-xs text-muted-foreground">SKU: {sku}</p>
        <p className="mt-4 text-3xl font-semibold text-primary">Rs. {product.price.toLocaleString()}</p>

        {product.description && (
          <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        )}

        <div className="mt-6">
          <p className="mb-2 text-sm font-medium">Size</p>
          <div className="flex flex-wrap gap-2">
            {available.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`min-w-11 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  size === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-accent"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-sm font-medium">Quantity</p>
          <div className="inline-flex items-center rounded-md border border-border">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="px-3 py-2 hover:bg-accent"
            >
              −
            </button>
            <span className="w-10 text-center text-sm">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(99, q + 1))}
              className="px-3 py-2 hover:bg-accent"
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <Button size="lg" variant="outline" onClick={addToCart}>
            <ShoppingBag className="mr-1.5 h-4 w-4" /> Add to Cart
          </Button>
          <Button asChild size="lg" className="bg-[#25D366] text-white hover:bg-[#1ebe5a]">
            <a href={whatsappOrderUrl(orderMsg)} target="_blank" rel="noreferrer">
              <MessageCircle className="mr-1.5 h-4 w-4" /> Order Now
            </a>
          </Button>
        </div>

        <div className="mt-6 space-y-2 rounded-xl border border-border bg-card p-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Truck className="h-4 w-4 text-primary" /> Cash on delivery all over Pakistan
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" /> Quality stitched by Beenaz Fashion House
          </div>
          <a
            href="tel:03086844441"
            className="flex items-center gap-2 font-medium text-foreground hover:text-primary"
          >
            <Phone className="h-4 w-4 text-primary" /> Order on call: 0308-6844441
          </a>
        </div>
      </div>
    </div>
  );
}
