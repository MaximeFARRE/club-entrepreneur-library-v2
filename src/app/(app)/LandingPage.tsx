import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full max-w-5xl rounded-3xl overflow-hidden mb-16 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent)] pointer-events-none" />
        
        <div className="px-6 py-16 sm:px-12 sm:py-24 max-w-3xl relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 mb-6 border border-blue-500/30">
            Association Club Entrepreneur
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-none mb-6">
            La bibliothèque collaborative du Club.
          </h1>
          <p className="text-lg text-slate-300 mb-8 max-w-xl leading-relaxed">
            Empruntez, partagez et découvrez des dizaines de livres d&apos;entrepreneuriat, de business et de développement personnel au sein de notre communauté.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link
              href="/login"
              className="rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all"
            >
              Accéder à la bibliothèque
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-white/10 backdrop-blur px-6 py-3.5 text-sm font-bold text-white hover:bg-white/20 active:scale-95 transition-all border border-white/10"
            >
              Créer un compte membre
            </Link>
          </div>
        </div>

        {/* Decorative elements / abstract mock */}
        <div className="hidden lg:block absolute bottom-0 right-12 top-0 w-80 pointer-events-none">
          <div className="absolute bottom-12 right-0 w-72 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold px-2 py-1 rounded bg-emerald-500/20 text-emerald-300">Disponible</span>
              <span className="text-[10px] text-slate-400">Réf: #024</span>
            </div>
            <h4 className="font-bold text-white text-base leading-tight mb-1">Zero to One</h4>
            <p className="text-xs text-slate-400 mb-4">Peter Thiel</p>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2">
              <div className="bg-blue-500 h-1.5 rounded-full w-full" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Propriétaire : Club</span>
            </div>
          </div>

          <div className="absolute top-16 right-16 w-64 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-500/20 text-amber-300">Emprunté</span>
            </div>
            <h4 className="font-bold text-white text-sm leading-tight mb-1">The Lean Startup</h4>
            <p className="text-xs text-slate-400 mb-3">Eric Ries</p>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
              <span>Retour prévu dans 12j</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-5xl mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
            Comment fonctionne la bibliothèque ?
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Une gestion simplifiée et partagée pour que chaque membre profite pleinement des ressources de l&apos;association.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl mb-6">
              📚
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Catalogue Partagé</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Consultez l&apos;ensemble des livres disponibles. Filtrez par catégorie, recherchez par titre ou auteur et découvrez de nouvelles lectures.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl mb-6">
              ⚡
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Emprunts en 2 Clics</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Déclarez l&apos;emprunt d&apos;un livre physique instantanément. Indiquez votre nom, votre adresse email, et conservez le livre pendant 30 jours.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl mb-6">
              ✉️
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Rappels de Retour</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Recevez des notifications automatiques par email à l&apos;emprunt, au retour, et en cas de retard pour garantir le roulement des ouvrages.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Bottom Section */}
      <section className="w-full max-w-5xl rounded-3xl bg-slate-100 p-8 sm:p-12 text-center border border-slate-200/60 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            Prêt à enrichir vos compétences ?
          </h3>
          <p className="text-slate-600 mb-8 text-sm sm:text-base leading-relaxed">
            Rejoignez les membres du Club Entrepreneur et accédez dès aujourd&apos;hui à nos lectures inspirantes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
            >
              Créer un compte
            </Link>
            <span className="text-xs text-slate-400 font-medium">ou</span>
            <Link
              href="/login"
              className="w-full sm:w-auto rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition-all border border-slate-200 shadow-sm"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
