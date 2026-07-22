import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Trash2, Upload, LogOut, Plus, X } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { store, useStore, fileToDataUrl, SIZES } from "@/lib/shop-store";
import { toast } from "sonner";

const AUTH_KEY = "beenaz_admin_pw";

function getAdminPassword(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(AUTH_KEY) ?? "";
}

export const Route = createFileRoute("/admin")({
  component: Admin,
});

function Admin() {
  const [authed, setAuthed] = useState(
    () => typeof window !== "undefined" && !!sessionStorage.getItem(AUTH_KEY),
  );

  if (!authed) return <Login onOk={() => setAuthed(true)} />;
  return <Dashboard onLogout={() => setAuthed(false)} />;
}

function Login({ onOk }: { onOk: () => void }) {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-sm px-4 py-20">
        <h1 className="font-display text-3xl">Admin login</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the admin password to manage products.
        </p>
        <form
          className="mt-6 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!pw) return;
            setBusy(true);
            try {
              // Verify by attempting a no-op admin call (add + remove a probe category).
              // Simpler: store the password and let the first mutation validate.
              sessionStorage.setItem(AUTH_KEY, pw);
              onOk();
            } finally {
              setBusy(false);
            }
          }}
        >
          <Input
            type="password"
            placeholder="Password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoFocus
          />
          <Button type="submit" className="w-full">
            Sign in
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Default password: <code>beenaz123</code>
          </p>
        </form>
      </div>
      <SiteFooter />
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const { categories, products } = useStore();
  const [newCat, setNewCat] = useState("");

  // product form
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([...SIZES]);
  const fileRef = useRef<HTMLInputElement>(null);

  function toggleSize(s: string) {
    setSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const arr: string[] = [];
    for (const f of Array.from(files)) {
      try {
        arr.push(await fileToDataUrl(f));
      } catch {
        /* skip */
      }
    }
    setImages((prev) => [...prev, ...arr]);
  }

  async function submitProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price || !categoryId) {
      toast.error("Fill name, price and category");
      return;
    }
    if (images.length === 0) {
      toast.error("Add at least one image");
      return;
    }
    if (sizes.length === 0) {
      toast.error("Select at least one available size");
      return;
    }
    try {
      await store.addProduct({
        name,
        price: Number(price),
        categoryId,
        description,
        images,
        sizes,
      });
      setName("");
      setPrice("");
      setDescription("");
      setImages([]);
      setSizes([...SIZES]);
      if (fileRef.current) fileRef.current.value = "";
      toast.success("Product added — live for everyone");
    } catch (err) {
      toast.error((err as Error).message || "Failed to save product");
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl">Admin dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Manage categories and products.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              sessionStorage.removeItem(AUTH_KEY);
              onLogout();
            }}
          >
            <LogOut className="mr-1 h-4 w-4" /> Logout
          </Button>
        </div>

        {/* Categories */}
        <section className="mt-8 rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-xl">Categories</h2>
          <form
            className="mt-3 flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!newCat.trim()) return;
              try {
                await store.addCategory(newCat.trim());
                setNewCat("");
                toast.success("Category added");
              } catch (err) {
                toast.error((err as Error).message || "Failed");
              }
            }}
          >
            <Input
              placeholder="New category name"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
            />
            <Button type="submit">
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-sm"
              >
                {c.name} ({products.filter((p) => p.categoryId === c.id).length})
                <button
                  onClick={async () => {
                    if (confirm(`Delete category "${c.name}" and its products?`)) {
                      try {
                        await store.removeCategory(c.id);
                        toast.success("Category removed");
                      } catch (err) {
                        toast.error((err as Error).message || "Failed");
                      }
                    }
                  }}
                  className="text-destructive hover:opacity-70"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </section>

        {/* Add Product */}
        <section className="mt-6 rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-xl">Add product</h2>
          <form onSubmit={submitProduct} className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Product name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Price (Rs.)</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Available sizes</Label>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((s) => {
                  const active = sizes.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      className={`min-w-12 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:bg-accent"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Tap to toggle which sizes customers can pick for this product.
              </p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Images (any type — jpg, png, webp, gif...)</Label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground hover:file:bg-primary/90"
              />
              {images.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {images.map((src, i) => (
                    <div key={i} className="relative">
                      <img
                        src={src}
                        alt=""
                        className="h-20 w-20 rounded-md object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setImages((prev) => prev.filter((_, idx) => idx !== i))
                        }
                        className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <Button type="submit" size="lg">
                <Upload className="mr-1 h-4 w-4" /> Save product
              </Button>
            </div>
          </form>
        </section>

        {/* Products list */}
        <section className="mt-6 rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-xl">All products ({products.length})</h2>
          {products.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No products yet.</p>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {products.map((p) => {
                const cat = categories.find((c) => c.id === p.categoryId);
                return (
                  <div
                    key={p.id}
                    className="flex gap-3 rounded-lg border border-border p-3"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-20 w-16 rounded object-cover"
                    />
                    <div className="flex flex-1 flex-col">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {cat?.name ?? "—"} • Rs. {p.price.toLocaleString()} •{" "}
                        {p.images.length} image{p.images.length > 1 ? "s" : ""}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Sizes: {p.sizes.length > 0 ? p.sizes.join(", ") : "—"}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete "${p.name}"?`)) {
                          try {
                            await store.removeProduct(p.id);
                            toast.success("Product removed");
                          } catch (err) {
                            toast.error((err as Error).message || "Failed");
                          }
                        }
                      }}
                      className="text-destructive hover:opacity-70"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
      <SiteFooter />
    </div>
  );
}
