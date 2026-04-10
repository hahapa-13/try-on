"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";

type WishlistItem = {
  id: string;
  user_id: string | null;
  image_url: string;
  created_at: string;
};

export default function WishlistPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    loadWishlist();
  }, [user, userLoading]);

  async function loadWishlist() {
    const supabase = createSupabaseBrowserClient();

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("wishlist")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
        return;
      }

      setItems((data as WishlistItem[]) || []);
    } catch (err: any) {
      setError(err.message || "Failed to load wishlist.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(id: string) {
    const confirmed = window.confirm("Are you sure you want to delete this item?");
    if (!confirmed) return;

    const supabase = createSupabaseBrowserClient();

    try {
      const { error } = await supabase.from("wishlist").delete().eq("id", id);

      if (error) {
        alert(error.message);
        return;
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete item.");
    }
  }

  const isLoading = userLoading || loading;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-md px-4 py-6 space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Wishlist
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Outfits you are still thinking about.
          </p>
        </div>

        {isLoading && (
          <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            Loading wishlist...
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {!isLoading && !error && items.length === 0 && (
          <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            No items yet.
          </div>
        )}

        {!isLoading && !error && items.length > 0 && (
          <div className="space-y-4">
            {items.map((item) => {
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-3"
                >
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem("selectedClothing", item.image_url);
                      router.push("/try-on");
                    }}
                    className="block w-full overflow-hidden rounded-xl bg-white dark:bg-zinc-950"
                  >
                    <div className="aspect-[4/5] w-full">
                      <img
                        src={item.image_url}
                        alt="Wishlist item"
                        className="h-full w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  </button>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-zinc-400">
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>

                    <div className="rounded-full bg-amber-100 px-2 py-1 text-[11px] text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      Wishlist
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        localStorage.setItem("selectedClothing", item.image_url);
                        router.push("/try-on");
                      }}
                      className="w-full rounded-xl bg-black py-2.5 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
                    >
                      Try on
                    </button>

                    <button
                      onClick={() => deleteItem(item.id)}
                      className="w-full rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}