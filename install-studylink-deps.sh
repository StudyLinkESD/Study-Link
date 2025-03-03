#!/bin/bash

# Couleurs pour une meilleure lisibilité
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Installation des dépendances pour StudyLink...${NC}"

# Backend
echo -e "${BLUE}Installation des dépendances pour le backend...${NC}"
npm install @prisma/client @supabase/supabase-js
npm install -D prisma

# Authentification
echo -e "${BLUE}Installation des dépendances pour l'authentification...${NC}"
npm install next-auth@beta

# Emails
echo -e "${BLUE}Installation des dépendances pour les emails...${NC}"
npm install resend @react-email/components

# Formulaires
echo -e "${BLUE}Installation des dépendances pour les formulaires...${NC}"
npm install react-hook-form zod @hookform/resolvers

# Gestion d'état
echo -e "${BLUE}Installation des dépendances pour la gestion d'état...${NC}"
npm install @tanstack/react-query @tanstack/react-query-devtools

# UI
echo -e "${BLUE}Installation des dépendances UI...${NC}"
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-slot @radix-ui/react-accordion @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-label @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-toast class-variance-authority clsx tailwind-merge lucide-react @radix-ui/react-popover
npm install -D shadcn-ui

# Upload de fichiers
echo -e "${BLUE}Installation des dépendances pour l'upload de fichiers...${NC}"
npm install react-dropzone

# Pour le bonus (chat en temps réel)
echo -e "${YELLOW}Voulez-vous installer les dépendances pour le système de chat en temps réel (BONUS)? (y/n)${NC}"
read -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Installation des dépendances pour le chat en temps réel...${NC}"
    npm install socket.io socket.io-client zustand
fi

# Initialisation de Prisma
echo -e "${BLUE}Initialisation de Prisma...${NC}"
npx prisma init

# Configuration de shadcn/ui
echo -e "${BLUE}Configuration de shadcn/ui...${NC}"
npx shadcn-ui@latest init

# Ajout de scripts utiles dans package.json
echo -e "${BLUE}Ajout de scripts utiles dans package.json...${NC}"
if command -v jq &> /dev/null; then
    # Utiliser jq si disponible
    jq '.scripts["db:push"] = "prisma db push" | 
        .scripts["db:studio"] = "prisma studio" | 
        .scripts["postinstall"] = "prisma generate"' package.json > temp.json && mv temp.json package.json
else
    echo -e "${YELLOW}Outil jq non trouvé. Les scripts supplémentaires n'ont pas été ajoutés au package.json.${NC}"
    echo -e "${YELLOW}Vous pouvez ajouter manuellement les scripts suivants à votre package.json:${NC}"
    echo -e '"db:push": "prisma db push",'
    echo -e '"db:studio": "prisma studio",'
    echo -e '"postinstall": "prisma generate"'
fi

echo -e "${GREEN}Toutes les dépendances ont été installées avec succès!${NC}"
echo -e "${BLUE}Pour démarrer votre application, exécutez:${NC}"
echo -e "npm run dev"
echo -e "${YELLOW}N'oubliez pas de configurer votre fichier .env avec vos informations de connexion à la base de données et autres clés API.${NC}"
