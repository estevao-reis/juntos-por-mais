-- Supabase Schema Setup (Versão Robusta e Re-executável)

-- Bloco de Limpeza (DROP): Executado na ordem inversa de dependência para evitar erros.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.get_leader_partner_counts();
DROP TABLE IF EXISTS public."Announcements";
DROP TABLE IF EXISTS public."Users";
DROP TABLE IF EXISTS public."AdministrativeRegions";
DROP TYPE IF EXISTS public.user_role;

-- Bloco de Criação (CREATE): Executado na ordem correta de dependência.

-- 1. Criar o tipo ENUM 'user_role'
CREATE TYPE public.user_role AS ENUM (
  'ADMIN',
  'LEADER',
  'SUPPORTER'
);

-- 2. Criar a tabela 'AdministrativeRegions'
CREATE TABLE public."AdministrativeRegions" (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);

-- Populando com as 35 RAs do DF
INSERT INTO public."AdministrativeRegions" (name) VALUES
('Plano Piloto'), ('Gama'), ('Taguatinga'), ('Brazlândia'), ('Sobradinho'), ('Planaltina'), ('Paranoá'), ('Núcleo Bandeireante'), ('Ceilândia'), ('Guará'), ('Cruzeiro'), ('Samambaia'), ('Santa Maria'), ('São Sebastião'), ('Recanto das Emas'), ('Lago Sul'), ('Riacho Fundo'), ('Lago Norte'), ('Candangolândia'), ('Águas Claras'), ('Riacho Fundo II'), ('Sudoeste/Octogonal'), ('Varjão'), ('Park Way'), ('SCIA'), ('Sobradinho II'), ('Jardim Botânico'), ('Itapoã'), ('SIA'), ('Vicente Pires'), ('Fercal'), ('Sol Nascente/Pôr do Sol'), ('Arniqueira'), ('Arapoanga'), ('Água Quente');

-- 3. Criar a tabela 'Users'
CREATE TABLE public."Users" (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid NULL UNIQUE, 
  created_at timestamptz NOT NULL DEFAULT now(),
  
  name text,
  email text UNIQUE,
  phone_number text, 
  region_id uuid,
  
  profile_picture_url text,
  birth_date date,
  occupation text,
  interests text[],

  role public.user_role, 
  leader_id uuid,
  cpf text UNIQUE,
  motivation text,

  CONSTRAINT "Users_auth_id_fkey" FOREIGN KEY (auth_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT "Users_leader_id_fkey" FOREIGN KEY (leader_id) REFERENCES "Users"(id) ON DELETE SET NULL,
  CONSTRAINT "Users_region_id_fkey" FOREIGN KEY (region_id) REFERENCES "AdministrativeRegions"(id)
);

-- 4. Criar a tabela 'Announcements'
CREATE TABLE public."Announcements" (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  content text NOT NULL,
  author_id uuid NOT NULL,
  target_audience text NOT NULL DEFAULT 'ALL_LEADERS'::text,
  CONSTRAINT "Announcements_author_id_fkey" FOREIGN KEY (author_id) REFERENCES "Users"(id) ON DELETE CASCADE
);

-- 5. Função e Trigger para criar perfil de usuário automaticamente (VERSÃO CORRIGIDA)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  -- Variáveis para armazenar os metadados de forma mais segura
  user_name text;
  user_phone_number text;
  user_region_id uuid;
  user_cpf text;
  user_birth_date date;
  user_occupation text;
  user_motivation text;
BEGIN
  -- Extrai todos os valores dos metadados para variáveis locais primeiro
  user_name := new.raw_user_meta_data->>'name';
  user_phone_number := new.raw_user_meta_data->>'phone_number';
  user_region_id := (new.raw_user_meta_data->>'region_id')::uuid;
  user_cpf := new.raw_user_meta_data->>'cpf'; -- Extração explícita do CPF
  user_birth_date := (new.raw_user_meta_data->>'birth_date')::date;
  user_occupation := new.raw_user_meta_data->>'occupation';
  user_motivation := new.raw_user_meta_data->>'motivation';

  INSERT INTO public."Users" (
    id, auth_id, email, name, role, 
    phone_number, region_id, cpf, birth_date, occupation, motivation
  )
  VALUES (
    new.id,
    new.id,
    new.email,
    user_name,
    'LEADER',
    user_phone_number,
    user_region_id,
    user_cpf, -- Usa a variável local
    user_birth_date,
    user_occupation,
    user_motivation
  );
  RETURN new;
END;
$$;


CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Função RPC 'get_leader_partner_counts'
CREATE OR REPLACE FUNCTION public.get_leader_partner_counts()
RETURNS TABLE (
  leader_id uuid,
  leader_name text,
  partner_count bigint
)
AS $$
BEGIN
  RETURN QUERY
  SELECT
    leaders.id as leader_id,
    leaders.name as leader_name,
    count(partners.id) as partner_count
  FROM
    public."Users" as leaders
  LEFT JOIN
    public."Users" as partners ON leaders.id = partners.leader_id AND partners.role = 'SUPPORTER'
  WHERE
    leaders.role = 'LEADER'
  GROUP BY
    leaders.id, leaders.name
  ORDER BY
    partner_count DESC,
    leader_name ASC;
END;
$$ LANGUAGE plpgsql;


-- 7. Configuração do Supabase Storage para Avatares
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly viewable."
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

CREATE POLICY "User can insert their own avatar."
ON storage.objects FOR INSERT
TO authenticated WITH CHECK ( (bucket_id = 'avatars') AND (auth.uid() = owner) );

CREATE POLICY "User can update their own avatar."
ON storage.objects FOR UPDATE
TO authenticated USING ( (bucket_id = 'avatars') AND (auth.uid() = owner) );

CREATE POLICY "User can delete their own avatar."
ON storage.objects FOR DELETE
TO authenticated USING ( (bucket_id = 'avatars') AND (auth.uid() = owner) );