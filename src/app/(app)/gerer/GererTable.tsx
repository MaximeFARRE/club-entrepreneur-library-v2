"use client";

import { useState } from "react";
import type { Livre, Emprunt } from "@/types";
import { updateBookAction, archiveBookAction, deleteBookAction } from "./actions";
import { CATEGORIES_PREDEFINIES } from "@/lib/constants";

type LivreAvecEmprunt = Livre & { empruntActif: Emprunt | null };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function GererTable({ livres }: { livres: LivreAvecEmprunt[] }) {
  const [editing, setEditing] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {livres.map((livre) => (
        <div
          key={livre.id}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          {editing === livre.id ? (
            <EditForm livre={livre} onCancel={() => setEditing(null)} />
          ) : (
            <BookRow
              livre={livre}
              onEdit={() => setEditing(livre.id)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function BookRow({
  livre,
  onEdit,
}: {
  livre: LivreAvecEmprunt;
  onEdit: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);

  const badgeColor =
    livre.disponibilite === "Disponible"
      ? "bg-green-100 text-green-800"
      : livre.disponibilite === "Indisponible"
      ? "bg-red-100 text-red-800"
      : "bg-gray-100 text-gray-600";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900">{livre.titre}</p>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeColor}`}>
            {livre.disponibilite}
          </span>
        </div>
        <p className="text-sm text-gray-500">{livre.auteur}</p>
        <p className="text-xs text-gray-400">Propriétaire : {livre.proprietaire}</p>
        {livre.empruntActif && (
          <p className="text-xs text-orange-600">
            Emprunté par {livre.empruntActif.emprunteur} — retour prévu le{" "}
            {formatDate(livre.empruntActif.date_retour_prevue)}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={onEdit}
          className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
        >
          Modifier
        </button>

        {livre.disponibilite !== "Archivé" && (
          <>
            {confirmArchive ? (
              <div className="flex gap-1">
                <form action={archiveBookAction}>
                  <input type="hidden" name="id" value={livre.id} />
                  <button
                    type="submit"
                    className="rounded-md bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-700"
                  >
                    Confirmer
                  </button>
                </form>
                <button
                  onClick={() => setConfirmArchive(false)}
                  className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-500"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmArchive(true)}
                className="rounded-md border border-yellow-200 px-3 py-1.5 text-xs font-medium text-yellow-700 hover:bg-yellow-50"
              >
                Archiver
              </button>
            )}
          </>
        )}

        {confirmDelete ? (
          <div className="flex gap-1">
            <form action={deleteBookAction}>
              <input type="hidden" name="id" value={livre.id} />
              <button
                type="submit"
                className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
              >
                Supprimer définitivement
              </button>
            </form>
            <button
              onClick={() => setConfirmDelete(false)}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-500"
            >
              Annuler
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
          >
            Supprimer
          </button>
        )}
      </div>
    </div>
  );
}

function EditForm({
  livre,
  onCancel,
}: {
  livre: LivreAvecEmprunt;
  onCancel: () => void;
}) {
  const [categories, setCategories] = useState<string>(livre.categorie ?? "");

  const selectedCategories = categories
    ? categories.split(", ").filter(Boolean)
    : [];

  const toggleCategory = (cat: string) => {
    let nextCategories;
    if (selectedCategories.includes(cat)) {
      nextCategories = selectedCategories.filter((c) => c !== cat);
    } else {
      nextCategories = [...selectedCategories, cat];
    }
    setCategories(nextCategories.join(", "));
  };

  return (
    <form action={updateBookAction} className="space-y-4">
      <input type="hidden" name="id" value={livre.id} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Titre" name="titre" defaultValue={livre.titre} required />
        <Field label="Auteur" name="auteur" defaultValue={livre.auteur} required />
        
        <div className="sm:col-span-2 space-y-2">
          <label className="block text-sm font-medium text-gray-700">Catégories</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES_PREDEFINIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all duration-200 ${
                    isSelected
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm hover:bg-blue-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          <input type="hidden" name="categorie" value={categories} />
        </div>

        <Field label="Propriétaire" name="proprietaire" defaultValue={livre.proprietaire} required />
        <Field label="Email propriétaire" name="proprietaire_email" type="email" defaultValue={livre.proprietaire_email} required />
        <Field label="URL couverture" name="couverture" defaultValue={livre.couverture ?? ""} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Résumé</label>
        <textarea
          name="resume"
          rows={2}
          defaultValue={livre.resume ?? ""}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Enregistrer
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
    </div>
  );
}
