# 🚀 Quick Start Guide

## Installation rapide (5 minutes)

### 1. Installer les dépendances
```bash
cd C:\Users\caill\CascadeProjects\loto-fdj-analyzer
npm install
```

### 2. Initialiser la base de données
```bash
npx prisma generate
npx prisma db push
```

### 3. Lancer l'application
```bash
npm run dev
```

### 4. Ouvrir dans le navigateur
```
http://localhost:3000
```

### 5. Synchroniser les données
- Cliquer sur "Synchroniser maintenant" sur la page d'accueil
- Attendre 30-60 secondes
- Vérifier que ~2412 tirages sont importés

## 🎯 Utilisation rapide

### Voir les résultats
1. Aller sur **Résultats** dans le menu
2. Utiliser les filtres pour rechercher
3. Cliquer sur un tirage pour voir les détails

### Analyser les stats
1. Aller sur **Analyse** dans le menu
2. Choisir une fenêtre (Tout, 1000, 200, ou Personnalisé)
3. Explorer les graphiques et statistiques

### Générer des grilles
1. Aller sur **Générateur** dans le menu
2. Configurer les contraintes :
   - Nombre de grilles (1-20)
   - Fenêtre statistique
   - Contraintes dures et souples
3. Cliquer sur "Générer les grilles"
4. Exporter en CSV si nécessaire

## 🔧 Commandes utiles

```bash
# Développement
npm run dev

# Build production
npm run build

# Lancer en production
npm start

# Voir la base de données
npx prisma studio

# Réinitialiser la DB
rm prisma/dev.db
npx prisma db push
```

## ⚠️ Troubleshooting

**Erreur de synchronisation ?**
- Vérifier la connexion internet
- Attendre 6h si rate limit

**Base de données corrompue ?**
```bash
rm prisma/dev.db
npx prisma db push
```

**Port 3000 déjà utilisé ?**
```bash
npm run dev -- -p 3001
```

## 📚 Documentation complète

Voir [README.md](./README.md) pour la documentation complète.
