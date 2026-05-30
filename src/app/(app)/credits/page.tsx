import Link from "next/link";

export const metadata = {
  title: "Origine & Crédits - Club Entrepreneur",
  description: "L'histoire, l'origine et les contributeurs de l'application de gestion de bibliothèque du Club Entrepreneur.",
};

export default function CreditsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">
      {/* Navigation de retour */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors group font-medium"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform inline-block">
            ←
          </span>
          Retour au tableau de bord
        </Link>
        <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-semibold border border-slate-200">
          Version 2.0.0
        </span>
      </div>

      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl px-8 py-12 sm:px-12 sm:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 mb-4 border border-indigo-500/30">
            L&apos;Histoire de l&apos;App
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Origine & Crédits
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Découvrez comment l&apos;application a été pensée, développée et améliorée au fil des mandats pour servir la communauté des membres du Club Entrepreneur.
          </p>
        </div>
      </section>

      {/* Chronologie du Projet */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
          <span>🚀</span> L&apos;Évolution du Projet
        </h2>
        
        <div className="relative border-l border-gray-200 ml-3 pl-6 sm:pl-8 space-y-10">
          {/* V1 Block */}
          <div className="relative">
            <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-300 border-4 border-white ring-4 ring-slate-100" />
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                  Version 1 — Prototype Initial
                </h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-semibold">
                  2025
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Conçue comme un prototype rapide sous **Python & Streamlit** et connectée à **Google Sheets**, cette première version a permis de valider le besoin d&apos;un catalogue partagé pour les livres de l&apos;association. Bien que fonctionnelle, elle présentait des limites de sécurité (pas d&apos;isolation utilisateur) et de performance.
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500 pt-1">
                <span className="bg-gray-50 border border-gray-100 rounded px-2 py-0.5">Python</span>
                <span className="bg-gray-50 border border-gray-100 rounded px-2 py-0.5">Streamlit</span>
                <span className="bg-gray-50 border border-gray-100 rounded px-2 py-0.5">Google Sheets API</span>
              </div>
            </div>
          </div>

          {/* V2 Block */}
          <div className="relative">
            <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 border-4 border-white ring-4 ring-blue-100" />
            <div className="bg-white rounded-2xl p-6 border border-blue-50/80 shadow-md space-y-3 ring-1 ring-blue-500/5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2">
                  Version 2 — Refonte Moderne & Stable
                </h3>
                <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-semibold">
                  En cours (2026)
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Une réécriture complète en **Next.js 15**, **TypeScript** et **Supabase (PostgreSQL)**. Cette version apporte une séparation stricte des responsabilités (architecture 3 tiers), une sécurité renforcée grâce à la Row Level Security (RLS), des espaces utilisateurs personnalisés, un remplissage automatique des fiches via l&apos;API Google Books, ainsi qu&apos;une suite de tests unitaires avec Vitest.
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-indigo-600 pt-1 font-medium">
                <span className="bg-indigo-50/50 border border-indigo-100 rounded px-2 py-0.5">Next.js 15 (App Router)</span>
                <span className="bg-indigo-50/50 border border-indigo-100 rounded px-2 py-0.5">Supabase Auth & DB</span>
                <span className="bg-indigo-50/50 border border-indigo-100 rounded px-2 py-0.5">TypeScript</span>
                <span className="bg-indigo-50/50 border border-indigo-100 rounded px-2 py-0.5">Vitest</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contributeurs & Mandat */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Mandat Card */}
        <section className="md:col-span-1 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>🛡️</span> Mandat & Cadre
          </h2>
          <div className="space-y-3.5 text-sm">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase">Association</p>
              <p className="font-semibold text-gray-800">Club Entrepreneur</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase">Campus</p>
              <p className="font-semibold text-gray-800">Pôle Léonard de Vinci</p>
              <p className="text-xs text-gray-500">Paris La Défense</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase">Mandat Supervisant</p>
              <p className="font-semibold text-gray-800">Mandat 2025 - 2026</p>
            </div>
          </div>
        </section>

        {/* Contributeurs Card */}
        <section className="md:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>👥</span> Contributeurs du Projet
          </h2>
          
          <div className="space-y-4">
            {/* Maxime Farre Profile */}
            <div className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                MF
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-900 text-sm">Maxime FARRE</h4>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">
                    Lead Dev
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Conception de l&apos;architecture 3-tiers, intégration Supabase (Auth, RLS, triggers), automatisation de l&apos;autofill ISBN et de la suite de tests unitaires.
                </p>
              </div>
            </div>

            {/* Note collective */}
            <div className="text-center py-2">
              <p className="text-xs text-gray-400 italic">
                Et tous les membres du Club Entrepreneur ayant participé aux phases de tests et contribué à enrichir le catalogue physique !
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer informatif discret de la page */}
      <div className="text-center pt-4">
        <p className="text-xs text-gray-400 font-medium">
          Club Entrepreneur Léonard de Vinci · Développé avec passion
        </p>
      </div>
    </div>
  );
}
