# Sobre a Plataforma de Gerenciamento de Parceiros

Autenticação, múltiplos níveis de acesso de usuário (roles), e um painel administrativo para gerenciamento de dados.

A aplicação permite que um Administrador gerencie uma rede de Líderes, que por sua vez indicam Parceiros. O sistema é focado em fornecer ao Admin dados sobre o desempenho de seus líderes e uma forma de comunicação centralizada.

## Funcionalidades Principais

- **Cadastro Público:** Formulário para novos "Parceiros" se cadastrarem, vinculados a um "Líder" existente.
- **Autenticação de Usuários:** Sistema completo de login e logout usando Supabase Auth.
- **Rotas Protegidas:** Uso de Middleware para proteger rotas, separando o acesso de usuários logados e não logados.
- **Níveis de Acesso (Roles):**
  - **Painel do Líder (`/painel`):** Área restrita onde líderes podem visualizar avisos enviados pelo Admin.
  - **Painel do Admin (`/admin`):** Área de gerenciamento completa com **Dashboard de Desempenho** (contagem de parceiros por líder) e **Gerenciamento de Avisos** (uma interface para o Administrador enviar e visualizar comunicados).

## Tecnologias Utilizadas

- **Framework:** [Next.js](https://nextjs.org/) (com App Router)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Backend e Banco de Dados:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, RPC Functions)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI:** [Shadcn/ui](https://ui.shadcn.com/)
- **Animações:** [Framer Motion](https://www.framer.com/motion/)
- **Ícones:** [Lucide React](https://lucide.dev/)

## Páginas e Rotas

1. `/`: Página inicial com informações, header com imagem e formulário de cadastro de Parceiros.
2. `/login`: Página de login para Líderes e Admin.
3. `/painel`: Painel do Líder (rota protegida), onde visualiza os comunicados do Admin.
4. `/admin/dashboard`: Dashboard do Administrador (rota protegida por role), exibe a performance dos líderes.
5. `/admin/announcements`: Gerenciamento de avisos do Administrador (rota protegida por role), permite enviar e ver histórico de avisos.

## Como Rodar Localmente

Para executar este projeto em um ambiente de desenvolvimento local, siga os passos:

1.  **Pré-requisitos:** Certifique-se de ter o [Node.js](https://nodejs.org/) (versão 20 ou superior) instalado.
2.  **Clone o repositório e Instale as dependências:**
    ```bash
    git clone [https://github.com/estevao-reis/juntos-por-mais.git](https://github.com/estevao-reis/juntos-por-mais.git)
    cd juntos-por-mais

    npm install
    ```
3.  **Configure o Banco de Dados no Supabase:**
    - Crie um novo projeto em [supabase.com](https://supabase.com/).
    - Navegue até o **SQL Editor**.
    - Copie todo o conteúdo do arquivo `supabase/schema.sql` e cole no editor.
    - Clique em **"RUN"** para criar todas as tabelas, tipos e funções de uma só vez.
4.  **Configure as Variáveis de Ambiente:**
    - Crie um arquivo chamado `.env.local` na raiz do projeto.
    - Adicione as chaves do seu projeto Supabase (a URL e a chave de API anônima (pública)).
    ```env
    NEXT_PUBLIC_SUPABASE_URL=SUA_URL_DO_PROJETO_SUPABASE
    NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLICA
    ```
5.  **Rode o servidor:**
    ```bash
    npm run dev
    ```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.
