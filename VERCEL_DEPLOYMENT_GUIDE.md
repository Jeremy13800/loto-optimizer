# 🚀 Guide de Déploiement Vercel

## 📋 Prérequis

- Compte GitHub (déjà fait ✅)
- Compte Vercel (gratuit)
- Code pushé sur GitHub (déjà fait ✅)

---

## 🔧 Étape 1 : Créer un compte Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Sign Up"**
3. Choisissez **"Continue with GitHub"**
4. Autorisez Vercel à accéder à votre compte GitHub

---

## 🗄️ Étape 2 : Créer une base de données PostgreSQL

### Option A : Vercel Postgres (Recommandé)

1. Dans le dashboard Vercel, cliquez sur **"Storage"**
2. Cliquez sur **"Create Database"**
3. Sélectionnez **"Postgres"**
4. Choisissez la région **"Frankfurt (cdg1)"** (proche de la France)
5. Nommez votre base : `loto-optimizer-db`
6. Cliquez sur **"Create"**

✅ **Vercel créera automatiquement la variable `DATABASE_URL`**

### Option B : Supabase (Alternative gratuite)

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Copiez la **Connection String** (format PostgreSQL)
4. Vous l'utiliserez à l'étape 3

---

## 📦 Étape 3 : Déployer l'application

1. Dans le dashboard Vercel, cliquez sur **"Add New Project"**
2. Sélectionnez votre repository **"loto-optimizer"**
3. Cliquez sur **"Import"**

### Configuration du projet :

- **Framework Preset** : Next.js (détecté automatiquement)
- **Root Directory** : `./` (laisser par défaut)
- **Build Command** : `prisma generate && next build` (déjà configuré)
- **Output Directory** : `.next` (par défaut)

### Variables d'environnement :

Si vous utilisez **Vercel Postgres** :
- ✅ Aucune configuration nécessaire (automatique)

Si vous utilisez **Supabase** ou autre :
- Cliquez sur **"Environment Variables"**
- Ajoutez : `DATABASE_URL` = `votre_connection_string_postgresql`

4. Cliquez sur **"Deploy"**

⏳ **Le déploiement prendra 2-3 minutes**

---

## 🔄 Étape 4 : Initialiser la base de données

Une fois le déploiement terminé :

### Option 1 : Via Vercel CLI (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Lier le projet
vercel link

# Exécuter les migrations
vercel env pull .env.local
npx prisma migrate deploy
npx prisma db push
```

### Option 2 : Via le Dashboard Vercel

1. Allez dans **Settings** > **Environment Variables**
2. Copiez la valeur de `DATABASE_URL`
3. Créez un fichier `.env.local` localement avec cette valeur
4. Exécutez :
```bash
npx prisma db push
```

---

## 📊 Étape 5 : Importer les données

Vous devez importer les tirages historiques dans la nouvelle base PostgreSQL.

### Méthode 1 : Via l'API de scraping

1. Allez sur votre URL Vercel : `https://votre-app.vercel.app`
2. Appelez l'endpoint de synchronisation :
```bash
curl -X POST https://votre-app.vercel.app/api/draws/sync
```

### Méthode 2 : Export/Import manuel

Si vous avez déjà des données en SQLite local :

```bash
# 1. Exporter depuis SQLite
npx prisma db pull
npx prisma db seed

# 2. Importer vers PostgreSQL
# Configurez DATABASE_URL vers Vercel Postgres
npx prisma db push
```

---

## ✅ Étape 6 : Vérifier le déploiement

1. Visitez votre URL Vercel : `https://votre-app.vercel.app`
2. Testez les pages :
   - `/` - Page d'accueil
   - `/generator` - Générateur
   - `/analysis` - Analyses
   - `/results` - Résultats

3. Vérifiez que les données s'affichent correctement

---

## 🔄 Déploiements futurs

Chaque fois que vous pushez sur la branche `main` :
- ✅ Vercel déploiera automatiquement
- ✅ Les migrations Prisma seront appliquées
- ✅ L'application sera mise à jour

---

## 🐛 Dépannage

### Erreur : "Prisma Client not found"

**Solution** :
```bash
# Dans les settings Vercel, Build Command:
prisma generate && next build
```

### Erreur : "Database connection failed"

**Solution** :
- Vérifiez que `DATABASE_URL` est bien configurée
- Vérifiez que la base de données est accessible
- Testez la connexion localement avec la même URL

### Erreur : "Build timeout"

**Solution** :
- Augmentez le timeout dans les settings Vercel
- Ou optimisez le build (déjà fait avec lazy loading)

---

## 📊 Limites du plan gratuit Vercel

- ✅ **Bande passante** : 100 GB/mois
- ✅ **Builds** : 6000 minutes/mois
- ✅ **Serverless Functions** : 100 GB-heures
- ✅ **Postgres** : 256 MB de stockage
- ✅ **Domaine personnalisé** : Inclus

**Pour votre application Loto** : Largement suffisant ! 🎉

---

## 🌐 Domaine personnalisé (Optionnel)

1. Dans Vercel, allez dans **Settings** > **Domains**
2. Ajoutez votre domaine personnalisé
3. Suivez les instructions pour configurer les DNS

---

## 📝 Checklist finale

- [ ] Compte Vercel créé
- [ ] Base de données PostgreSQL créée
- [ ] Application déployée sur Vercel
- [ ] Variables d'environnement configurées
- [ ] Migrations Prisma exécutées
- [ ] Données importées
- [ ] Application testée et fonctionnelle

---

**Votre application Loto FDJ Analyzer est maintenant en production ! 🚀**
