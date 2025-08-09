Uma aplicação full-stack construída com Next.js e Supabase que permite a gestão de uma rede de apoiadores e líderes, com múltiplos níveis de acesso, painéis de controle e funcionalidades de gerenciamento completas.

## Arquitetura e Funcionalidades

O sistema gerencia dois tipos principais de perfis:
- **Supporters (Apoiadores):** Registros de pessoas que apoiam a causa. O cadastro é público e não requer autenticação.
- **Usuários Autenticados (Leaders & Admins):** Usuários com login e senha que possuem acesso a painéis de controle.

### Funcionalidades Principais

- **Cadastro Público:** Formulários para **Apoiadores** (`/cadastro`) e para aspirantes a **Líderes** (`/seja-um-lider`).
- **Upgrade de Apoiador para Líder:** Se um apoiador já cadastrado utiliza o formulário para se tornar líder com o mesmo e-mail, o sistema automaticamente atualiza seu perfil, convertendo-o em líder sem criar uma nova conta.
- **Autenticação e Perfis:** Sistema completo de login/logout via Supabase Auth. A criação de um perfil na tabela `Users` é automatizada por um **Trigger** do PostgreSQL no momento do cadastro.
- **Gestão de Perfil:** Usuários logados podem editar suas informações e fazer upload de uma foto de perfil, que é armazenada no Supabase Storage.
- **Link de Convite:** Líderes têm acesso a um link de convite exclusivo para recrutar novos apoiadores.
- **Painel do Líder (`/painel`):** Um dashboard onde o líder pode visualizar a lista de apoiadores que indicou e ler os avisos do administrador.
- **Painel do Admin (`/admin`):**
  - **Dashboard de Desempenho:** Visualiza a contagem de apoiadores por líder.
  - **Gerenciamento de Avisos:** Envia, edita e exclui comunicados para os líderes.
  - **Gerenciamento de Usuários:** Visualiza todos os usuários e pode promover Líderes a Administradores, editar informações sensíveis (e-mail, CPF) e excluir usuários da plataforma.
- **Rotas Protegidas:** Uso de Middleware para proteger rotas com base na autenticação do usuário.

## Tecnologias Utilizadas

- **Framework:** [Next.js](https://nextjs.org/) (com App Router)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Backend e Banco de Dados:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Triggers e Funções RPC)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI:** [Shadcn/ui](https://ui.shadcn.com/)
- **Ícones:** [Lucide React](https://lucide.dev/)

## Páginas e Rotas

1.  `/`: Página inicial com informações e formulário de cadastro para **Apoiadores**.
2.  `/login`: Página de autenticação para Líderes e Administradores.
3.  `/cadastro`: Formulário público para cadastro de novos Apoiadores. Também lida com links de convite (ex: `/cadastro?ref=ID_DO_LIDER`).
4.  `/seja-um-lider`: Formulário de cadastro para novos **Líderes**. Caso um **Apoiador** já cadastrado use o mesmo e-mail, sua conta é automaticamente atualizada para o perfil de Líder.
5.  `/painel`: Dashboard do **Líder** (rota protegida), exibindo seus apoiadores indicados e o mural de avisos.
6.  `/painel/perfil`: Página para o usuário logado (Líder/Admin) editar suas informações, carregar foto e obter seu link de convite.
7.  `/admin/dashboard`: Dashboard principal do **Administrador** (rota protegida) com o relatório de desempenho dos líderes.
8.  `/admin/announcements`: Painel para o Admin gerenciar os avisos para os líderes.
9.  `/admin/usuarios`: Painel para o Admin visualizar todos os usuários e gerenciar suas permissões, informações e existência na plataforma.

## Como Rodar Localmente

1.  **Pré-requisitos:** Node.js (versão 20+).
2.  **Clone e Instale:**
    ```bash
    git clone [https://github.com/estevao-reis/juntos-por-mais.git](https://github.com/estevao-reis/juntos-por-mais.git)
    cd juntos-por-mais
    npm install
    ```
3.  **Configure o Supabase:**
    - Crie um projeto em [supabase.com](https://supabase.com/).
    - Navegue até o **SQL Editor**.
    - Copie **todo** o conteúdo do arquivo `supabase/squema.sql` e execute-o. Isso criará as tabelas, roles, o trigger de perfis e as políticas do Storage.
4.  **Variáveis de Ambiente:**
    - Crie um arquivo `.env.local` na raiz.
    - Adicione as chaves do seu projeto Supabase:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=SUA_URL_DO_PROETO_SUPABASE
    NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLICA
    ```
5.  **Rode o Servidor:**
    ```bash
    npm run dev
    ```
Acesse [http://localhost:3000](http://localhost:3000).

## Criando o Primeiro Administrador

1.  Use o formulário em `/seja-um-lider` para criar um novo usuário `LEADER`.
2.  Confirme o e-mail do usuário, se a confirmação estiver ativa.
3.  Acesse o painel do Supabase -> Table Editor -> tabela `Users`.
4.  Altere a `role` do usuário recém-criado de `LEADER` para `ADMIN`.
5.  Faça login com este usuário para acessar as funcionalidades de administrador.