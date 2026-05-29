import { getAllHistory, determineLoanStatus } from "@/services/emprunt.service";
import type { LoanStatus } from "@/types";

const STATUS_EMOJI: Record<LoanStatus, string> = {
  green: "🟢",
  orange: "🟠",
  red: "🔴",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function HistoriquePage() {
  const emprunts = await getAllHistory();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Historique</h1>
        <span className="text-sm text-gray-500">{emprunts.length} emprunt(s)</span>
      </div>

      {emprunts.length === 0 ? (
        <p className="py-12 text-center text-gray-400">Aucun emprunt enregistré.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-xs font-medium uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Livre</th>
                <th className="px-4 py-3 text-left">Emprunteur</th>
                <th className="px-4 py-3 text-left">Emprunté le</th>
                <th className="px-4 py-3 text-left">Retour prévu</th>
                <th className="px-4 py-3 text-left">Rendu le</th>
                <th className="px-4 py-3 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {emprunts.map((e) => {
                const status = determineLoanStatus(e.date_retour, e.date_retour_prevue);
                return (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {e.livres.titre}
                      <span className="block text-xs font-normal text-gray-400">
                        {e.livres.auteur}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {e.emprunteur}
                      <span className="block text-xs text-gray-400">
                        {e.emprunteur_email}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(e.date_emprunt)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(e.date_retour_prevue)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(e.date_retour)}
                    </td>
                    <td className="px-4 py-3 text-center text-base">
                      {STATUS_EMOJI[status]}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
