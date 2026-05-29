import { getAllLivres } from "@/services/livre.service";
import { returnBookAction } from "./actions";

export default async function RendrePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const livresEmpruntes = await getAllLivres("Indisponible");

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Rendre un livre</h1>

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error === "missing_fields"
            ? "Veuillez sélectionner un livre."
            : decodeURIComponent(error)}
        </p>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <form action={returnBookAction} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Livre à rendre *
            </label>
            {livresEmpruntes.length === 0 ? (
              <p className="mt-2 text-sm text-gray-400">
                Aucun livre emprunté en ce moment.
              </p>
            ) : (
              <select
                name="livre_id"
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">Sélectionner un livre…</option>
                {livresEmpruntes.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.titre} — emprunté par {l.emprunte_par}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Commentaire (optionnel)
            </label>
            <textarea
              name="commentaire"
              rows={2}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3">
            <a
              href="/catalogue"
              className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Annuler
            </a>
            <button
              type="submit"
              disabled={livresEmpruntes.length === 0}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              Confirmer le retour
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
