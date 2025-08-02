# Project S - Plataforma de Gerenciamento de Parceiros

Este é um projeto full-stack construído com Next.js e Supabase, servindo como uma plataforma para gerenciamento de usuários com diferentes níveis de acesso (Admin, Líder, Parceiro). Ele foi desenhado para ser um esqueleto robusto e escalável para futuros projetos web modernos.

## 🚀 Sobre o Projeto

A aplicação permite que um Administrador gerencie uma rede de Líderes, que por sua vez indicam Parceiros. O sistema é focado em fornecer ao Admin dados sobre o desempenho de seus líderes e uma forma de comunicação centralizada.

## ✨ Funcionalidades

- **Página de Cadastro Pública:** Formulário para novos "Parceiros" se cadastrarem, vinculados a um "Líder" existente.
- **Autenticação de Usuários:** Sistema completo de login e logout usando Supabase Auth.
- **Rotas Protegidas:** Uso de Middleware para proteger rotas, separando o acesso de usuários logados e não logados.
- **Níveis de Acesso (Roles):**
  - **Painel do Líder (`/painel`):** Área restrita onde líderes podem visualizar avisos enviados pelo Admin.
  - **Painel do Admin (`/admin`):** Área de gerenciamento completa com layout próprio (sidebar).
    - **Dashboard de Desempenho:** Visualização de dados com a contagem de parceiros por líder.
    - **Gerenciamento de Avisos:** Interface para o Admin enviar e visualizar comunicados.

## 🛠️ Tecnologias Utilizadas

- **Framework:** [Next.js](https://nextjs.org/) (com App Router)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Backend e Banco de Dados:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, RPC Functions)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI:** [Shadcn/ui](https://ui.shadcn.com/)
- **Animações:** [Framer Motion](https://www.framer.com/motion/)
- **Ícones:** [Lucide React](https://lucide.dev/)

## 📄 Páginas e Rotas

- `/`: Página inicial com informações e formulário de cadastro.
- `/login`: Página de login para Líderes e Admin.
- `/painel`: Painel do Líder (rota protegida).
- `/admin/dashboard`: Dashboard do Admin (rota protegida por role).
- `/admin/announcements`: Gerenciamento de avisos do Admin (rota protegida por role).

## ⚙️ Como Rodar o Projeto (Setup)

Para rodar este projeto localmente, siga os passos abaixo:

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/sup.git](https://github.com/seu-usuario/sup.git)
    cd sup
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure o Supabase:**
    - Crie um novo projeto em [supabase.com](https://supabase.com/).
    - Use o **SQL Editor** para criar as tabelas `Users` e `Announcements` e a função `get_leader_partner_counts()`. (Você pode colar o SQL do nosso histórico aqui).

4.  **Configure as Variáveis de Ambiente:**
    - Renomeie o arquivo `.env.example` para `.env.local` (ou crie um novo).
    - Adicione suas chaves do Supabase, que você encontra em *Project Settings > API*.
    ```env
    NEXT_PUBLIC_SUPABASE_URL=SUA_URL_DO_PROJETO_SUPABASE
    NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLICA
    ```

5.  **Rode o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.