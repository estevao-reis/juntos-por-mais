# Guia de Gerenciamento, Segurança e Propriedade da Plataforma

Para garantir total autonomia e propriedade, o projeto é dividido em três componentes principais, todos sob seu controle:

* **Código-Fonte (GitHub):** A "planta" da aplicação está guardada em um repositório na sua conta do GitHub. Você é o único proprietário e pode conceder acesso a outros desenvolvedores no futuro.
* **Aplicação no Ar (Vercel):** O site que os usuários acessam está hospedado na sua conta da Vercel. Você controla o deploy, o domínio e as configurações de produção.
* **Banco de Dados e Usuários (Supabase):** Todos os dados, incluindo a lista de usuários, parceiros e avisos, estão armazenados em um projeto na sua conta do Supabase. Este é o "cofre" seguro da aplicação.

Com o controle dessas três contas (GitHub, Vercel, Supabase), você tem 100% de propriedade sobre todo o ativo digital.

## Segurança do Projeto

O repositório do código no GitHub pode ser público sem riscos. Ele contém apenas a lógica de funcionamento, como uma receita, mas não contém nenhuma senha ou chave de acesso. Já as "chaves" que conectam o site ao banco de dados estão armazenadas de forma segura como **Variáveis de Ambiente** diretamente nas configurações do projeto na Vercel. Elas **não** estão no código e só podem ser acessadas por quem tem permissão ao seu painel da Vercel.

## Acesso Administrativo

O site possui um painel administrativo para o gerenciamento do sistema.

* **Quem tem acesso:** O usuário com a permissão de `ADMIN` no banco de dados.
* **Como Acessar:** Através da página de login padrão da aplicação.
    -   **Link:** `[http://juntos-por-mais.vercel.app/login`
* **Credenciais:** Utilize o e-mail e a senha que foram definidos para o seu usuário na área de **Authentication** do Supabase.
* **Funcionalidades do Admin:**
    -   Visualizar o dashboard com a contagem de parceiros por líder.
    -   Acessar a área de gerenciamento para enviar novos avisos aos líderes.

## Observações sobre Manutenção e Custos

Atualmente, o projeto opera de forma totalmente gratuita, utilizando os planos "Hobby" da Vercel e "Free" do Supabase, que são muito robustos.

* **Limites do Plano Gratuito (Supabase):**
    -   **Banco de Dados:** 500 MB (suficiente para centenas de milhares de cadastros).
    -   **Usuários:** Até 50.000 usuários ativos por mês.
    -   **Requisições de API:** 2 milhões por mês.

* **Quando Fazer um Upgrade?**
    A necessidade de um plano pago surgirá quando o negócio exigir funcionalidades profissionais, como:
    1.  **Backups Diários Automáticos:** Para garantir a segurança total dos dados.
    2.  **Projeto Sempre Ativo:** O plano gratuito pode "pausar" o banco de dados após uma semana sem uso, reativando no primeiro acesso. O plano pago garante que ele esteja sempre online e com performance máxima.

**Conclusão:** A infraestrutura atual suportará o crescimento do projeto por um longo período sem custos.

## Links Essenciais dos Serviços

* **Aplicação no Ar (Website):**
    -   `[http://juntos-por-mais.vercel.app]`

* **Painel de Controle do Site (Vercel):**
    -   [https://vercel.com/dashboard](https://vercel.com/dashboard)

* **Gerenciador do Banco de Dados (Supabase):**
    -   [https://app.supabase.com/](https://app.supabase.com/)

* **Repositório do Código-Fonte (GitHub):**
    -   `[http://github.com/estevao-reis/juntos-por-mais]`
