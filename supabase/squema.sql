-- Supabase Schema Setup
-- Este script contém todos os comandos necessários para configurar o banco de dados do zero.
-- Ordem de execução:
-- 1. Criar o tipo ENUM para as roles de usuário.
-- 2. Criar a tabela de Usuários (Users).
-- 3. Criar a tabela de Avisos (Announcements).
-- 4. Criar a função RPC para contagem de parceiros.
-- 5. (Opcional, mas recomendado) Adicionar políticas de segurança RLS.

-- 1. Criar o tipo ENUM 'user_role'
CREATE TYPE public.user_role AS ENUM (
  'ADMIN',
  'LEADER',
  'PARTNER'
);

-- 2. Criar a tabela 'Users'
-- Esta tabela armazena os perfis de todos os usuários.
CREATE TABLE public."Users" (
  id uuid NOT NULL PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  role public.user_role NOT NULL,
  leader_id uuid NULL,
  CONSTRAINT "Users_leader_id_fkey" FOREIGN KEY (leader_id) REFERENCES "Users"(id) ON DELETE SET NULL
);
-- Comentário: A coluna 'id' desta tabela deve ser o mesmo UUID da tabela 'auth.users' do Supabase Auth.

-- 3. Criar a tabela 'Announcements'
-- Esta tabela armazena os comunicados enviados pelo Admin para os Líderes.
CREATE TABLE public."Announcements" (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  content text NOT NULL,
  author_id uuid NOT NULL,
  target_audience text NOT NULL DEFAULT 'ALL_LEADERS'::text,
  CONSTRAINT "Announcements_author_id_fkey" FOREIGN KEY (author_id) REFERENCES "Users"(id) ON DELETE CASCADE
);

-- 4. Criar a função RPC 'get_leader_partner_counts'
-- Esta função busca todos os líderes e conta quantos parceiros cada um possui.
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
    public."Users" as partners ON leaders.id = partners.leader_id
  WHERE
    leaders.role = 'LEADER'
  GROUP BY
    leaders.id, leaders.name
  ORDER BY
    partner_count DESC,
    leader_name ASC;
END;
$$ LANGUAGE plpgsql;

-- 5. (Opcional) Ativar Row Level Security (RLS) para segurança
-- Estes comandos são o próximo passo para tornar a aplicação segura em produção.
-- Eles garantem que os usuários só possam ver os dados que têm permissão para ver.
/*
-- Habilitar RLS nas tabelas
ALTER TABLE public."Users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Announcements" ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
-- Permite que usuários autenticados vejam todos os perfis (pode ser refinado depois)
CREATE POLICY "Profiles are viewable by authenticated users." ON public."Users"
FOR SELECT USING (auth.role() = 'authenticated');

-- Permite que usuários autenticados vejam todos os avisos
CREATE POLICY "Announcements are viewable by authenticated users." ON public."Announcements"
FOR SELECT USING (auth.role() = 'authenticated');

-- Permite que usuários modifiquem o seu próprio perfil
CREATE POLICY "Users can update their own profile." ON public."Users"
FOR UPDATE USING (auth.uid() = id);
*/