"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

const FILTERS = [
  { label: "Tous", value: "" },
  { label: "Disponibles", value: "Disponible" },
  { label: "Empruntés", value: "Indisponible" },
] as const;

export default function CatalogueFilters({
  currentFilter,
  currentQ,
}: {
  currentFilter?: string;
  currentQ?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const pushFilter = useCallback(
    (filter: string) => {
      const params = new URLSearchParams();
      if (filter) params.set("filter", filter);
      if (currentQ) params.set("q", currentQ);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, currentQ]
  );

  const pushSearch = useCallback(
    (q: string) => {
      const params = new URLSearchParams();
      if (currentFilter) params.set("filter", currentFilter);
      if (q) params.set("q", q);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, currentFilter]
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex gap-2">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => pushFilter(value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              (currentFilter ?? "") === value
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <input
        type="search"
        placeholder="Rechercher par titre ou auteur…"
        defaultValue={currentQ}
        onChange={(e) => pushSearch(e.target.value)}
        className="flex-1 min-w-48 rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
      />
    </div>
  );
}
