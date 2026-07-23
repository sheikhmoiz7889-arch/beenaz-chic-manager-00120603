import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/shop-store";

export function SiteHeader() {
  const cartItems = useCart();
  const count = cartItems.reduce((n, i) => n + i.qty, 0);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto grid h-20 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 md:h-24">
        {/* Left: nav */}
        <nav className="hidden gap-8 text-sm font-medium md:flex">
          <Link to="/" className="hover:text-primary">Home</Link>
          <Link to="/shop" className="hover:text-primary">Shop</Link>
          <Link to="/admin" className="hover:text-primary">Admin</Link>
        </nav>
        <div className="md:hidden" />

        {/* Center: brand */}
        <Link to="/" className="flex flex-col items-center justify-center leading-none">
          <span className="font-display text-4xl font-black tracking-tight text-primary md:text-6xl">
            Beenaz
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.4em] text-muted-foreground md:text-xs">
            Fashion House
          </span>
        </Link>

        {/* Right: contact + cart */}
        <div className="flex items-center justify-end gap-3">
          <div className="hidden flex-col text-right text-sm leading-tight text-muted-foreground lg:flex">
            <a href="tel:03086844441" className="hover:text-primary">0308 6844441</a>
            <a href="tel:03244311936" className="hover:text-primary">0324 4311936</a>
          </div>
          <Link
            to="/cart"
            className="relative rounded-full border border-border p-2 hover:bg-accent"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <h3 className="font-display text-2xl text-primary">Beenaz Fashion House</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Stitched variety of premium women's clothing — crafted in Lahore.
          </p>
        </div>
        <div className="text-sm">
          <h4 className="mb-2 font-semibold">Visit Us</h4>
          <p className="text-muted-foreground">
            SQ 99 Mall & Apartments<br />
            1C, Nister Block, Bahria Town<br />
            Lahore, 54000
          </p>
        </div>
        <div className="text-sm">
          <h4 className="mb-2 font-semibold">Contact</h4>
          <p className="text-muted-foreground">
            Phone: <a href="tel:03086844441" className="text-primary">0308 6844441</a><br />
            Phone: <a href="tel:03244311936" className="text-primary">0324 4311936</a><br />
            WhatsApp orders welcome
          </p>
        </div>
      </div>
      <p className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Beenaz Fashion House. All rights reserved.
      </p>
    </footer>
  );
}
