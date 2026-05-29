import { requireAdmin } from "@/lib/auth";
import { getAllLivresAvecArchives } from "@/services/livre.service";
import { getActiveLoanForBook } from "@/services/emprunt.service";
import GererTable from "./GererTable";

export default async function GererPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;

  const livres = await getAllLivresAvecArchives();

  const livresAvecEmprunt = await Promise.all(
    livres.map(async (l) => ({
      ...l,
      empruntActif: l.disponibilite === "Indisponible"
        ? await getActiveLoanForBook(l.id)
        : null,
    }))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gérer les livres</h1>
        <span className="text-sm text-gray-500">{livres.length} livre(s)</span>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(error)}
        </p>
      )}

      {livresAvecEmprunt.length === 0 ? (
        <p className="py-12 text-center text-gray-400">Aucun livre dans la bibliothèque.</p>
      ) : (
        <GererTable livres={livresAvecEmprunt} />
      )}
    </div>
  );
}
