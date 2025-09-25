# Guia de Gerenciamento da Plataforma Juntos por Mais

Bem-vindo ao guia da sua nova plataforma! Este documento explica como você pode gerenciar o conteúdo, os usuários e acompanhar o crescimento da sua rede de forma autônoma e segura.

## Acesso Administrativo e Funcionalidades

O acesso ao painel de controle é exclusivo para usuários com permissão de **Administrador**.

-   **Como Acessar:**
    1.  Acesse a página de login: [juntos-por-mais.vercel.app/login](https://juntos-por-mais.vercel.app/login)
    2.  Utilize o e-mail e a senha definidos para o seu usuário `ADMIN`.

-   **O que você pode fazer no Painel Administrativo:**
    -   **Dashboard (`/admin/dashboard`):** Tenha uma visão geral da sua rede com números totais de apoiadores, líderes e eventos. Acompanhe um gráfico que mostra a distribuição de apoiadores por Região Administrativa.
    -   **Gerenciar Usuários (`/admin/usuarios`):** Visualize todos os usuários cadastrados (apoiadores, líderes e admins). Você pode buscar, filtrar por região, editar informações, alterar permissões e, se necessário, remover usuários.
    -   **Gerenciar Eventos (`/admin/events`):** Crie e edite eventos para a sua rede. Para cada evento, você pode visualizar a lista completa de inscritos e **exportar essa lista como um arquivo PDF** para controle e organização.
    -   **Gerenciar Avisos (`/admin/announcements`):** Envie comunicados importantes que aparecerão diretamente no painel de todos os líderes cadastrados.

## Como os Líderes Utilizam a Plataforma?

Seus líderes também têm um papel ativo. Ao se cadastrarem e fazerem login, eles acessam um painel exclusivo (`/painel`) onde podem:

1.  **Obter seu Link de Convite:** Cada líder tem um link único para convidar novos apoiadores.
2.  **Acompanhar seus Indicados:** Eles podem ver uma lista de todas as pessoas que se cadastraram usando seu link.
3.  **Ver o Ranking:** Uma tabela mostra os líderes que mais trouxeram apoiadores, incentivando o engajamento.
4.  **Acompanhar Eventos:** Eles visualizam os próximos eventos e quantos dos seus indicados se inscreveram.
5.  **Ler seus Avisos:** O mural de avisos que você envia pelo painel de admin aparece aqui.

## Propriedade e Segurança

Para garantir sua total autonomia, o projeto é dividido em três componentes sob seu controle:

1.  **Código-Fonte (GitHub):** A "planta" da aplicação.
2.  **Aplicação no Ar (Vercel):** O site que os usuários acessam.
3.  **Banco de Dados (Supabase):** Onde todos os dados (usuários, eventos, etc.) são guardados com segurança.

As chaves de acesso que conectam o site ao banco de dados estão armazenadas de forma segura como **Variáveis de Ambiente** na Vercel, garantindo que nenhuma informação sensível fique exposta no código.

## Manutenção e Custos

Atualmente, a plataforma opera de forma **100% gratuita**, utilizando os planos "Hobby" da Vercel e "Free" do Supabase. Estes planos são robustos e suportam um grande volume de usuários e dados:

-   **Banco de Dados:** 500 MB (suficiente para centenas de milhares de cadastros).
-   **Usuários:** Até 50.000 usuários ativos por mês.

**Quando considerar um upgrade?** A necessidade de um plano pago surgirá apenas quando o projeto crescer a ponto de precisar de funcionalidades como **backups diários automáticos** ou a garantia de que o banco de dados permaneça ativo 100% do tempo (o plano gratuito pode "pausar" o banco após uma semana de inatividade, reativando no primeiro acesso).

**Conclusão:** A infraestrutura atual suportará o crescimento do projeto por um longo período sem custos.

## Links Essenciais

-   **Site Principal:** [juntos-por-mais.vercel.app](https://juntos-por-mais.vercel.app/)
-   **Painel de Controle do Site (Vercel):** [vercel.com/dashboard](https://vercel.com/dashboard)
-   **Gerenciador do Banco de Dados (Supabase):** [app.supabase.com](https://app.supabase.com/)
-   **Repositório do Código-Fonte (GitHub):** [github.com/estevao-reis/juntos-por-mais](https://github.com/estevao-reis/juntos-por-mais)