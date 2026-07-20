import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, MessageCircle } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { cart, useCart, useStore, whatsappOrderUrl } from "@/lib/shop-store";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const items = useCart();
  const { products } = useStore();

  const lines = items
    .map((i) => {
      const p = products.find((x) => x.id === i.productId);
      return p ? { ...i, product: p } : null;
    })
    .filter(Boolean) as { productId: string; qty: number; product: NonNullable<ReturnType<typeof products.find>> }[];

  const total = lines.reduce((n, l) => n + l.product.price * l.qty, 0);

  const orderMessage = `Assalam-o-Alaikum! I want to order:\n\n${lines
    .map((l) => `• ${l.product.name} x ${l.qty} = Rs. ${l.product.price * l.qty}`)
    .join("\n")}\n\n*Total: Rs. ${total.toLocaleString()}*\n\nPlease confirm.`;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="font-display text-4xl">Your Cart</h1>

        {lines.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild className="mt-4">
              <Link to="/shop">Continue shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-8 space-y-3">
              {lines.map((l) => (
                <div
                  key={l.productId}
                  className="flex gap-4 rounded-xl border border-border bg-card p-3"
                >
                  <img
                    src={l.product.images[0]}
                    alt={l.product.name}
                    className="h-24 w-20 rounded-md object-cover"
                  />
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-display text-lg">{l.product.name}</h3>
                      <p className="text-sm text-primary">
                        Rs. {l.product.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => cart.setQty(l.productId, l.qty - 1)}
                        className="rounded border border-border p-1 hover:bg-accent"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm">{l.qty}</span>
                      <button
                        onClick={() => cart.setQty(l.productId, l.qty + 1)}
                        className="rounded border border-border p-1 hover:bg-accent"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => cart.remove(l.productId)}
                        className="ml-auto rounded p-1 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center text-right">
                    <p className="font-semibold">
                      Rs. {(l.product.price * l.qty).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between text-lg">
                <span>Total</span>
                <span className="font-display text-2xl text-primary">
                  Rs. {total.toLocaleString()}
                </span>
              </div>
              <Button
                asChild
                size="lg"
                className="mt-4 w-full bg-[#25D366] text-white hover:bg-[#1ebe5a]"
              >
                <a
                  href={whatsappOrderUrl(orderMessage)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="mr-2 h-5 w-5" /> Order via WhatsApp
                </a>
              </Button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                We'll confirm your order on WhatsApp: 0308 6844441
              </p>
            </div>
          </>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
