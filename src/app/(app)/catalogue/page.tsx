import { getAllLivres } from "@/services/livre.service";
import type { DisponibiliteFilter, Livre } from "@/types";
import CatalogueFilters from "./CatalogueFilters";
import Image from "next/image";
import Link from "next/link";

const BADGE_STYLES: Record<string, string> = {
  Disponible: "bg-green-100 text-green-800",
  Indisponible: "bg-red-100 text-red-800",
  Archivé: "bg-gray-100 text-gray-600",
};

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const { filter, q } = await searchParams;
  const validFilter = (["Disponible", "Indisponible"] as DisponibiliteFilter[]).includes(
    filter as DisponibiliteFilter
  )
    ? (filter as DisponibiliteFilter)
    : undefined;

  let livres = await getAllLivres(validFilter);

  if (q?.trim()) {
    const search = q.toLowerCase();
    livres = livres.filter(
      (l) =>
        l.titre.toLowerCase().includes(search) ||
        l.auteur.toLowerCase().includes(search)
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Catalogue</h1>
        <span className="text-sm text-gray-500">{livres.length} livre(s)</span>
      </div>

      <CatalogueFilters currentFilter={filter} currentQ={q} />

      {livres.length === 0 ? (
        <p className="py-12 text-center text-gray-400">Aucun livre trouvé.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {livres.map((livre) => (
            <LivreCard key={livre.id} livre={livre} />
          ))}
        </div>
      )}
    </div>
  );
}

function LivreCard({ livre }: { livre: Livre }) {
  return (
    <Link
      href={`/catalogue/${livre.id}`}
      className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-gray-300 transition-all group"
    >
      {livre.couverture ? (
        <div className="relative h-48 w-full bg-gray-100">
          <Image
            src={livre.couverture}
            alt={`Couverture de ${livre.titre}`}
            fill
            className="object-contain p-2 group-hover:scale-[1.03] transition-transform duration-350"
            unoptimized
          />
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center bg-gray-100 text-4xl group-hover:scale-[1.03] transition-transform duration-350">📚</div>
      )}

      <div className="flex flex-1 flex-col p-4 space-y-2">
        <h2 className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {livre.titre}
        </h2>
        <p className="text-xs text-gray-500">{livre.auteur}</p>
        <p className="text-xs text-gray-400">Propriétaire : {livre.proprietaire}</p>

        <div className="mt-auto flex items-center justify-between">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${BADGE_STYLES[livre.disponibilite] ?? ""}`}
          >
            {livre.disponibilite}
          </span>
          {livre.emprunte_par && (
            <span className="text-xs text-gray-400">par {livre.emprunte_par}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
