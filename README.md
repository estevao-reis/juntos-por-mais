# Juntos por Mais - Site Estevão Reis

Juntos por Mais é uma aplicação full-stack construída com Next.js e Supabase que permite a gestão de uma rede de apoiadores e líderes, com múltiplos níveis de acesso, painéis de controle e funcionalidades de gerenciamento completas.

## Arquitetura e Funcionalidades

O sistema gerencia dois tipos principais de perfis:

  - **Supporters (Apoiadores):** Registros de pessoas que apoiam a causa. O cadastro é público e não requer autenticação.
  - **Usuários Autenticados (Leaders & Admins):** Usuários com login e senha que possuem acesso a painéis de controle.

### Funcionalidades Principais

  - **Cadastro Público:** Formulários para **Apoiadores** (`/cadastro`) e para aspirantes a **Líderes** (`/seja-um-lider`).
  - **Upgrade de Apoiador para Líder:** Se um apoiador já cadastrado utiliza o formulário para se tornar líder com o mesmo e-mail, o sistema automaticamente atualiza seu perfil, criando suas credenciais de acesso e convertendo-o em líder sem duplicar a conta.
  - **Autenticação e Perfis:** Sistema completo de login/logout via Supabase Auth. A criação de um perfil na tabela `Users` é automatizada por um **Trigger** do PostgreSQL no momento do cadastro.
  - **Gestão de Perfil:** Usuários logados podem editar suas informações e fazer upload de uma foto de perfil, que é armazenada no Supabase Storage.
  - **Link de Convite:** Líderes têm acesso a um link de convite exclusivo para recrutar novos apoiadores.
  - **Painel do Líder (`/painel`):** Um dashboard onde o líder pode visualizar a lista de apoiadores que indicou, ver os próximos eventos com seus links de convite e ler os avisos do administrador. Inclui botões para **compartilhamento rápido via WhatsApp**.
  - **Painel do Admin (`/admin`):**
      - **Dashboard de Desempenho:** Visualiza a contagem de apoiadores por líder e métricas gerais sobre eventos e inscrições.
      - **Gerenciamento de Avisos:** Envia, edita e exclui comunicados para os líderes.
      - **Gerenciamento de Eventos:** Cria novos eventos, visualiza a lista de inscritos para cada um e pode **exportar a lista de participantes para PDF**.
      - **Gerenciamento de Usuários:** Visualiza todos os usuários com **filtros por região e busca por nome/email**. Pode promover Líderes a Administradores, editar informações essenciais e excluir usuários da plataforma. Um **modal de detalhes** permite a visualização completa de todas as informações de um usuário, como ocupação e motivação.
  - **Gestão de Eventos:**
      - **Criação de Eventos (Admin):** Administradores podem criar eventos com nome, data e descrição.
      - **Inscrição Pública:** Qualquer pessoa pode se inscrever em um evento através de sua página pública. Se o participante não for um apoiador, um perfil de apoiador é criado automaticamente.
      - **Links de Convite para Eventos (Líder):** Líderes possuem links de convite específicos para cada evento, garantindo que as inscrições sejam atribuídas a eles.
  - **Rotas Protegidas:** Uso de Middleware para proteger rotas com base na autenticação do usuário.

## Tecnologias Utilizadas

  - **Framework:** [Next.js](https://nextjs.org/) (com App Router)
  - **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
  - **Backend e Banco de Dados:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Triggers e Funções RPC)
  - **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
  - **Componentes UI:** [Shadcn/ui](https://ui.shadcn.com/)
  - **Ícones:** [Lucide React](https://lucide.dev/)
  - **Geração de PDF:** [jsPDF](https://github.com/parallax/jsPDF) & [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)

## Páginas e Rotas

1.  `/`: Página inicial com informações e formulário de cadastro para **Apoiadores**.
2.  `/login`: Página de autenticação para Líderes e Administradores.
3.  `/cadastro`: Formulário público para cadastro de novos Apoiadores. Também lida com links de convite (ex: `/cadastro?ref=ID_DO_LIDER`).
4.  `/seja-um-lider`: Formulário de cadastro para novos **Líderes**. Caso um **Apoiador** já cadastrado use o mesmo e-mail, sua conta é automaticamente atualizada para o perfil de Líder.
5.  `/painel`: Dashboard do **Líder** (rota protegida), exibindo seus apoiadores indicados, o mural de avisos e a lista de próximos eventos.
6.  `/painel/perfil`: Página para o usuário logado (Líder/Admin) editar suas informações, carregar foto e obter seu link de convite.
7.  `/eventos/[slug]`: Página pública de um evento, contendo informações e o formulário de inscrição.
8.  `/admin/dashboard`: Dashboard principal do **Administrador** (rota protegida) com o relatório de desempenho dos líderes e métricas de eventos.
9.  `/admin/announcements`: Painel para o Admin gerenciar os avisos para os líderes.
10. `/admin/events`: Painel para o Admin criar novos eventos.
11. `/admin/events/[slug]`: Página onde o Admin pode visualizar a lista de todos os inscritos em um evento específico.
12. `/admin/usuarios`: Painel para o Admin visualizar todos os usuários e gerenciar suas permissões, informações e existência na plataforma.

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
      - Copie **todo** o conteúdo do arquivo `supabase/squema.sql` e execute-o. Este script é re-executável e irá configurar todas as tabelas, funções, gatilhos e políticas de segurança necessárias.

4.  **Variáveis de Ambiente:**

      - Crie um arquivo `.env.local` na raiz do projeto.
      - Adicione as chaves do seu projeto Supabase. Você pode encontrá-las em **Project Settings \> API** no seu painel Supabase.

    ```env
    NEXT_PUBLIC_SUPABASE_URL=SUA_URL_DO_PROJETO_SUPABASE
    NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLICA
    SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_SERVICE_ROLE_SECRETA
    ```

    > **Importante:** A `SUPABASE_SERVICE_ROLE_KEY` é necessária para ações administrativas no servidor, como a promoção de um Apoiador para Líder. **Nunca** a exponha no lado do cliente (não adicione o prefixo `NEXT_PUBLIC_`).

5.  **Rode o Servidor:**

    ```bash
    npm run dev
    ```

Acesse [http://localhost:3000](http://localhost:3000).

## Criando o Primeiro Administrador

1.  Use o formulário em `/seja-um-lider` para criar um novo usuário `LEADER`.
2.  Confirme o e-mail do usuário, se a confirmação estiver ativa em seu projeto Supabase.
3.  Acesse o painel do Supabase -> Table Editor -> tabela `Users`.
4.  Altere a `role` do usuário recém-criado de `LEADER` para `ADMIN`.
5.  Faça login com este usuário para acessar as funcionalidades de administrador.