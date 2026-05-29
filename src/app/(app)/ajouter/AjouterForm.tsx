"use client";

import { useState, useTransition } from "react";
import { isbnLookupAction, addBookAction } from "./actions";

export default function AjouterForm({
  defaultOwnerName,
  defaultOwnerEmail,
}: {
  defaultOwnerName: string;
  defaultOwnerEmail: string;
}) {
  const [isbn, setIsbn] = useState("");
  const [isPending, startTransition] = useTransition();
  const [ownerName, setOwnerName] = useState(defaultOwnerName);
  const [ownerEmail, setOwnerEmail] = useState(defaultOwnerEmail);
  const [fields, setFields] = useState({
    titre: "",
    auteur: "",
    resume: "",
    couverture: "",
  });

  function handleIsbnSearch() {
    startTransition(async () => {
      const result = await isbnLookupAction(isbn);
      if (result) {
        setFields({
          titre: result.titre,
          auteur: result.auteur,
          resume: result.resume ?? "",
          couverture: result.couverture ?? "",
        });
      } else {
        alert("ISBN introuvable. Remplissez les champs manuellement.");
      }
    });
  }

  return (
    <form action={addBookAction} className="space-y-5">
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">ISBN (optionnel)</label>
          <input
            type="text"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            placeholder="Ex: 9782070360024"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleIsbnSearch}
            disabled={isPending || !isbn}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            {isPending ? "Recherche…" : "Rechercher"}
          </button>
        </div>
      </div>

      <Field label="Titre *" name="titre" value={fields.titre} onChange={(v) => setFields((f) => ({ ...f, titre: v }))} required />
      <Field label="Auteur *" name="auteur" value={fields.auteur} onChange={(v) => setFields((f) => ({ ...f, auteur: v }))} required />

      <div>
        <label className="block text-sm font-medium text-gray-700">Catégorie</label>
        <input
          name="categorie"
          type="text"
          placeholder="Ex: Business, Développement personnel…"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Nom du propriétaire *"
          name="proprietaire"
          value={ownerName}
          onChange={setOwnerName}
          required
        />
        <Field
          label="Email du propriétaire *"
          name="proprietaire_email"
          value={ownerEmail}
          onChange={setOwnerEmail}
          type="email"
          required
        />
      </div>

      <Field
        label="Résumé"
        name="resume"
        value={fields.resume}
        onChange={(v) => setFields((f) => ({ ...f, resume: v }))}
        multiline
      />

      <Field
        label="URL couverture"
        name="couverture"
        value={fields.couverture}
        onChange={(v) => setFields((f) => ({ ...f, couverture: v }))}
        placeholder="https://…"
      />

      <div className="flex justify-end gap-3">
        <a href="/catalogue" className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
          Annuler
        </a>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Ajouter le livre
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  required,
  multiline,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  value?: string;
  onChange?: (v: string) => void;
  required?: boolean;
  multiline?: boolean;
  type?: string;
  placeholder?: string;
}) {
  const className =
    "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          rows={3}
          className={className}
        />
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          required={required}
          placeholder={placeholder}
          className={className}
        />
      )}
    </div>
  );
}
