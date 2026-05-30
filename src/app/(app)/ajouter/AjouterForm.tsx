"use client";

import { useState, useTransition } from "react";
import { isbnLookupAction, addBookAction } from "./actions";
import Link from "next/link";
import { CATEGORIES_PREDEFINIES } from "@/lib/constants";

export default function AjouterForm() {
  const [isbn, setIsbn] = useState("");
  const [isPending, startTransition] = useTransition();
  const [fields, setFields] = useState({
    titre: "",
    auteur: "",
    categorie: "",
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
          categorie: result.categorie ?? "",
          resume: result.resume ?? "",
          couverture: result.couverture ?? "",
        });
      } else {
        alert("ISBN introuvable. Remplissez les champs manuellement.");
      }
    });
  }

  const selectedCategories = fields.categorie
    ? fields.categorie.split(", ").filter(Boolean)
    : [];

  const toggleCategory = (cat: string) => {
    let nextCategories;
    if (selectedCategories.includes(cat)) {
      nextCategories = selectedCategories.filter((c) => c !== cat);
    } else {
      nextCategories = [...selectedCategories, cat];
    }
    setFields((f) => ({ ...f, categorie: nextCategories.join(", ") }));
  };

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

      <div className="space-y-2">
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
        <input type="hidden" name="categorie" value={fields.categorie} />
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
        <Link href="/catalogue" className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
          Annuler
        </Link>
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
