# Plan de Développement — Club Entrepreneur Library v2

Stack : **Next.js 15 (App Router) · TypeScript · Supabase · Vercel · Resend**

---

## Vue d'ensemble

| Phase | Objectif | Livrable |
|-------|----------|----------|
| 0 | Infrastructure & scaffolding | Projet Next.js déployé sur Vercel, DB branchée |
| 1 | Auth + navigation | Login fonctionnel, routes protégées, rôles admin/member |
| 2 | Catalogue & livres | Lecture et ajout de livres (avec ISBN) |
| 3 | Emprunts & retours | Flux complet emprunt → retour avec emails |
| 4 | Historique & tableau de bord | Affichage couleur, métriques, bouton relance |
| 5 | Admin & gestion | Page gérer, archivage, suppression |
| 6 | Finalisation prod | Cron, RLS, tests, polish UI, déploiement final |

---

## Phase 0 — Infrastructure & Scaffolding

### 0.1 Scaffolding Next.js
- Initialiser le projet avec `create-next-app` :
  ```bash
  npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
  ```
- Vérifier la structure générée (`app/`, `src/`, `public/`)
- Ajouter `eslint` et `prettier` si absents
- Commit : `chore: scaffold next.js 15 project with typescript and tailwind`

### 0.2 Dépendances
Installer :
```bash
npm install @supabase/supabase-js @supabase/ssr resend
npm install -D supabase
```
- `@supabase/supabase-js` — client Supabase
- `@supabase/ssr` — helpers pour App Router (cookies, middleware)
- `resend` — envoi d'emails
- `supabase` (CLI dev) — génération des types TypeScript

Commit : `chore: add supabase, ssr helpers and resend dependencies`

### 0.3 Configuration Supabase
- Créer le projet sur [supabase.com](https://supabase.com)
- Appliquer le schéma SQL de `docs/DATABASE_SCHEMA.md` dans l'éditeur SQL
- Générer les types TypeScript :
  ```bash
  npx supabase gen types typescript --project-id <id> > src/types/supabase.ts
  ```
- Créer `src/types/index.ts` avec les types métier (`Livre`, `Emprunt`, `Profile`, `LoanStatus`)
- Commit : `chore: apply database schema and generate supabase types`

### 0.4 Variables d'environnement
- Créer `.env.local.example` (commité) avec les clés à remplir
- Créer `.env.local` (gitignored) avec les vraies valeurs
- Clés nécessaires :
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `RESEND_API_KEY`
  - `CRON_SECRET`
- Commit : `chore: add env example and configure gitignore`

### 0.5 Clients Supabase
- Créer `src/lib/supabase/server.ts` — client côté serveur (Server Components, Server Actions, middleware)
- Créer `src/lib/supabase/client.ts` — client côté navigateur (Client Components)
- Commit : `feat: add supabase server and browser client helpers`

### 0.6 Premier déploiement Vercel
- Connecter le repo GitHub à Vercel
- Ajouter les variables d'environnement dans le dashboard Vercel
- Vérifier que la page par défaut se déploie sans erreur
- Commit : `chore: configure vercel deployment`

---

## Phase 1 — Authentification & Navigation

### 1.1 Middleware de protection des routes
- Créer `middleware.ts` à la racine
- Logique : si l'utilisateur n'est pas connecté et accède à une route sous `/(app)`, rediriger vers `/login`
- Commit : `feat: add supabase auth middleware for route protection`

### 1.2 Page de login
- Créer `app/(auth)/login/page.tsx`
- Formulaire : email + mot de passe
- Action serveur : appel `supabase.auth.signInWithPassword()`
- Gestion d'erreur : afficher le message si les credentials sont incorrects
- Redirect vers `/` si succès
- Commit : `feat: add login page with supabase auth`

### 1.3 Gestion des rôles
- Créer `src/lib/auth.ts` — helpers :
  - `getCurrentUser()` — retourne l'utilisateur connecté (côté serveur)
  - `getUserRole()` — retourne `'admin'` ou `'member'` depuis la table `profiles`
  - `requireAdmin()` — throw si l'utilisateur n'est pas admin (à appeler dans les Server Actions admin)
- Commit : `feat: add auth helpers for role checking`

### 1.4 Layout principal
- Créer `app/(app)/layout.tsx`
- Barre de navigation avec les liens vers toutes les pages
- Afficher le nom de l'utilisateur connecté
- Bouton de déconnexion (Server Action → `supabase.auth.signOut()` → redirect `/login`)
- Les liens "Ajouter" et "Gérer" ne s'affichent qu'aux admins
- Commit : `feat: add main app layout with navigation and logout`

---

## Phase 2 — Catalogue & Livres

### 2.1 Repository livres
- Créer `src/repositories/livre.repository.ts`
- Fonctions :
  - `getLivres(filter?: 'Disponible' | 'Indisponible')` — liste tous les livres non archivés
  - `getLivre(id: number)` — retourne un livre par ID
  - `addLivre(data: InsertLivre)` — insère un nouveau livre
  - `updateLivre(id: number, data: Partial<Livre>)` — met à jour un livre
  - `archiveLivre(id: number)` — passe `disponibilite` à `'Archivé'`
  - `deleteLivre(id: number)` — supprime un livre
  - `updateAvailability(id: number, status: string, borrowerName: string | null)` — met à jour dispo + `emprunte_par`
- Commit : `feat: add livre repository with all crud operations`

### 2.2 Service livres
- Créer `src/services/livre.service.ts`
- Fonctions :
  - `getAllLivres(filter?)` — appelle le repository
  - `getLivre(id)` — appelle le repository
  - `createLivre(data)` — valide les champs requis, appelle le repository
  - `updateLivre(id, data)` — appelle le repository
  - `archiveLivre(id)` — appelle le repository
  - `deletelivre(id)` — appelle historique repository puis livre repository
- Commit : `feat: add livre service`

### 2.3 Page Catalogue
- Créer `app/(app)/catalogue/page.tsx` (Server Component)
- Lire le paramètre de filtre depuis `searchParams` (`?filter=Disponible`)
- Appeler `livreService.getAllLivres(filter)`
- Afficher les livres en grille de cartes : couverture, titre, auteur, propriétaire, badge de disponibilité
- Commit : `feat: add catalogue page with server-side data fetching`

### 2.4 Filtres rapides et recherche
- Créer `app/(app)/catalogue/CatalogueFilters.tsx` (Client Component)
- Boutons : `Tous` / `Disponibles` / `Empruntés` → mettent à jour `?filter=` dans l'URL
- Champ de recherche texte → filtre sur titre + auteur côté client ou via `?q=`
- Commit : `feat: add quick filter buttons and search to catalogue`

### 2.5 Service ISBN
- Créer `src/services/isbn.service.ts`
- Fonction `lookupISBN(isbn: string)` :
  - Appelle l'API Google Books : `https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}`
  - Retourne `{ titre, auteur, resume, couverture }` ou `null` si non trouvé
- Commit : `feat: add isbn lookup service using google books api`

### 2.6 Page Ajouter un livre
- Créer `app/(app)/ajouter/page.tsx` (vérifie rôle admin)
- Créer `app/(app)/ajouter/actions.ts` — Server Action `addBookAction(formData)`
- Formulaire avec champ ISBN :
  - Bouton "Rechercher" → appelle `isbn.service.ts` → pré-remplit les champs
  - Champs manuels : titre, auteur, catégorie, propriétaire, email propriétaire, résumé, couverture
- À la soumission : appelle `livreService.createLivre()` → redirect vers `/catalogue`
- Commit : `feat: add book creation page with isbn autofill`

---

## Phase 3 — Emprunts & Retours

### 3.1 Repository historique
- Créer `src/repositories/historique.repository.ts`
- Fonctions :
  - `getHistorique()` — tous les emprunts avec jointure `livres`
  - `getActiveLoans()` — emprunts sans `date_retour`
  - `getActiveLoanForBook(livreId)` — emprunt actif d'un livre donné
  - `getLastLoan(livreId)` — dernier emprunt d'un livre (pour les emails de retour)
  - `addEmprunt(data)` — insère un emprunt
  - `closeLoan(livreId, dateRetour, commentaire)` — ferme l'emprunt actif
  - `deleteLoansForBook(livreId)` — supprime tout l'historique d'un livre
- Commit : `feat: add historique repository`

### 3.2 Service emprunt
- Créer `src/services/emprunt.service.ts`
- Fonctions :
  - `processBorrow(livreId, emprunteur, emprunteurEmail, commentaire?)` :
    1. Vérifie que le livre existe et est disponible
    2. Calcule `dateRetourPrevue = now + 30 jours`
    3. Met à jour la disponibilité du livre
    4. Insère dans `emprunts`
    5. Déclenche les emails (échecs silencieux)
  - `processReturn(livreId, commentaire?)` :
    1. Vérifie que le livre existe
    2. Récupère le dernier emprunt (pour les emails)
    3. Met à jour la disponibilité
    4. Ferme l'emprunt
    5. Déclenche les emails (échecs silencieux)
  - `getOverdueLoans()` — emprunts actifs où `date_retour_prevue < now`, triés par retard décroissant
  - `getActiveLoanForBook(id)` — emprunt actif d'un livre
  - `determineLoanStatus(dateRetour, dateRetourPrevue): LoanStatus` — retourne `'green' | 'orange' | 'red'`
- Commit : `feat: add emprunt service with borrow and return logic`

### 3.3 Service notification
- Créer `src/services/notification.service.ts`
- Utilise le SDK Resend
- Fonctions :
  - `sendBorrowEmailToBorrower(...)` — confirmation emprunt → emprunteur
  - `sendBorrowEmailToOwner(...)` — notification emprunt → propriétaire
  - `sendReturnEmailToBorrower(...)` — confirmation retour → emprunteur
  - `sendReturnEmailToOwner(...)` — notification retour → propriétaire
  - `sendOverdueReminder(...)` — relance retardataire → emprunteur
- Chaque fonction est indépendante — une erreur ne bloque pas les autres
- Commit : `feat: add email notification service using resend`

### 3.4 Page Emprunter
- Créer `app/(app)/emprunter/page.tsx`
- Créer `app/(app)/emprunter/actions.ts` — Server Action `borrowBookAction(formData)`
- Afficher la liste des livres disponibles (select ou liste cliquable)
- Champs : nom emprunteur, email emprunteur, commentaire (optionnel)
- À la soumission : appelle `empruntService.processBorrow()` → redirect `/catalogue`
- Commit : `feat: add borrow page`

### 3.5 Page Rendre
- Créer `app/(app)/rendre/page.tsx`
- Créer `app/(app)/rendre/actions.ts` — Server Action `returnBookAction(formData)`
- Afficher la liste des livres actuellement empruntés
- Champ commentaire optionnel
- À la soumission : appelle `empruntService.processReturn()` → redirect `/catalogue`
- Commit : `feat: add return page`

---

## Phase 4 — Historique & Tableau de Bord

### 4.1 Page Historique
- Créer `app/(app)/historique/page.tsx`
- Appeler `empruntService.getAllHistory()` (à ajouter dans le service)
- Tableau trié par `date_emprunt DESC`
- Colonnes : titre, emprunteur, date emprunt, date retour prévue, date retour réelle, statut
- Colonne statut : afficher l'emoji selon `determineLoanStatus()` — 🟢 / 🟠 / 🔴
- Commit : `feat: add historique page with color-coded loan status`

### 4.2 Dashboard — métriques
- Mettre à jour `app/(app)/page.tsx`
- Appeler les services pour calculer :
  - Total livres (non archivés)
  - Livres disponibles
  - Livres empruntés
  - Emprunts en retard
- Afficher en cartes métriques (chiffre + label)
- Commit : `feat: add dashboard metrics`

### 4.3 Dashboard — liste des retardataires
- Ajouter sous les métriques une liste des emprunts en retard
- Colonnes : titre, emprunteur, date prévue, jours de retard
- Triée par retard décroissant
- Commit : `feat: add overdue loans list to dashboard`

### 4.4 Bouton "Relancer les retardataires"
- Ajouter un bouton sur le dashboard (visible admin uniquement)
- Server Action `sendOverdueRemindersAction()` :
  1. Récupère tous les emprunts en retard
  2. Pour chacun : appelle `notificationService.sendOverdueReminder()`
  3. Retourne le nombre d'emails envoyés
- Afficher un feedback à l'utilisateur (succès / nombre envoyé)
- Commit : `feat: add manual overdue reminder trigger on dashboard`

---

## Phase 5 — Admin & Gestion des Livres

### 5.1 Page Gérer les livres
- Créer `app/(app)/gerer/page.tsx` (vérifie rôle admin)
- Créer `app/(app)/gerer/actions.ts`
- Afficher tous les livres (y compris archivés)
- Pour chaque livre avec un emprunt actif : afficher emprunteur, date retour prévue, indicateur couleur
- Actions disponibles par livre :
  - Modifier (ouvre un formulaire inline ou une modal)
  - Archiver (confirmation requise)
  - Supprimer (confirmation requise — supprime aussi l'historique)
- Commit : `feat: add book management page for admins`

### 5.2 Edition d'un livre
- Formulaire de modification pré-rempli avec les données actuelles
- Server Action `updateBookAction(id, formData)` → `livreService.updateLivre()`
- Commit : `feat: add book edit form and update action`

### 5.3 Archivage et suppression
- Server Action `archiveBookAction(id)` → `livreService.archiveLivre()`
- Server Action `deleteBookAction(id)` → `livreService.deleteLivre()` (supprime historique aussi)
- Toujours demander confirmation avant de supprimer
- Commit : `feat: add archive and delete book actions`

---

## Phase 6 — Finalisation Production

### 6.1 Cron pour les relances automatiques
- Créer `app/api/notifications/route.ts`
- Vérifie le header `Authorization: Bearer {CRON_SECRET}`
- Appelle la même logique que le bouton "Relancer" du dashboard
- Configurer dans `vercel.json` :
  ```json
  {
    "crons": [{ "path": "/api/notifications", "schedule": "0 8 * * *" }]
  }
  ```
- Commit : `feat: add daily overdue notification cron endpoint`

### 6.2 Vérification RLS Supabase
- Tester chaque table avec un utilisateur `member` : peut lire, peut emprunter, ne peut pas modifier les livres
- Tester avec un utilisateur `admin` : accès complet
- Corriger les politiques si nécessaire
- Commit : `fix: tighten rls policies after audit`

### 6.3 Gestion des erreurs utilisateur
- Afficher des messages d'erreur clairs sur tous les formulaires
- Validation des champs requis côté serveur (Server Actions) et côté client (formulaires HTML5)
- Cas à couvrir : livre déjà emprunté, ISBN introuvable, email invalide
- Commit : `feat: add user-facing error messages and form validation`

### 6.4 États de chargement
- Ajouter des indicateurs visuels pendant les soumissions de formulaires (bouton disabled + spinner)
- Utiliser `useFormStatus()` de React dans les Client Components de formulaire
- Commit : `feat: add loading states to form submissions`

### 6.5 Responsive mobile
- Tester l'interface sur une fenêtre étroite (375px)
- Corriger le layout de navigation (hamburger menu ou menu déroulant)
- Corriger les tableaux (scroll horizontal ou vue compacte)
- Commit : `fix: improve mobile responsiveness`

### 6.6 Tests
- Écrire les tests unitaires pour les fonctions métier critiques :
  - `determineLoanStatus()` — tous les cas (rendu, retard, bientôt dû, ok)
  - `getOverdueLoans()` — filtre et tri corrects
  - `lookupISBN()` — réponse API valide + ISBN introuvable
- Commit : `test: add unit tests for core business logic`

### 6.7 Déploiement final
- Vérifier que toutes les variables d'environnement sont dans Vercel
- Vérifier que le cron est actif dans Vercel Dashboard
- Faire un test complet en production : login → emprunter → rendre → vérifier les emails
- Commit : `chore: finalize production configuration`

---

## Ordre des commits attendu (résumé)

```
chore: scaffold next.js 15 project
chore: add supabase and resend dependencies
chore: apply database schema and generate types
chore: add env example and configure gitignore
feat: add supabase client helpers
feat: add auth middleware
feat: add login page
feat: add auth role helpers
feat: add main app layout with navigation
feat: add livre repository
feat: add livre service
feat: add catalogue page
feat: add quick filter buttons and search
feat: add isbn lookup service
feat: add book creation page with isbn autofill
feat: add historique repository
feat: add emprunt service
feat: add notification service
feat: add borrow page
feat: add return page
feat: add historique page with status colors
feat: add dashboard metrics
feat: add overdue loans list to dashboard
feat: add manual overdue reminder trigger
feat: add book management page
feat: add book edit form
feat: add archive and delete actions
feat: add overdue notification cron endpoint
fix: tighten rls policies
feat: add error handling and form validation
feat: add loading states
fix: mobile responsiveness
test: add unit tests for business logic
chore: finalize production configuration
```

---

## Checklist avant mise en production

- [ ] `npx tsc --noEmit` passe sans erreur
- [ ] Tous les tests passent
- [ ] RLS vérifié pour les rôles member et admin
- [ ] Variables d'environnement configurées dans Vercel
- [ ] Cron actif et testé
- [ ] Test complet du flux emprunt → retour → email en production
- [ ] Interface testée sur mobile
