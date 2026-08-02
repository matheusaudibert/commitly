<div align="center">

<a href="https://commitly.audibert.dev"><img src="public/preview.png" alt="Commitly" height=100% width=auto></a>

[![GitHub Stars](https://img.shields.io/github/stars/matheusaudibert/commitly.svg?style=flat&logo=github)](https://github.com/matheusaudibert/commitly/stargazers)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fcommitly.audibert.dev&style=flat&logo=vercel&label=website)](https://commitly.audibert.dev)
[![Discord](https://img.shields.io/discord/1112920281367973900.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/programador)
[![Twitter Follow](https://img.shields.io/twitter/follow/audibosta?style=social)](https://twitter.com/audibosta)

</div>

# Commitly

Commitly faz commits reais no seu GitHub direto pelo navegador, sem precisar abrir o terminal ou clonar nada.

Você conecta sua conta, o Commitly cria um repositório privado na sua conta e cada mensagem enviada pelo painel vira um commit de verdade nesse repositório. Como o commit é real, ele conta normalmente no seu gráfico de contribuições.

Acesse em [commitly.audibert.dev](https://commitly.audibert.dev).

## Como funciona

1. Você entra com sua conta do GitHub.
2. Escolhe um nome e o Commitly cria um repositório privado na sua conta.
3. No painel, você escreve uma mensagem e pressiona Enter.
4. O commit é enviado para o repositório e aparece no seu perfil.

Todo commit é registrado no arquivo `changes.json` do repositório, que guarda o histórico com a sequência, a mensagem e a data de cada um.

## Funcionalidades

- Commits reais pelo navegador, com mensagem livre
- Criação automática do repositório privado
- Gráfico de atividade dos últimos 12 meses, igual ao do perfil do GitHub
- Contador de streak, calculado no fuso de Brasília (UTC-3)
- Atualização imediata do gráfico e do streak após cada commit, sem recarregar a página
- Tema claro e escuro
- Limite de 20 commits por dia
- Intervalo de 3 minutos entre um commit e o próximo

Os dois últimos itens existem para o uso ficar dentro do razoável e não virar spam no seu histórico.

## Tecnologias

- [Next.js 16](https://nextjs.org) com App Router e Turbopack
- [React 19](https://react.dev) e [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) sobre [Base UI](https://base-ui.com)
- [Auth.js v5](https://authjs.dev) com provider do GitHub
- [MongoDB](https://www.mongodb.com) com [Mongoose](https://mongoosejs.com)
- API REST e GraphQL do GitHub

## Licença

MIT.

Feito por [Matheus Audibert](https://github.com/matheusaudibert). Se o projeto te ajudou, considere deixar uma estrela.

