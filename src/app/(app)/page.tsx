import Link from "next/link";
import { getAllLivres, getAllLivresAvecArchives } from "@/services/livre.service";
import { getOverdueLoans, determineLoanStatus } from "@/services/emprunt.service";
import { getUserRole } from "@/lib/auth";
import type { LoanStatus } from "@/types";

const STATUS_EMOJI: Record<LoanStatus, string> = {
  green: "🟢",
  orange: "🟠",
  red: "🔴",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function daysOverdue(dateRetourPrevue: string): number {
  return Math.floor(
    (Date.now() - new Date(dateRetourPrevue).getTime()) / (1000 * 60 * 60 * 24)
  );
}

export default async function DashboardPage() {
  const [tous, disponibles, empruntes, retardataires, role] = await Promise.all([
    getAllLivresAvecArchives(),
    getAllLivres("Disponible"),
    getAllLivres("Indisponible"),
    getOverdueLoans(),
    getUserRole(),
  ]);

  const isAdmin = role === "admin";

  const metrics = [
    { label: "Livres au total", value: tous.filter((l) => l.disponibilite !== "Archivé").length, color: "bg-blue-50 text-blue-700" },
    { label: "Disponibles", value: disponibles.length, color: "bg-green-50 text-green-700" },
    { label: "Empruntés", value: empruntes.length, color: "bg-orange-50 text-orange-700" },
    { label: "En retard", value: retardataires.length, color: "bg-red-50 text-red-700" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {metrics.map(({ label, value, color }) => (
          <div key={label} className={`rounded-lg p-5 ${color}`}>
            <p className="text-3xl font-bold">{value}</p>
            <p className="mt-1 text-sm font-medium opacity-80">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/emprunter"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Emprunter un livre
        </Link>
        <Link
          href="/rendre"
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
        >
          Rendre un livre
        </Link>
        <Link
          href="/catalogue"
          className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          Voir le catalogue
        </Link>
      </div>

      {retardataires.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Retardataires ({retardataires.length})
            </h2>
            {isAdmin && <OverdueReminderButton />}
          </div>

          <div className="overflow-x-auto rounded-lg border border-red-100 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-red-50 text-xs font-medium uppercase text-red-600">
                <tr>
                  <th className="px-4 py-3 text-left">Livre</th>
                  <th className="px-4 py-3 text-left">Emprunteur</th>
                  <th className="px-4 py-3 text-left">Retour prévu</th>
                  <th className="px-4 py-3 text-right">Retard</th>
                  <th className="px-4 py-3 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {retardataires.map((e) => {
                  const days = daysOverdue(e.date_retour_prevue);
                  const status = determineLoanStatus(e.date_retour, e.date_retour_prevue);
                  return (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {e.livres.titre}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {e.emprunteur}
                        <span className="block text-xs text-gray-400">
                          {e.emprunteur_email}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(e.date_retour_prevue)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-red-600">
                        {days}j
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
        </section>
      )}
    </div>
  );
}

function OverdueReminderButton() {
  return (
    <form action="/api/notifications/remind" method="POST">
      <button
        type="submit"
        className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
      >
        Relancer les retardataires
      </button>
    </form>
  );
}
