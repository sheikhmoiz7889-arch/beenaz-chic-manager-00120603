import { useState } from "react";
import { ShoppingBag, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cart, whatsappOrderUrl, type Product } from "@/lib/shop-store";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const img = product.images[0];
  const available = product.sizes.length > 0 ? product.sizes : ["M"];
  const [size, setSize] = useState<string>(available[0]);
  const orderMsg = `Assalam-o-Alaikum! I want to order:\n\n*${product.name}*\nSize: ${size}\nPrice: Rs. ${product.price}\n\nPlease share details.`;
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {img ? (
          <img
            src={img}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-display text-lg leading-tight">{product.name}</h3>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {product.description}
            </p>
          )}
        </div>
        <p className="text-lg font-semibold text-primary">Rs. {product.price.toLocaleString()}</p>

        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Size</p>
          <div className="flex flex-wrap gap-1.5">
            {available.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`min-w-9 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
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

        <div className="mt-auto grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await cart.add(product.id, size);
                toast.success(`Added to cart (Size ${size})`);
              } catch (e) {
                toast.error((e as Error).message || "Failed to add");
              }
            }}
          >
            <ShoppingBag className="mr-1 h-4 w-4" /> Cart
          </Button>
          <Button asChild size="sm" className="bg-[#25D366] text-white hover:bg-[#1ebe5a]">
            <a href={whatsappOrderUrl(orderMsg)} target="_blank" rel="noreferrer">
              <MessageCircle className="mr-1 h-4 w-4" /> Order
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
