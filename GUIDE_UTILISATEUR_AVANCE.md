# 🚀 Guide Utilisateur - Générateur Avancé

## Vue d'ensemble

Le **Générateur Avancé** est un système de génération de grilles Loto avec scoring explicable et profils intelligents. Il analyse 15 dimensions statistiques pour créer des grilles optimisées.

---

## 🎯 Accès

Cliquez sur **🚀 Avancé** dans la navigation ou accédez à `/generator-advanced`

---

## ⚖️ Les 6 Profils Intelligents

### 1. **Équilibré** (Recommandé pour débuter)
- Configuration optimale basée sur l'analyse statistique
- Équilibre entre tous les paramètres
- Reproduit la structure naturelle des tirages
- **Quand l'utiliser** : Pour des grilles statistiquement solides

### 2. **Dispersé**
- Espacement maximal entre les numéros
- Couvre le maximum de dizaines différentes
- Évite les numéros proches
- **Quand l'utiliser** : Pour maximiser la couverture de l'espace 1-49

### 3. **Anti-partage** ⭐
- Minimise le risque de partager un jackpot
- Évite les patterns typiquement choisis par les humains
- Pénalise : séquences, progressions, dates d'anniversaire
- **Quand l'utiliser** : Pour réduire le risque de partage en cas de gain

### 4. **Mix Chaud/Froid**
- Équilibre entre numéros chauds (fréquents récemment) et froids
- Utilise une pondération temporelle forte
- Favorise les paires fréquentes
- **Quand l'utiliser** : Pour suivre les tendances récentes

### 5. **Conservateur**
- Suit strictement les patterns historiques les plus fréquents
- Favorise les paires et profils de dizaines courants
- Répétition exacte de 1 numéro avec le tirage précédent
- **Quand l'utiliser** : Pour rester proche des structures observées

### 6. **Expérimental** 🧪
- Utilise toutes les fonctionnalités avancées
- Pondération exponentielle sur la récence
- Signature modulaire activée
- **Quand l'utiliser** : Pour tester les algorithmes les plus sophistiqués

---

## 📊 Comprendre le Score /100

Chaque grille générée reçoit un **score de qualité sur 100** basé sur 12+ critères :

### Catégories de scoring

#### 🏗️ Structure (max 30 points)
- **Somme optimale** (10 pts) - Plage 104-145
- **Centre de gravité** (10 pts) - Optimal 22-28
- **Amplitude** (10 pts) - Minimum 25

#### 📊 Dispersion (max 10 points)
- **Espacement naturel** - Écart moyen et variance optimaux

#### ⚖️ Répartition (max 22 points)
- **Ratio pair/impair** (8 pts) - 2/3 ou 3/2 optimal
- **Ratio bas/haut** (8 pts) - 2/3 ou 3/2 optimal
- **Profil de dizaines** (6 pts) - Bonus selon profil

#### 🔗 Patterns (max 14 points)
- **Nombres premiers** (6 pts) - 1-2 optimal
- **Terminaisons uniques** (6 pts) - 4+ différentes
- **Paires fréquentes** (bonus jusqu'à 8 pts)

#### 📜 Historique (max 5 points)
- **Répétition avec précédent** - 0-1 naturel

#### 🎯 Anti-partage (pénalités)
- **Biais humains détectés** - Pénalités variables

#### 🧪 Expérimental (bonus jusqu'à 4 points)
- **Diversité modulaire** - Distribution mod 5/7

### Interprétation du score

| Score | Qualité | Signification |
|-------|---------|---------------|
| 80-100 | ⭐⭐⭐ Excellent | Grille très bien optimisée |
| 60-79 | ⭐⭐ Bon | Grille solide statistiquement |
| 40-59 | ⭐ Moyen | Grille acceptable |
| 0-39 | ⚠️ Faible | Grille à éviter |

---

## 🔧 Paramètres Avancés Expliqués

### 🏗️ Structure

#### Centre de gravité
- **Définition** : Moyenne des 5 numéros
- **Optimal** : 22-28 (centré autour de 25)
- **Exemple** : [5, 12, 25, 38, 45] → Centre = 25

#### Somme cible
- **Plage optimale** : 104-145 (50% central des tirages)
- **Trop bas** (<86) : Grille déséquilibrée vers les petits numéros
- **Trop haut** (>163) : Grille déséquilibrée vers les grands numéros

#### Répétition avec tirage précédent
- **0-1 répétition** : Naturel (92% des tirages)
- **2+ répétitions** : Rare (8% des tirages)
- **Exactement 1** : Option pour forcer 1 répétition

### 📊 Dispersion

#### Profils de dispersion
- **Compact** : Écart moyen <8, variance <15
- **Équilibré** : Écart moyen 8-14, variance 20-40
- **Dispersé** : Écart moyen >14 ou variance >50

#### Écart moyen
- **Définition** : Moyenne des écarts entre numéros consécutifs triés
- **Exemple** : [5, 12, 25, 38, 45] → Écarts [7, 13, 13, 7] → Moyenne 10

### ⚖️ Répartition

#### Profils de dizaines
- **1-1-1-1-1** : 5 dizaines, 1 numéro chacune (rare, 12%)
- **2-1-1-1** : 4 dizaines, une avec 2 (le plus fréquent, 35%)
- **2-2-1** : 3 dizaines, deux avec 2 (fréquent, 28%)
- **3-1-1** : 3 dizaines, une avec 3 (moins fréquent, 15%)
- **3-2** : 2 dizaines, 3 et 2 (rare, 8%)

### 🎯 Anti-biais Humain

#### Patterns détectés et pénalisés

1. **Séquences évidentes** (-15 pts)
   - Exemples : 1,2,3 ou 10,11,12
   - Pourquoi : Surjoués par les humains

2. **Progressions arithmétiques** (-12 pts)
   - Exemples : 5,10,15 ou 7,14,21
   - Pourquoi : Patterns trop évidents

3. **Pattern anniversaire** (-10 pts)
   - 4+ numéros ≤31
   - Pourquoi : Dates de naissance très jouées

4. **Multiples de 5** (-3 à -8 pts)
   - 2+ numéros multiples de 5
   - Pourquoi : Chiffres ronds surjoués

5. **Terminaisons répétitives** (-7 pts)
   - 3+ numéros avec même chiffre final
   - Exemple : 3, 13, 23, 33

6. **Symétries** (-6 pts)
   - Distribution trop symétrique autour de 25

### 🔗 Patterns Fréquents

#### Paires fréquentes
- **Top 50 paires** : Analysées sur l'historique
- **Bonus** : 2-6 points par paire détectée
- **Max par grille** : Configurable (0-5)
- **Exemple** : Si (7,14) est une paire fréquente et apparaît dans votre grille → bonus

### 🧪 Expérimental

#### Pondération temporelle
- **Uniforme** : Tous les tirages ont le même poids
- **Légère** : Poids 1.0 → 0.7 (récent → ancien)
- **Forte** : Poids 1.0 → 0.3
- **Exponentielle** : Décroissance rapide (facteur 0.95^position)

#### Signature modulaire
- Analyse la distribution modulo 5 et modulo 7
- Pénalise si trop de numéros ont le même reste
- Expérimental : impact limité sur le score

---

## 💡 Conseils d'Utilisation

### Pour maximiser vos chances

1. **Commencez avec "Équilibré"**
   - Générez 5-10 grilles
   - Observez les scores
   - Comprenez les contributions

2. **Utilisez "Anti-partage" pour réduire le partage**
   - Si vous jouez régulièrement
   - Pour éviter les grilles "évidentes"
   - Acceptez des scores légèrement plus bas

3. **Expérimentez avec les paramètres**
   - Passez en mode "Personnalisé"
   - Ajustez un paramètre à la fois
   - Observez l'impact sur le score

4. **Diversifiez vos grilles**
   - Ne jouez pas toutes les grilles avec le même profil
   - Mélangez "Équilibré" et "Anti-partage"
   - Variez les fenêtres d'apprentissage (all/1000/200)

### Erreurs à éviter

❌ **Ne pas** mettre tous les paramètres au maximum
- Les contraintes trop strictes empêchent la génération
- Privilégiez 3-4 paramètres clés

❌ **Ne pas** ignorer les avertissements
- Si "Seulement X grilles générées sur Y" → Relâchez les contraintes

❌ **Ne pas** chercher le score parfait 100/100
- Un score de 75-85 est excellent
- Au-delà, vous sur-optimisez peut-être

✅ **À faire** : Analyser le détail du score
- Cliquez sur "Voir le détail du score"
- Comprenez les contributions positives/négatives
- Ajustez en conséquence

---

## 🎲 Stratégies Recommandées

### Stratégie 1 : Équilibre & Diversité
```
Profil : Équilibré
Nombre de grilles : 10
Base : Historique complet
Anti-biais : Désactivé
```
**Objectif** : Grilles statistiquement solides et variées

### Stratégie 2 : Anti-partage Agressif
```
Profil : Anti-partage
Nombre de grilles : 5
Base : 1000 derniers
Anti-biais : Activé (poids 1.5x)
Paires fréquentes : Désactivées
```
**Objectif** : Minimiser le risque de partage

### Stratégie 3 : Tendances Récentes
```
Profil : Mix Chaud/Froid
Nombre de grilles : 8
Base : 200 derniers
Pondération : Forte
Paires fréquentes : Activées (bonus 5)
```
**Objectif** : Suivre les tendances du moment

### Stratégie 4 : Conservateur Historique
```
Profil : Conservateur
Nombre de grilles : 5
Base : Historique complet
Profil dizaines : 2-1-1-1
Répétition : Exactement 1
```
**Objectif** : Coller aux patterns observés

---

## 📈 Interpréter les Résultats

### Exemple de grille générée

```
Grille #1
Numéros : [7] [14] [23] [35] [42]  Chance: 5
Score : 82/100 ⭐⭐⭐

Métadonnées :
- Somme : 121 (optimal)
- Amplitude : 35 (bon)
- Pair/Impair : 3/2 (optimal)
- Bas/Haut : 2/3 (optimal)

Détail du score :
Structure: +18
  +8 Somme optimale - Somme: 121 (optimal: 104-145)
  +10 Centre de gravité - Centre: 24.2 (optimal: 22-28)

Dispersion: +10
  +10 Espacement naturel - Écart moyen: 8.8, variance: 28.3

Répartition: +16
  +8 Ratio pair/impair - 3 pairs / 2 impairs
  +8 Ratio bas/haut - 2 bas (1-24) / 3 hauts (25-49)

Patterns: +12
  +6 Nombres premiers - 2 nombres premiers (optimal: 1-2)
  +6 Terminaisons uniques - 5 terminaisons différentes (optimal: 4+)

Historique: +5
  +5 Répétition avec précédent - 1 numéros communs avec tirage précédent

Patterns: +8
  +8 Paires fréquentes - 2 paires fréquentes détectées

Total: 82/100
```

### Analyse de cette grille

✅ **Points forts**
- Somme et centre de gravité optimaux
- Ratios pair/impair et bas/haut parfaits
- Bonne dispersion naturelle
- 2 paires fréquentes (bonus)

⚠️ **Points d'amélioration**
- Profil de dizaines non optimal (pas de bonus)
- Pourrait avoir plus de terminaisons uniques

**Verdict** : Excellente grille, score de 82/100

---

## ❓ FAQ

### Quel est le meilleur profil ?
Il n'y a pas de "meilleur" profil absolu. Cela dépend de votre stratégie :
- **Équilibré** : Pour la plupart des joueurs
- **Anti-partage** : Si vous jouez régulièrement
- **Mix Chaud/Froid** : Si vous croyez aux tendances

### Pourquoi mon score est-il faible ?
- Vérifiez le détail du score
- Identifiez les pénalités (anti-biais humain ?)
- Ajustez les paramètres concernés

### Combien de grilles générer ?
- **5-10 grilles** : Recommandé pour un usage normal
- **1-3 grilles** : Si vous cherchez la perfection
- **15-20 grilles** : Pour diversifier au maximum

### Quelle base d'apprentissage choisir ?
- **Historique complet** : Plus stable, moins sensible aux variations
- **1000 derniers** : Bon compromis
- **200 derniers** : Pour suivre les tendances très récentes

### Le score garantit-il un gain ?
**NON.** Le score mesure la qualité statistique de la grille, pas la probabilité de gain. Le Loto reste un jeu de hasard. Un score élevé signifie simplement que la grille respecte les structures observées historiquement.

---

## 🔬 Pour aller plus loin

### Comprendre les algorithmes

Le générateur utilise :
1. **Génération aléatoire** avec contraintes hard
2. **Scoring multi-critères** (12+ dimensions)
3. **Filtrage** des grilles avec overlap
4. **Ranking** par score décroissant

### Personnalisation avancée

Vous pouvez créer votre propre stratégie en :
1. Sélectionnant "Personnalisé"
2. Ajustant chaque paramètre individuellement
3. Testant différentes combinaisons
4. Sauvegardant vos configurations préférées (à venir)

---

## 📞 Support

Pour toute question ou suggestion d'amélioration :
- Consultez la documentation technique : `ADVANCED_FEATURES_IMPLEMENTATION.md`
- Analysez le code source dans `lib/stats/`

---

**Bonne chance ! 🍀**

*Rappel : Cet outil est à but éducatif. Jouez responsable.*
