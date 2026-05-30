"use client";

import { useState } from "react";
import { deleteOwnerBookAction } from "./actions";

interface DeleteBookButtonProps {
  id: number;
  isBorrowed: boolean;
}

export default function DeleteBookButton({ id, isBorrowed }: DeleteBookButtonProps) {
  const [confirm, setConfirm] = useState(false);

  if (isBorrowed) {
    return (
      <span
        className="text-xs text-gray-400 italic cursor-not-allowed"
        title="Impossible de supprimer un livre en cours d'emprunt"
      >
        Emprunté
      </span>
    );
  }

  if (confirm) {
    return (
      <div className="flex items-center justify-end gap-1.5">
        <form action={deleteOwnerBookAction}>
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            className="rounded bg-red-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-red-700 transition shadow-sm"
          >
            Confirmer
          </button>
        </form>
        <button
          type="button"
          onClick={() => setConfirm(false)}
          className="rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-500 hover:bg-gray-50 transition shadow-sm"
        >
          Annuler
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline transition"
    >
      Supprimer
    </button>
  );
}
