# 🎰 Loto FDJ Analyzer

Application web complète pour analyser les tirages historiques du Loto FDJ et générer des grilles optimisées avec contraintes avancées.

## ⚠️ Disclaimer

**Cet outil est à but éducatif uniquement.** L'optimisation statistique ne garantit aucun gain. Les résultats du Loto sont aléatoires et imprévisibles. Les jeux d'argent comportent des risques. Jouez responsable.

## 🚀 Fonctionnalités

### 1. Synchronisation automatique des données
- Récupération automatique de **2412 tirages** depuis ReducMiz
- Parsing HTML robuste avec validation
- Cache de 6h pour éviter les requêtes excessives
- Gestion d'erreurs et rate limiting

### 2. Page Résultats
- Liste paginée de tous les tirages (25 par page)
- Filtres avancés :
  - Par numéro (1-49)
  - Par chance (1-10)
  - Par période (date début/fin)
- Page détail pour chaque tirage avec navigation
- Affichage style ReducMiz modernisé

### 3. Page Analyse
- Choix de fenêtre de données :
  - Tout (2412 tirages)
  - 1000 derniers
  - 200 derniers
  - Personnalisé (date from/to)
- Statistiques complètes :
  - Fréquences numéros 1-49
  - Fréquences chance 1-10
  - Distribution pair/impair
  - Distribution bas/haut (1-24 / 25-49)
  - Numéros ≥31 par tirage
  - Gaps actuels (tirages depuis dernière sortie)
  - Top 20 paires fréquentes
  - Percentiles P10/P90 des sommes
- Visualisations avec Recharts

### 4. Générateur de grilles
- Génération de 1 à 20 grilles
- **Contraintes dures** (obligatoires) :
  - Exclure numéros du tirage précédent
  - Exclure chance précédente
  - Ratio pair/impair (2/3 ou 3/2)
  - Ratio bas/haut (2/3 ou 3/2)
  - Max 2 numéros par dizaine
  - Max 1 paire consécutive
  - Pas de triplets consécutifs
  - Pas de progression arithmétique ≥3 numéros
- **Contraintes souples** (optimisation par score) :
  - Somme proche du centre [P10..P90]
  - Amplitude ≥ 25
  - Au moins 2 numéros ≥31
  - Limiter multiples de 5
  - Éviter numéros populaires
  - Éviter chances spécifiques
- **Diversification** :
  - Max overlap entre grilles (≤1 par défaut)
  - Pas de doublons
- Export CSV des grilles générées

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn

## 🛠️ Installation

1. **Cloner ou naviguer vers le projet**
```bash
cd C:\Users\caill\CascadeProjects\loto-fdj-analyzer
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Initialiser la base de données**
```bash
npx prisma generate
npx prisma db push
```

4. **Lancer le serveur de développement**
```bash
npm run dev
```

5. **Ouvrir l'application**
```
http://localhost:3000
```

## 📖 Guide d'utilisation

### Première utilisation

1. **Synchroniser les données**
   - Aller sur la page d'accueil
   - Cliquer sur "Synchroniser maintenant"
   - Attendre la fin de la synchronisation (peut prendre 30-60 secondes)
   - Vérifier que ~2412 tirages ont été importés

2. **Explorer les résultats**
   - Aller sur `/results`
   - Utiliser les filtres pour rechercher des tirages spécifiques
   - Cliquer sur "Afficher détails" pour voir un tirage en détail

3. **Analyser les statistiques**
   - Aller sur `/analysis`
   - Choisir une fenêtre de données
   - Explorer les différentes visualisations

4. **Générer des grilles**
   - Aller sur `/generator`
   - Configurer les contraintes selon vos préférences
   - Cliquer sur "Générer les grilles"
   - Exporter en CSV si nécessaire

### Resynchronisation

La synchronisation est limitée à une fois toutes les 6 heures. Pour forcer une nouvelle synchronisation :
- Attendre l'expiration du cache (6h)
- Ou redémarrer le serveur

## 🏗️ Architecture

### Stack technique
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Base de données**: SQLite + Prisma ORM
- **UI**: React + Tailwind CSS
- **Charts**: Recharts
- **Scraping**: Cheerio

### Structure du projet
```
loto-fdj-analyzer/
├── app/
│   ├── api/
│   │   ├── draws/
│   │   │   ├── sync/route.ts      # POST - Synchronisation
│   │   │   ├── route.ts           # GET - Liste paginée
│   │   │   └── [id]/route.ts      # GET - Détail tirage
│   │   ├── stats/route.ts         # GET - Statistiques
│   │   └── generate/route.ts      # POST - Génération grilles
│   ├── results/
│   │   ├── page.tsx               # Liste des tirages
│   │   └── [id]/page.tsx          # Détail d'un tirage
│   ├── analysis/page.tsx          # Page d'analyse
│   ├── generator/page.tsx         # Générateur de grilles
│   ├── layout.tsx                 # Layout global
│   ├── page.tsx                   # Page d'accueil
│   └── globals.css                # Styles globaux
├── components/
│   └── NumberBadge.tsx            # Composant badge numéro
├── lib/
│   ├── prisma.ts                  # Client Prisma
│   ├── types.ts                   # Types TypeScript
│   ├── scraper.ts                 # Scraping & parsing HTML
│   ├── stats.ts                   # Calculs statistiques
│   └── generator.ts               # Génération de grilles
├── prisma/
│   └── schema.prisma              # Schéma de base de données
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 🔌 API Endpoints

### POST /api/draws/sync
Synchronise les tirages depuis ReducMiz.

**Response:**
```json
{
  "count": 2412,
  "inserted": 2412,
  "updated": 0,
  "lastDate": "2026-02-25",
  "errors": []
}
```

### GET /api/draws
Liste paginée des tirages avec filtres.

**Query params:**
- `limit` (default: 25, max: 100)
- `page` (default: 1)
- `from` (date ISO)
- `to` (date ISO)
- `num` (1-49)
- `chance` (1-10)
- `sort` (asc|desc, default: desc)

**Response:**
```json
{
  "draws": [...],
  "total": 2412,
  "page": 1,
  "limit": 25,
  "totalPages": 97
}
```

### GET /api/draws/[id]
Détail d'un tirage avec navigation.

**Response:**
```json
{
  "id": "2026-02-25_3-12-25-38-42_7",
  "dateISO": "2026-02-25",
  "dateLabel": "mercredi 25 février 2026",
  "nums": [3, 12, 25, 38, 42],
  "chance": 7,
  "source": "ReducMiz",
  "previousId": "...",
  "nextId": "..."
}
```

### GET /api/stats
Statistiques sur une fenêtre de données.

**Query params:**
- `window` (all|1000|200|custom)
- `from` (si custom)
- `to` (si custom)

**Response:**
```json
{
  "window": "all",
  "stats": {
    "totalDraws": 2412,
    "numberFrequencies": [...],
    "chanceFrequencies": [...],
    "sumPercentiles": { "p10": 95, "p90": 165 },
    ...
  }
}
```

### POST /api/generate
Génère des grilles optimisées.

**Body:**
```json
{
  "window": { "window": "all" },
  "count": 5,
  "excludePreviousDraw": true,
  "evenOddRatio": "2/3",
  "minRange": 25,
  ...
}
```

**Response:**
```json
{
  "grids": [
    {
      "nums": [5, 18, 27, 35, 44],
      "chance": 3,
      "score": 87.5,
      "metadata": {
        "sum": 129,
        "range": 39,
        "evenCount": 2,
        "oddCount": 3,
        ...
      }
    }
  ],
  "stats": {
    "iterations": 1250,
    "rejections": 850,
    "avgScore": 85.3
  },
  "warnings": []
}
```

## 🧪 Modèle de données

### Draw (Prisma)
```prisma
model Draw {
  id          String   @id              // Hash stable: date_nums_chance
  dateISO     String                    // YYYY-MM-DD
  dateLabel   String                    // "mercredi 25 février 2026"
  nums        String                    // JSON: [3,12,25,38,42]
  chance      Int                       // 1-10
  source      String   @default("ReducMiz")
  rawDateText String?                   // Texte brut pour debug
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 🔍 Algorithme de génération

### 1. Rejection Sampling
- Génère des candidats aléatoires
- Vérifie les contraintes dures
- Rejette si non conforme
- Continue jusqu'à avoir assez de grilles valides

### 2. Score-based Optimization
Chaque grille reçoit un score basé sur :
- Distance à la somme cible (centre P10-P90)
- Amplitude (bonus si ≥ minRange)
- Nombre de numéros ≥31
- Multiples de 5
- Numéros à éviter
- Chance (proximité fréquence moyenne)

### 3. Diversification
- Vérifie l'overlap entre grilles
- Évite les doublons exacts
- Garantit la variété du pack

## 🐛 Debugging

### Problème de synchronisation
- Vérifier la connexion internet
- Vérifier que ReducMiz est accessible
- Consulter les logs serveur (console)
- Attendre 6h si rate limit atteint

### Base de données corrompue
```bash
rm prisma/dev.db
npx prisma db push
# Puis resynchroniser les données
```

### Erreurs de parsing
Les erreurs de parsing sont loguées mais n'empêchent pas l'import des tirages valides. Vérifier la console serveur pour les détails.

## 📊 Statistiques implémentées

1. **Fréquences numéros** : Nombre d'apparitions de chaque numéro (1-49)
2. **Fréquences chance** : Nombre d'apparitions de chaque chance (1-10)
3. **Numéros ≥31** : Distribution du nombre de numéros hauts par tirage
4. **Pair/Impair** : Distribution des ratios (0/5, 1/4, 2/3, 3/2, 4/1, 5/0)
5. **Bas/Haut** : Distribution 1-24 vs 25-49
6. **Sommes** : Distribution + percentiles P10/P90
7. **Amplitudes** : Distribution (max - min)
8. **Gaps** : Nombre de tirages depuis dernière sortie de chaque numéro
9. **Paires** : Top 20 paires les plus fréquentes
10. **Dizaines** : Répartition par dizaine (implicite dans les contraintes)

## 🚀 Production

### Build
```bash
npm run build
```

### Start
```bash
npm start
```

### Variables d'environnement
Aucune variable d'environnement n'est requise pour le fonctionnement de base. La base de données SQLite est locale.

## 📝 Licence

Ce projet est à usage éducatif uniquement.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir des issues ou des pull requests.

## 📧 Support

Pour toute question ou problème, consultez les logs serveur ou ouvrez une issue sur le repository.

---

**Bon jeu responsable ! 🍀**
