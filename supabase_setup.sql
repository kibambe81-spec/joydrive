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
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete own profile." ON public.profiles FOR DELETE USING (auth.uid() = id);

CREATE POLICY "Users can view their own rides." ON public.rides FOR SELECT USING (client_id = auth.uid() OR driver_id = auth.uid());
CREATE POLICY "Clients can insert rides." ON public.rides FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "Users can update their own rides." ON public.rides FOR UPDATE USING (client_id = auth.uid() OR driver_id = auth.uid());

CREATE POLICY "Users can view their messages." ON public.messages FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "Users can insert messages." ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can view their calls." ON public.calls FOR SELECT USING (caller_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "Users can insert calls." ON public.calls FOR INSERT WITH CHECK (caller_id = auth.uid());
CREATE POLICY "Users can update their calls." ON public.calls FOR UPDATE USING (caller_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can view their notifications." ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their notifications." ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Anyone can insert notifications." ON public.notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Promotions are viewable by everyone." ON public.promotions FOR SELECT USING (true);

-- Activer le temps réel (Realtime) pour les tables nécessaires
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.calls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rides;

-- Créer le bucket de stockage pour les photos de profil
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

-- Politiques de stockage pour les avatars
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Anyone can upload an avatar." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Anyone can update their avatar." ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');
CREATE POLICY "Anyone can delete their avatar." ON storage.objects FOR DELETE USING (bucket_id = 'avatars');

-- Données de test : Promotion de bienvenue
INSERT INTO public.promotions (code, discount_percentage, valid_until)
VALUES ('WELCOME20', 20, NOW() + INTERVAL '30 days') ON CONFLICT (code) DO NOTHING;

-- Fonction pour supprimer les données de l'utilisateur lors de la suppression du compte
CREATE OR REPLACE FUNCTION public.handle_delete_user()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour supprimer les données de l'utilisateur après la suppression du compte auth
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_delete_user();
