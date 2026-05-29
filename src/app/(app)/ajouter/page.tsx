import { requireAdmin } from "@/lib/auth";
import AjouterForm from "./AjouterForm";

export default async function AjouterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Ajouter un livre</h1>

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(error)}
        </p>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <AjouterForm />
      </div>
    </div>
  );
}
