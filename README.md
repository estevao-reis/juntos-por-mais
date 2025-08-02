# Plataforma de Gerenciamento de Parceiros

Este projeto é um esqueleto full-stack, construído com as tecnologias mais modernas do ecossistema Next.js. Ele serve como uma base robusta para aplicações web que necessitam de autenticação, múltiplos níveis de acesso de usuário (roles), e um painel administrativo para gerenciamento de dados.

## 🚀 Sobre o Projeto

A aplicação permite que um Administrador gerencie uma rede de Líderes, que por sua vez indicam Parceiros. O sistema é focado em fornecer ao Admin dados sobre o desempenho de seus líderes e uma forma de comunicação centralizada.

## ✨ Funcionalidades Principais

- **Cadastro Público:** Formulário para novos "Parceiros" se cadastrarem, vinculados a um "Líder" existente.
- **Autenticação de Usuários:** Sistema completo de login e logout usando Supabase Auth.
- **Rotas Protegidas:** Uso de Middleware para proteger rotas, separando o acesso de usuários logados e não logados.
- **Níveis de Acesso (Roles):**
  - **Painel do Líder (`/painel`):** Área restrita onde líderes podem visualizar avisos enviados pelo Admin.
  - **Painel do Admin (`/admin`):** Área de gerenciamento completa com layout próprio (sidebar).
    - **Dashboard de Desempenho:** Visualização de dados com a contagem de parceiros por líder.
    - **Gerenciamento de Avisos:** Interface para o Admin enviar e visualizar comunicados.

## 🗺️ Telas da Aplicação

Uma visão geral das telas principais que compõem a aplicação:

1.  **Página Inicial e Cadastro** (`/`)
2.  **Login** (`/login`)
3.  **Painel do Líder** (`/painel`)
4.  **Dashboard do Administrador** (`/admin/dashboard`)
5.  **Gerenciamento de Avisos** (`/admin/announcements`)

## 🛠️ Tecnologias Utilizadas

- **Framework:** [Next.js](https://nextjs.org/) (com App Router)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Backend e Banco de Dados:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, RPC Functions)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI:** [Shadcn/ui](https://ui.shadcn.com/)
- **Animações:** [Framer Motion](https://www.framer.com/motion/)
- **Ícones:** [Lucide React](https://lucide.dev/)

## 📄 Páginas e Rotas (Detalhado)

- `/`: Página inicial com informações, header com imagem e formulário de cadastro de Parceiros.
- `/login`: Página de login para Líderes e Admin.
- `/painel`: Painel do Líder (rota protegida), onde visualiza os comunicados do Admin.
- `/admin/dashboard`: Dashboard do Admin (rota protegida por role), exibe a performance dos líderes.
- `/admin/announcements`: Gerenciamento de avisos do Admin (rota protegida por role), permite enviar e ver histórico de avisos.

## ⚙️ Como Rodar Localmente (Setup)

Para executar este projeto em um ambiente de desenvolvimento local, siga os passos:

1.  **Pré-requisitos:** Certifique-se de ter o [Node.js](https://nodejs.org/) (versão 20 ou superior) instalado.

2.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/estevao-reis/juntos-por-mais.git](https://github.com/estevao-reis/juntos-por-mais.git)
    cd juntos-por-mais
    ```

3.  **Instale as dependências:**
    ```bash
    npm install
    ```

4.  **Configure o Banco de Dados no Supabase:**
    - Crie um novo projeto em [supabase.com](https://supabase.com/).
    - Navegue até o **SQL Editor**.
    - Copie todo o conteúdo do arquivo `supabase/schema.sql` e cole no editor.
    - Clique em **"RUN"** para criar todas as tabelas, tipos e funções de uma só vez.

5.  **Configure as Variáveis de Ambiente:**
    - Crie um arquivo chamado `.env.local` na raiz do projeto.
    - Adicione as chaves do seu projeto Supabase (encontradas em *Project Settings > API*).
    ```env
    NEXT_PUBLIC_SUPABASE_URL=SUA_URL_DO_PROJETO_SUPABASE
    NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLICA
    ```

6.  **Rode o servidor:**
    ```bash
    npm run dev
    ```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🚀 Deploy

O deploy deste projeto é feito de forma contínua e automática pela **Vercel**.

- **Ambiente de Produção:** O site principal está ligado à branch `main` do repositório.
- **Processo:** Qualquer `git push` para a branch `main` acionará um novo build na Vercel, atualizando o site no ar em poucos minutos.
- **Configuração:** As variáveis de ambiente precisam ser configuradas no painel do projeto na Vercel para que o deploy funcione.

## 🔑 Variáveis de Ambiente

Para que a aplicação se conecte ao Supabase, as seguintes variáveis são necessárias no seu arquivo `.env.local` (para desenvolvimento local) e nas configurações do projeto na Vercel (para produção):

```env
NEXT_PUBLIC_SUPABASE_URL=SUA_URL_DO_PROJETO_SUPABASE
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLICA
```
- `NEXT_PUBLIC_SUPABASE_URL`: A URL do seu projeto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: A chave de API anônima (pública) do seu projeto.

Você pode encontrar ambas em *Project Settings > API* no seu painel do Supabase.

## 🔗 Links Úteis

- **Projeto no Ar (Produção):** `[http://juntos-por-mais.vercel.app]`
- **Painel do Supabase:** `[https://app.supabase.com/]`
- **Repositório no GitHub:** `[http://github.com/estevao-reis/juntos-por-mais]`