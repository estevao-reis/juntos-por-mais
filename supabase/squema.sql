-- Supabase Schema Setup (Versão Final, Robusta e Re-executável)

-- Bloco de Limpeza (DROP): Garante que o script pode ser executado novamente sem erros.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.get_my_role();
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.get_leader_partner_counts();
DROP TABLE IF EXISTS public."Announcements";
DROP TABLE IF EXISTS public."Users";
DROP TABLE IF EXISTS public."AdministrativeRegions";
DROP TYPE IF EXISTS public.user_role;

-- Bloco de Criação (CREATE)

-- 1. Tipos e Tabelas
CREATE TYPE public.user_role AS ENUM ('ADMIN', 'LEADER', 'SUPPORTER');

CREATE TABLE public."AdministrativeRegions" (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);

-- Populando com as 35 RAs do DF
INSERT INTO public."AdministrativeRegions" (name) VALUES
('Plano Piloto'), ('Gama'), ('Taguatinga'), ('Brazlândia'), ('Sobradinho'), ('Planaltina'), ('Paranoá'), ('Núcleo Bandeireante'), ('Ceilândia'), ('Guará'), ('Cruzeiro'), ('Samambaia'), ('Santa Maria'), ('São Sebastião'), ('Recanto das Emas'), ('Lago Sul'), ('Riacho Fundo'), ('Lago Norte'), ('Candangolândia'), ('Águas Claras'), ('Riacho Fundo II'), ('Sudoeste/Octogonal'), ('Varjão'), ('Park Way'), ('SCIA'), ('Sobradinho II'), ('Jardim Botânico'), ('Itapoã'), ('SIA'), ('Vicente Pires'), ('Fercal'), ('Sol Nascente/Pôr do Sol'), ('Arniqueira'), ('Arapoanga'), ('Água Quente');

CREATE TABLE public."Users" (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid NULL UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  name text,
  email text UNIQUE,
  phone_number text, 
  region_id uuid REFERENCES public."AdministrativeRegions"(id),
  profile_picture_url text,
  birth_date date,
  occupation text,
  role public.user_role, 
  leader_id uuid REFERENCES public."Users"(id) ON DELETE SET NULL,
  cpf text UNIQUE,
  motivation text
);

CREATE TABLE public."Announcements" (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  content text NOT NULL,
  author_id uuid NOT NULL REFERENCES public."Users"(id) ON DELETE CASCADE,
  target_audience text NOT NULL DEFAULT 'ALL_LEADERS'::text
);

-- 2. Funções e Triggers
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT "role" FROM public."Users" WHERE auth_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public."Users" (auth_id, email, name, role, cpf, phone_number, region_id, birth_date, occupation, motivation)
  VALUES (
    new.id, new.email, new.raw_user_meta_data->>'name', 'LEADER',
    new.raw_user_meta_data->>'cpf', new.raw_user_meta_data->>'phone_number',
    (new.raw_user_meta_data->>'region_id')::uuid, (new.raw_user_meta_data->>'birth_date')::date,
    new.raw_user_meta_data->>'occupation', new.raw_user_meta_data->>'motivation'
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.get_leader_partner_counts()
RETURNS TABLE (leader_id uuid, leader_name text, partner_count bigint)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT l.id, l.name, count(p.id)
  FROM public."Users" as l
  LEFT JOIN public."Users" as p ON l.id = p.leader_id AND p.role = 'SUPPORTER'
  WHERE l.role = 'LEADER'
  GROUP BY l.id, l.name ORDER BY partner_count DESC, leader_name ASC;
END;
$$;

-- 3. Storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 4. Políticas de Segurança (RLS)
ALTER TABLE public."Users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Announcements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AdministrativeRegions" ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA "Users"
DROP POLICY IF EXISTS "Acesso total para Admins" ON public."Users";
CREATE POLICY "Acesso total para Admins" ON public."Users" FOR ALL USING (public.get_my_role() = 'ADMIN');

DROP POLICY IF EXISTS "Usuários podem ver e editar seu próprio perfil" ON public."Users";
CREATE POLICY "Usuários podem ver e editar seu próprio perfil" ON public."Users" FOR ALL USING (auth_id = auth.uid());

DROP POLICY IF EXISTS "Leitura pública de nomes de líderes" ON public."Users";
CREATE POLICY "Leitura pública de nomes de líderes" ON public."Users" FOR SELECT USING (role = 'LEADER');

-- POLÍTICAS PARA "Announcements"
DROP POLICY IF EXISTS "Admins podem gerenciar avisos" ON public."Announcements";
CREATE POLICY "Admins podem gerenciar avisos" ON public."Announcements" FOR ALL USING (public.get_my_role() = 'ADMIN');

DROP POLICY IF EXISTS "Usuários logados podem ver avisos" ON public."Announcements";
CREATE POLICY "Usuários logados podem ver avisos" ON public."Announcements" FOR SELECT USING (auth.role() = 'authenticated');

-- POLÍTICAS PARA "AdministrativeRegions"
DROP POLICY IF EXISTS "Leitura pública das RAs" ON public."AdministrativeRegions";
CREATE POLICY "Leitura pública das RAs" ON public."AdministrativeRegions" FOR SELECT USING (true);