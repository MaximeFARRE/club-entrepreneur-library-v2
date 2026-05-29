import { signUpAction } from "./actions";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields: "Veuillez remplir tous les champs obligatoires.",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage = error ? (ERROR_MESSAGES[error] || decodeURIComponent(error)) : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Club Entrepreneur
          </h1>
          <p className="mt-1 text-sm text-gray-500">Bibliothèque — Création de compte</p>
        </div>

        {errorMessage && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <form action={signUpAction} className="space-y-4">
            <div>
              <label
                htmlFor="nom"
                className="block text-sm font-medium text-gray-700"
              >
                Nom complet
              </label>
              <input
                id="nom"
                name="nom"
                type="text"
                required
                placeholder="Ex: Maxime Farre"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="Ex: mail@devinci.fr"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              S'inscrire
            </button>
          </form>

          <div className="text-center text-sm text-gray-500 pt-2">
            Déjà un compte ?{" "}
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
