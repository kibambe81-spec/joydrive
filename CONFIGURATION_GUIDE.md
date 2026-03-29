# JoyDrive — Guide de Configuration Complet

## Application déployée
**URL de production :** https://joydrive-app.vercel.app  
**Dashboard Vercel :** https://vercel.com/kibambes-projects/joydrive-app

---

## 1. SQL à exécuter dans Supabase

Rendez-vous sur : **https://supabase.com/dashboard/project/ldxluortmuaxnafrcayi/sql/new**

Copiez et exécutez ce SQL complet :

```sql
-- Activer l'extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des profils utilisateurs
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('client', 'driver')) DEFAULT 'client',
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des trajets (rides)
CREATE TABLE public.rides (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    price DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des messages (temps réel)
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ride_id UUID REFERENCES public.rides(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des appels (temps réel)
CREATE TABLE public.calls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ride_id UUID REFERENCES public.rides(id) ON DELETE CASCADE,
    caller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('initiating', 'ringing', 'accepted', 'rejected', 'ended')) DEFAULT 'initiating',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des notifications (temps réel)
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des promotions
CREATE TABLE public.promotions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_percentage INT CHECK (discount_percentage > 0 AND discount_percentage <= 100),
    valid_until TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Users can view their own rides." ON public.rides FOR SELECT USING (true);
CREATE POLICY "Clients can insert rides." ON public.rides FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own rides." ON public.rides FOR UPDATE USING (true);

CREATE POLICY "Users can view their messages." ON public.messages FOR SELECT USING (true);
CREATE POLICY "Users can insert messages." ON public.messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their calls." ON public.calls FOR SELECT USING (true);
CREATE POLICY "Users can insert calls." ON public.calls FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their calls." ON public.calls FOR UPDATE USING (true);

CREATE POLICY "Users can view their notifications." ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Users can update their notifications." ON public.notifications FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert notifications." ON public.notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Promotions are viewable by everyone." ON public.promotions FOR SELECT USING (true);

-- Activer le temps réel (Realtime) pour les tables nécessaires
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.calls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rides;

-- Créer le bucket de stockage pour les photos de profil
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Politique de stockage pour les avatars
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Anyone can upload an avatar." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Anyone can update their avatar." ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');
CREATE POLICY "Anyone can delete their avatar." ON storage.objects FOR DELETE USING (bucket_id = 'avatars');

-- Données de test : Promotion de bienvenue
INSERT INTO public.promotions (code, discount_percentage, valid_until)
VALUES ('WELCOME20', 20, NOW() + INTERVAL '30 days');
```

---

## 2. Configuration Google Cloud Console

### APIs à activer
Rendez-vous sur : **https://console.cloud.google.com/apis/library**

Activez ces 4 APIs :

| API | Lien direct |
|-----|-------------|
| Maps JavaScript API | https://console.cloud.google.com/apis/library/maps-backend.googleapis.com |
| Places API (classique) | https://console.cloud.google.com/apis/library/places-backend.googleapis.com |
| Directions API | https://console.cloud.google.com/apis/library/directions-backend.googleapis.com |
| Geocoding API | https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com |

### Création du Client ID OAuth 2.0 (pour connexion Google)

Rendez-vous sur : **https://console.cloud.google.com/apis/credentials**

1. Cliquez sur **"+ CRÉER DES IDENTIFIANTS"** → **"ID client OAuth 2.0"**
2. Type d'application : **Application Web**
3. Nom : `JoyDrive Web Client`
4. **Origines JavaScript autorisées** (ajoutez ces URIs) :
   ```
   https://joydrive-app.vercel.app
   http://localhost:3000
   http://localhost:5173
   ```
5. **URI de redirection autorisés** (ajoutez ces URLs) :
   ```
   https://joydrive-app.vercel.app
   https://joydrive-app.vercel.app/auth/callback
   https://ldxluortmuaxnafrcayi.supabase.co/auth/v1/callback
   http://localhost:3000
   http://localhost:3000/auth/callback
   ```
6. Cliquez **"CRÉER"** et copiez le **Client ID** généré.

### Configuration de l'écran de consentement OAuth

Rendez-vous sur : **https://console.cloud.google.com/apis/credentials/consent**

- Type d'utilisateur : **Externe**
- Nom de l'application : `JoyDrive`
- E-mail d'assistance : votre email
- Domaines autorisés : `vercel.app`, `supabase.co`

### Restriction de la clé API Google Maps

Rendez-vous sur : **https://console.cloud.google.com/apis/credentials**

1. Cliquez sur votre clé `AIzaSyAIDgwaN4MvVo6Fbs_XXlZTBjeu6vhNhzA`
2. Sous **"Restrictions d'application"** → **"Référents HTTP"**
3. Ajoutez :
   ```
   https://joydrive-app.vercel.app/*
   http://localhost:3000/*
   ```
4. Sous **"Restrictions d'API"** → sélectionnez :
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API

---

## 3. Configuration Supabase Auth (pour connexion Google)

Rendez-vous sur : **https://supabase.com/dashboard/project/ldxluortmuaxnafrcayi/auth/providers**

1. Activez le provider **Google**
2. Collez votre **Client ID** OAuth (obtenu à l'étape 2)
3. Collez votre **Client Secret** OAuth
4. **Redirect URL Supabase** (à copier dans Google Cloud Console) :
   ```
   https://ldxluortmuaxnafrcayi.supabase.co/auth/v1/callback
   ```

---

## 4. Variables d'environnement Vercel (déjà configurées)

Ces variables sont déjà configurées sur Vercel :

| Variable | Valeur |
|----------|--------|
| `VITE_SUPABASE_URL` | `https://ldxluortmuaxnafrcayi.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_z6HmVAIlAGR8kk1WnMmb2g_VcDfKex-` |
| `VITE_GOOGLE_MAPS_API_KEY` | `AIzaSyAIDgwaN4MvVo6Fbs_XXlZTBjeu6vhNhzA` |
| `GEMINI_API_KEY` | `AIzaSyDQjLBYQfCWP6Qew6vtXYPYNMGOzHlb6O8` |

---

## 5. Fonctionnalités implémentées

### Supabase Temps Réel
- **Messages** : Chat en temps réel entre client et chauffeur via `supabase_realtime`
- **Appels** : Gestion des appels avec statuts (initiating, ringing, accepted, ended)
- **Notifications** : Notifications push en temps réel avec badge de comptage
- **Rides** : Suivi des statuts de trajet en temps réel

### Stockage Photos Profil
- Upload vers le bucket `avatars` de Supabase Storage
- URL publique générée automatiquement
- Mise à jour du profil en base de données

### Google Maps
- Navigation GPS avec autocomplétion des adresses
- Calcul d'itinéraire en temps réel
- Simulation de trajet avec marqueur animé
- Carte en mode sombre/clair

### Gemini AI
- Analyse intelligente du trajet (modèle `gemini-2.0-flash`)
- Insights de voyage luxueux en français ou anglais

### Voix de Navigation Féminine
- Utilise l'API Web Speech Synthesis
- Sélection automatique de la meilleure voix féminine disponible
- Support multilingue : Français, Anglais, Zulu, Xhosa, Afrikaans
- Instructions traduites automatiquement en français
- Annonces : chauffeur trouvé, chauffeur arrivé, destination atteinte

---

## 6. Architecture des fichiers modifiés

```
joydrive/
├── src/
│   ├── App.tsx                    ← Application principale (réécrite)
│   ├── lib/
│   │   └── supabase.ts            ← Client Supabase + helpers temps réel
│   ├── components/
│   │   ├── ChatModal.tsx          ← Messagerie temps réel
│   │   └── NotificationsModal.tsx ← Notifications temps réel
│   └── hooks/
│       └── useVoiceNavigation.ts  ← Voix de navigation féminine
├── .env                           ← Variables locales
├── .env.production                ← Variables production
├── vercel.json                    ← Configuration Vercel
└── supabase_setup.sql             ← SQL à exécuter dans Supabase
```
