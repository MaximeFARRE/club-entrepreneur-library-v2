import { getAllLivres } from "@/services/livre.service";
import { borrowBookAction } from "./actions";

export default async function EmprunterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const livres = await getAllLivres("Disponible");

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Emprunter un livre</h1>

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error === "missing_fields"
            ? "Veuillez remplir tous les champs obligatoires."
            : decodeURIComponent(error)}
        </p>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <form action={borrowBookAction} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Livre *
            </label>
            {livres.length === 0 ? (
              <p className="mt-2 text-sm text-gray-400">
                Aucun livre disponible pour le moment.
              </p>
            ) : (
              <select
                name="livre_id"
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">Sélectionner un livre…</option>
                {livres.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.titre} — {l.auteur}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Votre nom *
            </label>
            <input
              name="emprunteur"
              type="text"
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Votre email *
            </label>
            <input
              name="emprunteur_email"
              type="email"
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
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
              disabled={livres.length === 0}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Emprunter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
