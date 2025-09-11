# Juntos por Mais - Plataforma Estevão Reis

Juntos por Mais é uma aplicação full-stack construída com Next.js e Supabase. Ela serve como uma plataforma completa para a gestão de uma rede de apoiadores e líderes, com múltiplos níveis de acesso, painéis de controle interativos e ferramentas de análise de dados.

## Arquitetura e Funcionalidades

O sistema gerencia dois tipos principais de perfis:

-   **Supporters (Apoiadores):** Registros de pessoas que apoiam a causa. O cadastro é público, centralizado na página inicial e não requer autenticação.
-   **Usuários Autenticados (Leaders & Admins):** Usuários com login e senha que possuem acesso a painéis de controle com funcionalidades específicas.

### Funcionalidades Principais

-   **Jornada de Cadastro Unificada:** O formulário de cadastro para **Apoiadores** está integrado à página inicial, que agora serve como o principal ponto de entrada para novos membros, incluindo aqueles que chegam por links de convite.
-   **Upgrade de Apoiador para Líder:** Se um apoiador já cadastrado utiliza o formulário para se tornar líder com o mesmo e-mail, o sistema automaticamente atualiza seu perfil, criando suas credenciais de acesso e convertendo-o em líder sem duplicar a conta.
-   **Link de Convite Inteligente:** Líderes têm acesso a um link de convite (`/?ref=ID_DO_LIDER`) que direciona o novo apoiador para a página inicial completa, fornecendo contexto sobre o projeto antes do cadastro. O formulário é automaticamente preenchido com a indicação do líder.
-   **Painel do Líder (`/painel`):** Um dashboard onde o líder pode:
    -   Visualizar a lista de apoiadores que indicou.
    -   Acompanhar um **ranking de líderes** para incentivar o engajamento.
    -   Ver os próximos eventos com a **contagem total de inscritos** e quantos foram indicados por ele.
    -   Ler os avisos do administrador.
-   **Painel do Admin (`/admin`):**
    -   **Dashboard de Análise:** Visualiza métricas gerais e **gráficos interativos**, como a distribuição de apoiadores por região.
    -   **Gerenciamento de Avisos:** Envia, edita e exclui comunicados para os líderes.
    -   **Gerenciamento de Eventos:** Cria novos eventos, visualiza a lista de inscritos e pode **exportar a lista de participantes para PDF**.
    -   **Gerenciamento de Usuários:** Gerencia todos os perfis, podendo promover líderes a administradores, editar informações e visualizar detalhes completos em um modal.
-   **Gestão de Eventos:** Sistema completo para criação de eventos e inscrição pública, com atribuição de indicados para os líderes.
-   **Rotas Protegidas:** Uso de Middleware para proteger rotas (`/painel` e `/admin`) com base na autenticação do usuário.

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

1.  `/`: Página inicial que centraliza a apresentação do projeto, a seção "Causas", o formulário de cadastro para **Apoiadores** e a biografia. Também lida com links de convite (ex: `/?ref=ID_DO_LIDER`).
2.  `/login`: Página de autenticação para Líderes e Administradores.
3.  `/cadastro`: Rota legada que agora **redireciona** para a página inicial (`/#cadastro`), garantindo que links antigos continuem funcionando.
4.  `/seja-um-lider`: Formulário de cadastro para novos **Líderes**.
5.  `/painel`: Dashboard do **Líder** (rota protegida).
6.  `/painel/perfil`: Página para o usuário logado editar suas informações e foto.
7.  `/eventos/[slug]`: Página pública de um evento com informações e formulário de inscrição.
8.  `/admin/dashboard`: Dashboard principal do **Administrador** (rota protegida) com gráficos e métricas.
9.  `/admin/announcements`: Painel para o Admin gerenciar os avisos.
10. `/admin/events`: Painel para o Admin criar e gerenciar eventos.
11. `/admin/events/[slug]`: Página de detalhes de um evento para o admin, com a lista de inscritos.
12. `/admin/usuarios`: Painel para o Admin gerenciar todos os usuários da plataforma.

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
    -   Copie **todo** o conteúdo do arquivo `supabase/schema.sql` e execute-o. Este script é re-executável e irá configurar todas as tabelas, funções, gatilhos e políticas de segurança necessárias.

4.  **Variáveis de Ambiente:**
    -   Crie um arquivo `.env.local` na raiz do projeto.
    -   Adicione as chaves do seu projeto Supabase (encontradas em **Project Settings > API**).
    ```env
    NEXT_PUBLIC_SUPABASE_URL=SUA_URL_DO_PROJETO_SUPABASE
    NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLICA
    SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_SERVICE_ROLE_SECRETA
    ```
    > **Importante:** A `SUPABASE_SERVICE_ROLE_KEY` é secreta e usada para ações administrativas no servidor. Nunca a exponha no lado do cliente.

5.  **Rode o Servidor de Desenvolvimento:**
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