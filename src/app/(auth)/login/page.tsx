import { loginAction } from "./actions";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Identifiants incorrects. Vérifiez votre email et mot de passe.",
  missing_fields: "Email et mot de passe requis.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Club Entrepreneur Logo"
            className="h-20 w-auto object-contain mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">
            Club Entrepreneur
          </h1>
          <p className="mt-1 text-sm text-gray-500">Bibliothèque — Connexion</p>
        </div>

        {errorMessage && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <LoginForm />
          
          <div className="text-center text-sm text-gray-500">
            Pas de compte ?{" "}
            <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-500">
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function LoginForm() {
  return (
    <form action={loginAction} className="space-y-4">
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
          autoComplete="current-password"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Se connecter
      </button>
    </form>
  );
}
