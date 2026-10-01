# Bora Pedir

Plataforma de lojas digitais de pedido. Cada estabelecimento vive numa pasta
própria, com sua identidade visual, seu cardápio e seu painel de operação.

## Projetos

| Pasta | Projeto | Estado |
| --- | --- | --- |
| [`bruto/`](bruto) | **BRUTO — Burger & Chapa** | Loja, checkout, pedidos e administração |

## Rodando um projeto

```bash
cd bruto
npm install
npm run dev
```

Cada pasta é uma aplicação Next.js independente, com seu próprio
`package.json`. No deploy, aponte o diretório raiz do projeto para a pasta
correspondente.

## Sobre a estrutura

A base do BRUTO já é multi-loja por dentro: toda tabela carrega `store_id`, o
tema entra por variável CSS e as rotas são por loja. Um segundo
estabelecimento do mesmo ramo cabe na mesma aplicação, como `/acai` ao lado de
`/bruto`.

Pasta separada faz sentido quando o projeto pede identidade e experiência
próprias, não só outra paleta. Quando o segundo chegar, o caminho é extrair o
núcleo compartilhado — domínio, componentes e acesso a dados — em vez de
duplicar o código.
