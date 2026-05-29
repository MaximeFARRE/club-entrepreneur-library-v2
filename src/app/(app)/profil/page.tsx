import { getCurrentUser, getUserProfile } from "@/lib/auth";
import { getLivresByOwner } from "@/services/livre.service";
import { getEmpruntsByBorrower, getLoansByOwnerBooks, determineLoanStatus } from "@/services/emprunt.service";
import { updateProfileNameAction } from "./actions";
import Link from "next/link";
import type { LoanStatus } from "@/types";

const STATUS_BADGE: Record<LoanStatus, string> = {
  green: "bg-green-50 text-green-700 border-green-100",
  orange: "bg-orange-50 text-orange-700 border-orange-100",
  red: "bg-red-50 text-red-700 border-red-100",
};

const STATUS_TEXT: Record<LoanStatus, string> = {
  green: "En règle",
  orange: "À rendre bientôt",
  red: "En retard",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function ProfilPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const [user, profile] = await Promise.all([getCurrentUser(), getUserProfile()]);
  if (!user || !profile) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Chargement du profil...</p>
      </div>
    );
  }

  const { error, success } = await searchParams;

  const [ownedBooks, userEmprunts, bookLoans] = await Promise.all([
    getLivresByOwner(user.email!),
    getEmpruntsByBorrower(user.email!),
    getLoansByOwnerBooks(user.email!),
  ]);

  const activeBorrows = userEmprunts.filter((e) => e.date_retour === null);
  const borrowHistory = userEmprunts.filter((e) => e.date_retour !== null);
  const activeLent = ownedBooks.filter((b) => b.disponibilite === "Indisponible");

  // Statistics
  const stats = [
    { label: "Emprunts actifs", value: activeBorrows.length, color: "border-l-blue-500" },
    { label: "Total empruntés", value: userEmprunts.length, color: "border-l-purple-500" },
    { label: "Mes livres en prêt", value: activeLent.length, color: "border-l-orange-500" },
    { label: "Total partagés", value: ownedBooks.length, color: "border-l-green-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{profile.nom || "Utilisateur"}</h1>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 capitalize">
              {profile.role}
            </span>
          </div>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <div className="text-sm text-gray-400">
          Membre depuis le {formatDate(user.created_at)}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(({ label, value, color }) => (
          <div key={label} className={`rounded-lg border border-gray-200 border-l-4 bg-white p-5 shadow-sm ${color}`}>
            <p className="text-2xl font-bold text-gray-950">{value}</p>
            <p className="mt-1 text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Columns */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Borrows */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Mes emprunts en cours</h2>
            {activeBorrows.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                Vous n'avez aucun livre emprunté pour le moment.{" "}
                <Link href="/catalogue" className="font-semibold text-blue-600 hover:underline">
                  Découvrir le catalogue
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {activeBorrows.map((e) => {
                  const status = determineLoanStatus(e.date_retour, e.date_retour_prevue);
                  return (
                    <div key={e.id} className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      {e.livres.couverture ? (
                        <img src={e.livres.couverture} alt={e.livres.titre} className="h-20 w-14 object-cover rounded shadow-sm" />
                      ) : (
                        <div className="h-20 w-14 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-medium">
                          No Cover
                        </div>
                      )}
                      <div className="flex-1 space-y-1">
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{e.livres.titre}</h3>
                        <p className="text-xs text-gray-500 line-clamp-1">de {e.livres.auteur}</p>
                        <p className="text-xs font-medium text-gray-700">
                          À rendre pour le : <span className="font-semibold">{formatDate(e.date_retour_prevue)}</span>
                        </p>
                        <span className={`inline-block rounded border px-2 py-0.5 text-[10px] font-semibold uppercase ${STATUS_BADGE[status]}`}>
                          {STATUS_TEXT[status]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Lent Out Books status */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Mes livres partagés (lending status)</h2>
            {ownedBooks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                Vous n'avez pas encore partagé de livres.{" "}
                <Link href="/ajouter" className="font-semibold text-blue-600 hover:underline">
                  Ajouter un livre à prêter
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 text-xs font-medium uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3 text-left">Livre</th>
                      <th className="px-4 py-3 text-left">Catégorie</th>
                      <th className="px-4 py-3 text-left">Statut</th>
                      <th className="px-4 py-3 text-left">Détenu par</th>
                      <th className="px-4 py-3 text-left">Retour prévu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ownedBooks.map((b) => {
                      const activeLoan = bookLoans.find((l) => l.id_livre === b.id && l.date_retour === null);
                      const isBorrowed = b.disponibilite === "Indisponible";
                      return (
                        <tr key={b.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {b.titre}
                            <span className="block text-xs font-normal text-gray-500">de {b.auteur}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{b.categorie || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              b.disponibilite === "Disponible"
                                ? "bg-green-50 text-green-700"
                                : b.disponibilite === "Archivé"
                                ? "bg-gray-100 text-gray-700"
                                : "bg-orange-50 text-orange-700"
                            }`}>
                              {b.disponibilite}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {isBorrowed && activeLoan ? (
                              <div>
                                <span className="font-medium text-gray-900">{activeLoan.emprunteur}</span>
                                <span className="block text-xs text-gray-400">{activeLoan.emprunteur_email}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {isBorrowed && activeLoan ? formatDate(activeLoan.date_retour_prevue) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Borrowing History */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Mon Historique d'emprunts</h2>
            {borrowHistory.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Aucun emprunt passé enregistré.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 text-xs font-medium uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3 text-left">Livre</th>
                      <th className="px-4 py-3 text-left">Date emprunt</th>
                      <th className="px-4 py-3 text-left">Date retour</th>
                      <th className="px-4 py-3 text-left">Commentaire</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {borrowHistory.map((h) => (
                      <tr key={h.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{h.livres.titre}</td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(h.date_emprunt)}</td>
                        <td className="px-4 py-3 text-gray-600">{h.date_retour ? formatDate(h.date_retour) : "—"}</td>
                        <td className="px-4 py-3 text-gray-500 italic max-w-xs truncate">{h.commentaire || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </div>

        {/* Sidebar settings */}
        <div className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Modifier mes informations</h2>
            
            {error && (
              <p className="rounded bg-red-50 px-3 py-2 text-xs text-red-700">
                {error === "missing_name" ? "Veuillez entrer un nom valide." : decodeURIComponent(error)}
              </p>
            )}

            {success && (
              <p className="rounded bg-green-50 px-3 py-2 text-xs text-green-700">
                Nom mis à jour avec succès.
              </p>
            )}

            <form action={updateProfileNameAction} className="space-y-4">
              <div>
                <label htmlFor="nom" className="block text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Nom complet
                </label>
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  required
                  defaultValue={profile.nom || ""}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Sauvegarder
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
