# Juntos por Mais - Plataforma Estevão Reis

Juntos por Mais é uma aplicação full-stack construída com Next.js e Supabase. Ela serve como uma plataforma completa para a gestão de uma rede de apoiadores e líderes, com múltiplos níveis de acesso, painéis de controle interativos, gerenciamento de eventos e ferramentas de análise de dados.

## Arquitetura e Níveis de Acesso

O sistema gerencia três tipos de perfis:

-   **Supporters (Apoiadores):** Registros públicos de pessoas que apoiam a causa. O cadastro não requer autenticação e é feito pela página inicial.
-   **Leaders (Líderes):** Usuários autenticados que possuem acesso a um painel para gerenciar seus indicados, compartilhar links de convite e acompanhar métricas de engajamento.
-   **Admins (Administradores):** Usuários com controle total sobre a plataforma, incluindo gerenciamento de usuários, eventos, comunicados e acesso a um dashboard com análises visuais.

### Funcionalidades Principais

-   **✅ Cadastro Unificado:** Formulário único na página inicial para apoiadores, com suporte a links de referência de líderes (`/?ref=ID_DO_LIDER`).
-   **✅ Upgrade de Apoiador para Líder:** Um apoiador pode se tornar líder usando o mesmo e-mail, e o sistema atualiza seu perfil para o role `LEADER`, criando suas credenciais de acesso sem duplicidade.
-   **✅ Gestão de Perfil:** Usuários autenticados (`Leader`, `Admin`) podem editar suas informações pessoais e **fazer upload de uma foto de perfil**.
-   **✅ Recuperação de Senha:** Fluxo completo de "esqueci minha senha", com envio de link para o e-mail e página para redefinição.
-   **✅ Painel do Líder (`/painel`):**
    -   Visualização da lista de apoiadores indicados.
    -   Ranking de líderes para gamificação e engajamento.
    -   Acompanhamento de próximos eventos, com contagem total de inscritos e de indicados diretos.
    -   Mural de avisos enviados pelos administradores.
-   **✅ Painel do Administrador (`/admin`):**
    -   **Dashboard de Análise:** Métricas gerais e **gráfico de distribuição** de apoiadores por Região Administrativa.
    -   **Gerenciamento de Avisos:** CRUD completo para comunicados enviados aos líderes.
    -   **Gerenciamento de Eventos:** CRUD completo para eventos.
    -   **Lista de Inscritos:** Visualização detalhada de todos os inscritos em um evento, com a opção de **exportar a lista para PDF**.
    -   **Gerenciamento de Usuários:** Tabela completa com todos os usuários, com filtros, busca, e ações para:
        -   Visualizar detalhes do usuário em um modal.
        -   Editar informações essenciais (e-mail, CPF).
        -   Alterar a permissão (`role`) de `LEADER` para `ADMIN`.
        -   Excluir usuários da plataforma.
-   **✅ Rotas Protegidas:** Uso de Middleware para proteger as rotas `/painel` e `/admin`, redirecionando usuários não autenticados para a página de login.

## Tecnologias Utilizadas

-   **Framework:** [Next.js](https://nextjs.org/) (com App Router)
-   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
-   **Backend e Banco de Dados:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Triggers e Funções RPC)
-   **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
-   **Componentes UI:** [Shadcn/ui](https://ui.shadcn.com/)
-   **Gráficos:** [Recharts](https://recharts.org/)
-   **Ícones:** [Lucide React](https://lucide.dev/)
-   **Geração de PDF:** [jsPDF](https://github.com/parallax/jsPDF) & [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)

## Páginas e Rotas

-   `/`: Página inicial com apresentação, causas e formulário de cadastro para **Apoiadores**.
-   `/login`: Página de autenticação para Líderes e Administradores.
-   `/recuperar-senha`: Formulário para solicitar o link de redefinição de senha.
-   `/atualizar-senha`: Página acessada pelo link de e-mail para criar uma nova senha.
-   `/seja-um-lider`: Formulário de cadastro para novos **Líderes**.
-   `/painel`: Dashboard do **Líder** (rota protegida).
-   `/painel/perfil`: Página para o usuário editar seu perfil e foto.
-   `/eventos/[slug]`: Página pública de um evento com detalhes e formulário de inscrição.
-   `/admin/dashboard`: Dashboard principal do **Administrador** com métricas e gráficos (rota protegida).
-   `/admin/announcements`: Painel para gerenciar avisos.
-   `/admin/events`: Painel para criar e gerenciar eventos.
-   `/admin/events/[slug]`: Página de detalhes de um evento com a lista de inscritos.
-   `/admin/usuarios`: Painel para gerenciar todos os usuários.

## Como Rodar Localmente

1.  **Pré-requisitos:** Node.js (versão 20+).

2.  **Clone e Instale:**
    ```bash
    git clone [https://github.com/estevao-reis/juntos-por-mais.git](https://github.com/estevao-reis/juntos-por-mais.git)
    cd juntos-por-mais
    npm install
    ```

3.  **Configure o Supabase:**
    -   Crie um projeto em [supabase.com](https://supabase.com/).
    -   Navegue até o **SQL Editor**.
    -   Copie **todo** o conteúdo do arquivo `supabase/squema.sql` e execute-o. Este script é re-executável e irá configurar todas as tabelas, funções, gatilhos e políticas de segurança.

4.  **Variáveis de Ambiente:**
    -   Crie um arquivo `.env` na raiz do projeto.
    -   Adicione as chaves do seu projeto Supabase (encontradas em **Project Settings > API**).
    ```env
    NEXT_PUBLIC_SUPABASE_URL=SUA_URL_DO_PROJETO_SUPABASE
    NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLICA
    SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_SERVICE_ROLE_SECRETA
    
    # Para desenvolvimento local, use http://localhost:3000
    # Para produção, use a URL final (ex: https://juntos-por-mais.vercel.app)
    NEXT_PUBLIC_SITE_URL=http://localhost:3000
    ```
    > **Importante:** A `SUPABASE_SERVICE_ROLE_KEY` é secreta e usada para ações administrativas no servidor. Nunca a exponha no lado do cliente. A `NEXT_PUBLIC_SITE_URL` é necessária para que os links de recuperação de senha funcionem corretamente.

6.  **Rode o Servidor de Desenvolvimento:**
    ```bash
    npm run dev
    ```
    Acesse [http://localhost:3000](http://localhost:3000).

## Criando o Primeiro Administrador

1.  Use o formulário em `/seja-um-lider` para criar seu primeiro usuário.
2.  Confirme o e-mail (se a opção estiver ativa no seu projeto Supabase).
3.  Acesse seu painel do Supabase -> Table Editor -> tabela `Users`.
4.  Encontre o usuário recém-criado e altere sua `role` de `LEADER` para `ADMIN`.
5.  Faça login com este usuário para acessar as funcionalidades de administrador.