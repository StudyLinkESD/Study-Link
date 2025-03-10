# StudyLink 🎓

StudyLink est une plateforme moderne conçue pour faciliter l'apprentissage collaboratif et le partage de connaissances entre étudiants.

## 📚 À propos du projet

Ce projet a été développé dans le cadre d'un cursus académique en développement web, mais il a été conçu et réalisé avec une approche professionnelle et commerciale. StudyLink représente un exemple concret de ce que pourrait être une véritable plateforme SaaS (Software as a Service) destinée au marché de l'éducation.

### 🎓 Contexte académique

- Projet réalisé dans le cadre d'une formation en développement web
- Application des meilleures pratiques de l'industrie
- Utilisation des technologies modernes du marché

### 💼 Potentiel commercial

- Architecture évolutive prête pour la mise à l'échelle
- Fonctionnalités complètes de bout en bout
- Respect des standards de sécurité et de protection des données
- Interface utilisateur professionnelle et intuitive

## 🎯 Fonctionnalités principales

- 👥 Authentification avec Google
- 📚 Gestion de profil étudiant
- 📧 Système de notifications par email
- 🔄 Interface utilisateur réactive et moderne
- 🛡️ Sécurité renforcée avec Next.js et NextAuth
- 💾 Base de données PostgreSQL avec Prisma

## 🚀 Démarrage rapide

### Prérequis

- Node.js (v18 ou supérieur)
- PostgreSQL
- Docker (optionnel)

### Installation

1. Clonez le dépôt :

```bash
git clone https://github.com/StudyLinkESD/Study-Link.git
cd Study-Link
```

2. Installez les dépendances :

```bash
npm install --legacy-peer-deps
```

3. Configurez les variables d'environnement :

```bash
cp .env-example .env
```

Remplissez le fichier `.env` avec vos propres valeurs.

4. Lancez la base de données (avec Docker) :

```bash
docker-compose up -d
```

5. Créez les tables de la base de données :

```bash
npx prisma db push
```

5. Remplir la base de données avec des données de test :

```bash
npm run db:seed
```

6. Lancez le serveur de développement :

```bash
npm run dev
```

## 🛠️ Scripts disponibles

- `npm run dev` - Lance le serveur de développement et le serveur d'emails
- `npm run build` - Compile le projet pour la production (inclut la génération Prisma)
- `npm run start` - Lance le serveur de production
- `npm run lint` - Vérifie le code avec ESLint
- `npm run lint-fix` - Corrige automatiquement les problèmes de linting
- `npm run format` - Formate le code avec Prettier
- `npm run format:check` - Vérifie le formatage du code
- `npm run db:seed` - Remplit la base de données avec des données de test

## 📚 Documentation API

Une documentation complète de l'API est disponible via Swagger UI. Vous pouvez y accéder en visitant `/api-docs` lorsque le serveur est en cours d'exécution.

## 🔧 Technologies utilisées

- Next.js 15
- React 19
- TypeScript
- Prisma
- NextAuth.js
- TailwindCSS
- Supabase
- Docker

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [`LICENSE`](./LICENSE) pour plus de détails.
