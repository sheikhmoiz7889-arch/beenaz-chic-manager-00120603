import { Link } from "@tanstack/react-router";
import { ShoppingBag, Phone } from "lucide-react";
import { useCart } from "@/lib/shop-store";

export function SiteHeader() {
  const cartItems = useCart();
  const count = cartItems.reduce((n, i) => n + i.qty, 0);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex flex-col leading-tight">
          <span className="font-display text-xl font-bold tracking-wide text-primary">
            Beenaz
          </span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Fashion House
          </span>
        </Link>
        <nav className="hidden gap-8 text-sm font-medium md:flex">
          <Link to="/" className="hover:text-primary">Home</Link>
          <Link to="/shop" className="hover:text-primary">Shop</Link>
          <Link to="/admin" className="hover:text-primary">Admin</Link>
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="tel:03086844441"
            className="hidden items-center gap-1.5 text-sm text-muted-foreground hover:text-primary sm:flex"
          >
            <Phone className="h-4 w-4" /> 0308 6844441
          </a>
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
