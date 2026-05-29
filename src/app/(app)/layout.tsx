import Link from "next/link";
import { getCurrentUser, getUserRole } from "@/lib/auth";
import { logoutAction } from "./actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, role] = await Promise.all([getCurrentUser(), getUserRole()]);
  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo_icone.png"
                alt="Club Entrepreneur Logo"
                className="h-7 w-auto object-contain"
              />
              <span>Club Entrepreneur</span>
            </Link>
            <div className="flex gap-4">
              <NavLink href="/catalogue">Catalogue</NavLink>
              <NavLink href="/emprunter">Emprunter</NavLink>
              <NavLink href="/rendre">Rendre</NavLink>
              <NavLink href="/historique">Historique</NavLink>
              <NavLink href="/profil">Mon Espace</NavLink>
              <NavLink href="/ajouter">Ajouter</NavLink>
              {isAdmin && <NavLink href="/gerer">Gérer</NavLink>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user?.email && (
              <span className="text-xs text-gray-500">{user.email}</span>
            )}
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm text-gray-600 hover:text-gray-900"
    >
      {children}
    </Link>
  );
}
