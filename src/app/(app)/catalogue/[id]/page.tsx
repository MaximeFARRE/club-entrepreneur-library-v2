import Link from "next/link";
import Image from "next/image";
import { getLivre } from "@/services/livre.service";
import { getLoansForBook, determineLoanStatus } from "@/services/emprunt.service";
import { notFound } from "next/navigation";

const BADGE_STYLES: Record<string, string> = {
  Disponible: "bg-green-50 text-green-700 border-green-200 border",
  Indisponible: "bg-red-50 text-red-700 border-red-200 border",
  Archivé: "bg-gray-50 text-gray-600 border-gray-200 border",
};

const LOAN_STATUS_LABELS: Record<string, { text: string; styles: string }> = {
  green: { text: "Rendu (À temps)", styles: "bg-green-50 text-green-700 border-green-200" },
  orange: { text: "En cours", styles: "bg-amber-50 text-amber-700 border-amber-200 animate-pulse" },
  red: { text: "En retard", styles: "bg-red-50 text-red-700 border-red-200 font-semibold" },
};

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function LivreDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bookId = Number(id);

  if (isNaN(bookId)) {
    notFound();
  }

  const [livre, historique] = await Promise.all([
    getLivre(bookId),
    getLoansForBook(bookId),
  ]);

  if (!livre) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Navigation & Actions */}
      <div>
        <Link
          href="/catalogue"
          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors"
        >
          ← Retour au catalogue
        </Link>
      </div>

      {/* Main Info Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm grid grid-cols-1 md:grid-cols-3">
        {/* Left Column: Image/Fallback */}
        <div className="bg-gray-50 border-r border-gray-100 flex flex-col items-center justify-center p-8 relative min-h-[300px]">
          {livre.couverture ? (
            <div className="relative h-64 w-44 rounded-md shadow-md overflow-hidden bg-white">
              <Image
                src={livre.couverture}
                alt={`Couverture de ${livre.titre}`}
                fill
                className="object-contain p-1"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-64 w-44 items-center justify-center rounded-md bg-white border border-gray-200 text-6xl shadow-sm">
              📚
            </div>
          )}
          
          <div className="mt-6 flex flex-col items-center gap-2">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${BADGE_STYLES[livre.disponibilite] ?? ""}`}
            >
              {livre.disponibilite}
            </span>
            {livre.emprunte_par && (
              <span className="text-xs text-gray-500">
                Actuellement chez : <strong className="text-gray-700">{livre.emprunte_par}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Right Columns: Book Details */}
        <div className="md:col-span-2 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              {livre.categorie && (
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  {livre.categorie}
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 leading-tight">
                {livre.titre}
              </h1>
              <p className="text-base text-gray-500 mt-1">par <strong className="text-gray-800 font-medium">{livre.auteur}</strong></p>
            </div>

            <div className="border-t border-b border-gray-100 py-4 space-y-2">
              <p className="text-sm text-gray-500">
                Propriétaire : <span className="font-semibold text-gray-800">{livre.proprietaire}</span>{" "}
                <span className="text-xs text-gray-400">({livre.proprietaire_email})</span>
              </p>
              <p className="text-sm text-gray-500">
                Ajouté le : <span className="font-semibold text-gray-800">{formatDate(livre.date_ajout)}</span>
              </p>
            </div>

            {livre.resume ? (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900">Résumé</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {livre.resume}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Aucun résumé disponible.</p>
            )}

            {livre.disponibilite === "Disponible" && (
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <Link
                  href={`/emprunter?livreId=${livre.id}`}
                  className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm"
                >
                  Emprunter ce livre
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Historique des emprunts</h2>

        {historique.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500 text-sm">
            Aucun emprunt enregistré pour ce livre.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-3 text-left">Emprunteur</th>
                    <th className="px-6 py-3 text-left">Date d&apos;emprunt</th>
                    <th className="px-6 py-3 text-left">Retour prévu</th>
                    <th className="px-6 py-3 text-left">Retour réel</th>
                    <th className="px-6 py-3 text-center">Statut</th>
                    <th className="px-6 py-3 text-left">Commentaire</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {historique.map((loan) => {
                    const statusKey = determineLoanStatus(loan.date_retour, loan.date_retour_prevue);
                    const statusLabel = LOAN_STATUS_LABELS[statusKey] || { text: "Inconnu", styles: "bg-gray-100 text-gray-700" };

                    // Custom label adjustment for returned items
                    let finalLabelText = statusLabel.text;
                    if (loan.date_retour) {
                      finalLabelText = statusKey === "green" ? "Rendu (À temps)" : "Rendu (En retard)";
                    }

                    return (
                      <tr key={loan.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {loan.emprunteur}
                          <span className="block text-xs font-normal text-gray-400">
                            {loan.emprunteur_email}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                          {formatDate(loan.date_emprunt)}
                        </td>
                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                          {formatDate(loan.date_retour_prevue)}
                        </td>
                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                          {formatDate(loan.date_retour)}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusLabel.styles}`}
                          >
                            {finalLabelText}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 italic max-w-xs truncate">
                          {loan.commentaire || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
