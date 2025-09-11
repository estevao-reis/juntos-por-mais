-- =============================================================================
-- Supabase Schema: Juntos por Mais
-- Versão: 1.1
-- Descrição: Script completo para configurar o banco de dados, incluindo
--            tabelas, tipos, funções RPC, triggers e políticas de segurança.
-- Este script é re-executável, mas o bloco de limpeza deve ser usado
-- apenas em ambientes de desenvolvimento para evitar perda de dados.
-- =============================================================================


-- =============================================================================
-- SEÇÃO 0: LIMPEZA (USAR APENAS EM AMBIENTES DE DESENVOLVIMENTO)
-- Remove objetos existentes para garantir uma recriação limpa.
-- =============================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.get_my_role();
DROP FUNCTION IF EXISTS public.get_leader_partner_counts();
DROP FUNCTION IF EXISTS public.get_dashboard_insights();
DROP FUNCTION IF EXISTS public.get_event_registrants_with_details(text);
DROP FUNCTION IF EXISTS public.get_event_stats();
DROP FUNCTION IF EXISTS public.get_supporters_by_region_counts();
DROP TABLE IF EXISTS public."EventRegistrations";
DROP TABLE IF EXISTS public."Announcements";
DROP TABLE IF EXISTS public."Events";
DROP TABLE IF EXISTS public."Users";
DROP TABLE IF EXISTS public."AdministrativeRegions";
DROP TYPE IF EXISTS public.user_role;


-- =============================================================================
-- SEÇÃO 1: TIPOS E TABELAS
-- Define a estrutura fundamental dos dados da aplicação.
-- =============================================================================

-- TIPO: Define os papéis de usuário possíveis no sistema.
CREATE TYPE public.user_role AS ENUM ('ADMIN', 'LEADER', 'SUPPORTER');

-- TABELA: Armazena as Regiões Administrativas do DF.
CREATE TABLE public."AdministrativeRegions" (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);

-- DADOS INICIAIS: Popula a tabela com as 35 RAs do DF.
INSERT INTO public."AdministrativeRegions" (name) VALUES
('Plano Piloto'), ('Gama'), ('Taguatinga'), ('Brazlândia'), ('Sobradinho'), ('Planaltina'), ('Paranoá'), ('Núcleo Bandeireante'), ('Ceilândia'), ('Guará'), ('Cruzeiro'), ('Samambaia'), ('Santa Maria'), ('São Sebastião'), ('Recanto das Emas'), ('Lago Sul'), ('Riacho Fundo'), ('Lago Norte'), ('Candangolândia'), ('Águas Claras'), ('Riacho Fundo II'), ('Sudoeste/Octogonal'), ('Varjão'), ('Park Way'), ('SCIA'), ('Sobradinho II'), ('Jardim Botânico'), ('Itapoã'), ('SIA'), ('Vicente Pires'), ('Fercal'), ('Sol Nascente/Pôr do Sol'), ('Arniqueira'), ('Arapoanga'), ('Água Quente');

-- TABELA: Tabela central que armazena todos os usuários, sejam apoiadores, líderes ou admins.
CREATE TABLE public."Users" (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid NULL UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL, -- Vincula ao sistema de autenticação do Supabase
  created_at timestamptz NOT NULL DEFAULT now(),
  name text,
  email text UNIQUE,
  phone_number text,
  region_id uuid REFERENCES public."AdministrativeRegions"(id),
  profile_picture_url text,
  birth_date date,
  occupation text,
  role public.user_role,
  leader_id uuid REFERENCES public."Users"(id) ON DELETE SET NULL, -- Auto-relacionamento para indicar quem indicou
  cpf text UNIQUE,
  motivation text
);

-- TABELA: Armazena os comunicados enviados pelos administradores para os líderes.
CREATE TABLE public."Announcements" (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  content text NOT NULL,
  author_id uuid NOT NULL REFERENCES public."Users"(id) ON DELETE CASCADE,
  target_audience text NOT NULL DEFAULT 'ALL_LEADERS'::text
);

-- TABELA: Armazena os eventos criados pelos administradores.
CREATE TABLE public."Events" (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE, -- URL amigável para o evento
  description text,
  event_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- TABELA: Tabela de junção para registrar a inscrição de um usuário em um evento.
CREATE TABLE public."EventRegistrations" (
  event_id uuid NOT NULL REFERENCES public."Events"(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public."Users"(id) ON DELETE CASCADE,
  leader_id uuid NULL REFERENCES public."Users"(id) ON DELETE SET NULL, -- Quem indicou a inscrição
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id) -- Garante que um usuário só se inscreva uma vez por evento
);


-- =============================================================================
-- SEÇÃO 2: FUNÇÕES E TRIGGERS
-- Lógica de negócio automatizada e endpoints de dados (RPC).
-- SECURITY DEFINER: Permite que a função seja executada com os privilégios de quem a criou (admin).
-- =============================================================================

-- FUNÇÃO: Obtém o papel (role) do usuário autenticado atualmente.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT "role" FROM public."Users" WHERE auth_id = auth.uid()
$$;

-- FUNÇÃO TRIGGER: Sincroniza novos usuários do `auth.users` para a tabela `public.Users`.
-- Se o email já existe (um apoiador se tornando líder), atualiza o `auth_id`.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public."Users" (auth_id, email, name, role, cpf, phone_number, region_id, birth_date, occupation, motivation)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    'LEADER',
    new.raw_user_meta_data->>'cpf',
    new.raw_user_meta_data->>'phone_number',
    (new.raw_user_meta_data->>'region_id')::uuid,
    (new.raw_user_meta_data->>'birth_date')::date,
    new.raw_user_meta_data->>'occupation',
    new.raw_user_meta_data->>'motivation'
  )
  ON CONFLICT (email) DO UPDATE
  SET auth_id = new.id;

  RETURN new;
END;
$$;

-- TRIGGER: Dispara a função `handle_new_user` após a criação de um novo usuário no sistema de autenticação.
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- FUNÇÃO RPC: Retorna a contagem de apoiadores por líder, para o ranking.
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

-- FUNÇÃO RPC: Retorna métricas gerais para o dashboard do administrador.
CREATE OR REPLACE FUNCTION public.get_dashboard_insights()
RETURNS TABLE (total_supporters bigint, total_leaders bigint, total_events bigint, total_registrations bigint)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public."Users" WHERE role = 'SUPPORTER') as total_supporters,
    (SELECT COUNT(*) FROM public."Users" WHERE role = 'LEADER') as total_leaders,
    (SELECT COUNT(*) FROM public."Events") as total_events,
    (SELECT COUNT(*) FROM public."EventRegistrations") as total_registrations;
END;
$$;

-- FUNÇÃO RPC: Retorna a lista detalhada de inscritos para um evento específico.
CREATE OR REPLACE FUNCTION public.get_event_registrants_with_details(p_event_slug text)
RETURNS TABLE (supporter_name text, supporter_region text, leader_name text)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.name as supporter_name,
    ar.name as supporter_region,
    l.name as leader_name
  FROM public."EventRegistrations" er
  JOIN public."Events" e ON er.event_id = e.id
  JOIN public."Users" u ON er.user_id = u.id
  LEFT JOIN public."Users" l ON er.leader_id = l.id
  LEFT JOIN public."AdministrativeRegions" ar ON u.region_id = ar.id
  WHERE e.slug = p_event_slug
  ORDER BY l.name, u.name;
END;
$$;

-- FUNÇÃO RPC: Retorna estatísticas de eventos para o painel do líder.
CREATE OR REPLACE FUNCTION public.get_event_stats()
RETURNS TABLE (event_id uuid, event_name text, event_date timestamptz, event_slug text, total_registrations bigint, my_registrations bigint)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    current_leader_id uuid;
BEGIN
    SELECT id INTO current_leader_id FROM public."Users" WHERE auth_id = auth.uid();
    RETURN QUERY
    SELECT
        e.id as event_id,
        e.name as event_name,
        e.event_date as event_date,
        e.slug as event_slug,
        COUNT(er.user_id) as total_registrations,
        COUNT(er.user_id) FILTER (WHERE er.leader_id = current_leader_id) as my_registrations
    FROM public."Events" e
    LEFT JOIN public."EventRegistrations" er ON e.id = er.event_id
    WHERE e.event_date >= now()
    GROUP BY e.id
    ORDER BY e.event_date ASC;
END;
$$;

-- FUNÇÃO RPC: Retorna a contagem de apoiadores por região, para os gráficos do admin.
CREATE OR REPLACE FUNCTION public.get_supporters_by_region_counts()
RETURNS TABLE (region_name text, supporter_count bigint)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    ra.name as region_name,
    count(u.id) as supporter_count
  FROM public."AdministrativeRegions" as ra
  LEFT JOIN public."Users" as u ON ra.id = u.region_id AND u.role = 'SUPPORTER'
  GROUP BY ra.name
  ORDER BY supporter_count DESC, region_name ASC;
END;
$$;


-- =============================================================================
-- SEÇÃO 3: STORAGE
-- Configuração do bucket para armazenamento de arquivos (fotos de perfil).
-- =============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- SEÇÃO 4: POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- Regras que definem quem pode ver e modificar quais linhas em cada tabela.
-- =============================================================================
ALTER TABLE public."Users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Announcements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AdministrativeRegions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EventRegistrations" ENABLE ROW LEVEL SECURITY;

-- Políticas para "Users"
CREATE POLICY "Acesso total para Admins" ON public."Users" FOR ALL USING (public.get_my_role() = 'ADMIN');
CREATE POLICY "Usuários podem ver e editar seu próprio perfil" ON public."Users" FOR ALL USING (auth_id = auth.uid());
CREATE POLICY "Leitura pública de nomes de líderes" ON public."Users" FOR SELECT USING (role = 'LEADER');
CREATE POLICY "Public can create new supporter users" ON public."Users" FOR INSERT WITH CHECK (role = 'SUPPORTER'::user_role);
CREATE POLICY "Public can read user emails for checking existence" ON public."Users" FOR SELECT USING (true);

-- Políticas para "Announcements"
CREATE POLICY "Admins podem gerenciar avisos" ON public."Announcements" FOR ALL USING (public.get_my_role() = 'ADMIN');
CREATE POLICY "Usuários logados podem ver avisos" ON public."Announcements" FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para "AdministrativeRegions"
CREATE POLICY "Leitura pública das RAs" ON public."AdministrativeRegions" FOR SELECT USING (true);

-- Políticas para "Events"
CREATE POLICY "Admins can manage events" ON public."Events" FOR ALL USING (public.get_my_role() = 'ADMIN');
CREATE POLICY "Public and authenticated users can view events" ON public."Events" FOR SELECT USING (true);

-- Políticas para "EventRegistrations"
CREATE POLICY "Admins can manage all registrations" ON public."EventRegistrations" FOR ALL USING (public.get_my_role() = 'ADMIN');
CREATE POLICY "Users can see their own registrations" ON public."EventRegistrations" FOR SELECT USING (user_id IN (SELECT id FROM public."Users" WHERE auth_id = auth.uid()));
CREATE POLICY "Leaders can see registrations they referred" ON public."EventRegistrations" FOR SELECT USING (leader_id IN (SELECT id FROM public."Users" WHERE auth_id = auth.uid()));


-- =============================================================================
-- SEÇÃO 5: PERMISSÕES DE EXECUÇÃO DE FUNÇÕES
-- Concede permissão para que os usuários possam chamar as funções RPC.
-- =============================================================================
GRANT EXECUTE ON FUNCTION public.get_my_role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_leader_partner_counts() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_dashboard_insights() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_event_registrants_with_details(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_event_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_supporters_by_region_counts() TO anon, authenticated;