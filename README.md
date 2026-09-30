# BRUTO — Burger & Chapa

Loja digital de pedidos. A marca é a **BRUTO**; a arquitetura por baixo é
multi-loja, para que a mesma base sirva outros estabelecimentos sem reescrever
o banco nem as telas.

> **Regra que orienta o projeto:** a arquitetura é reutilizável, a experiência
> visual é específica da BRUTO. Flexibilidade não pode custar personalidade.

```bash
npm install
npm run dev     # http://localhost:3000 → redireciona para /bruto
```

Não precisa de banco nem de variáveis de ambiente para rodar: sem credenciais
de Supabase, a aplicação inteira roda sobre um seed em memória.

---

## Stack

| Camada | Escolha | Por quê |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) | Server Components por padrão; o cardápio é conteúdo, não aplicação |
| Linguagem | TypeScript | Sem `any` no código de domínio |
| Estilo | Tailwind CSS v4 | Tokens em `@theme`, uma fonte de verdade para o visual |
| Validação | Zod | O mesmo schema valida o formulário e a server action |
| Formulários | React Hook Form | Checkout em etapas sem re-render da árvore inteira |
| Banco | PostgreSQL / Supabase | RLS resolve multi-tenancy no banco, não na aplicação |

Dependências de interface: `lucide-react` (ícones), `vaul` (bottom sheet com
arrasto), `sonner` (feedback), `@radix-ui/*` (diálogo acessível), `cva` +
`tailwind-merge` (variantes de componente).

---

## Direção visual

Preto de carvão, texto cor de osso, um único vermelho para ação. A comida é a
única fonte de cor viva — a interface recua.

| Token | Valor | Uso |
| --- | --- | --- |
| `--color-paper` | `#0e0e0e` | Fundo da página |
| `--color-surface` | `#161513` | Cards e painéis |
| `--color-ink` | `#ede8de` | Texto principal |
| `--color-brand` | `#ff4b2b` | Ação, seleção, foco |
| `--color-ember` | `#8b3f1f` | Apoio |
| `--color-ash` | `#4a4a42` | Apoio |

Tipografia: **Bebas Neue** (display — logotipo, títulos de seção, nomes de
produto, números de pedido) e **Inter** (corpo, preços com `tabular-nums`).
Bebas só tem caixa alta e um peso, então a hierarquia vem de corpo e
entreletra — por isso `.font-display` fixa `font-weight` e `text-transform` em
vez de deixar cada componente decidir.

Contraste verificado no navegador: texto principal 14,9:1, secundário 6,1:1,
vermelho sobre preto 5,8:1 e preto sobre vermelho 5,8:1 (todos acima de AA).

### O que a marca **não** usa

Ícone de hambúrguer, chama, garfo e faca. A assinatura é tipográfica: o nome
em condensada, a linha `BURGER & CHAPA` espaçada embaixo e um risco vermelho
curto (`.slash`). O mesmo componente serve qualquer outra loja da plataforma.

---

## Arquitetura

```
src/
  domain/          Regras puras. Sem React, sem I/O.
    types.ts       Loja, catálogo, carrinho, pedido
    money.ts       Centavos inteiros — nenhum float entra ou sai
    cart.ts        Identidade de linha, totais, validação de opções
    catalog.ts     Preço efetivo, horário de funcionamento
    order.ts       Máquina de estados do pedido
    schemas.ts     Zod, compartilhado entre formulário e servidor
  server/
    data/          Acesso a dados atrás de um contrato (DataSource)
    actions/       Server actions
  components/
    ui/            Primitivas (botão, campo, folha responsiva…)
    store/         Experiência do cliente
  lib/             Utilitários de interface
supabase/
  migrations/      Esquema + RLS
```

### Decisões que valem explicar

**Um contrato de dados, duas implementações.** A interface fala com
`DataSource` (`src/server/data/source.ts`), nunca com o Supabase direto. Sem
credenciais, `getDataSource()` devolve o seed em memória — dá para construir e
revisar tela sem depender de infraestrutura. Com credenciais, muda um arquivo.

**Preço nunca vem do navegador.** O checkout envia apenas ids de produto e de
opção. `createOrder` recalcula tudo contra o catálogo. Aceitar o total enviado
pelo cliente seria deixar o cliente escolher quanto pagar. A migration não cria
policy de `insert` em `orders` justamente por isso.

**Pedido é imutável.** `order_items` guarda nome, imagem e preço do momento da
compra; `order_item_options` guarda o rótulo e o acréscimo de cada opção.
Mudar o cardápio amanhã não reescreve o pedido de ontem.

**Variação e adicional são a mesma coisa.** Um `option_group` com
`min_select`/`max_select` cobre os dois casos: `1..1` vira escolha obrigatória
(tamanho, ponto da carne), `0..N` vira adicional. Uma tabela, uma tela, um
componente.

**O carrinho é um store externo, não estado de efeito.** Ele vive no
`localStorage`, que é externo ao React — então é lido por
`useSyncExternalStore` (`src/lib/cart-store.ts`). Isso evita divergência entre
o HTML do servidor e o cliente, sincroniza duas abas da mesma loja de graça e
elimina render em cascata na montagem.

**Multi-tenant no banco.** Toda tabela de conteúdo carrega `store_id` e RLS
está ligada em todas. `is_store_member()` decide escrita; leitura de catálogo
é pública por policy explícita.

---

## Experiência

**Mobile** tem composição própria, não é o desktop reduzido: hero com a marca,
lista vertical com informação à esquerda e foto à direita, navegação inferior
de quatro destinos e a sacola como barra flutuante que só existe quando há
itens. O botão `+` na foto resolve em um toque o que não tem o que escolher e
abre a folha quando tem — nunca se adiciona algo incompleto.

**Desktop** usa a largura: navegação de categorias à esquerda, cardápio ao
centro, sacola persistente à direita. Duas colunas de produto só a partir de
`2xl`, quando cada linha ainda tem largura para duas frases de descrição.

**Vídeo no hero** só carrega em tela grande e com `prefers-reduced-motion`
liberado; no celular fica a foto. São quase 3 MB, e ninguém deve esperar vídeo
para conseguir pedir no 4G. A reprodução fica presa entre 1,1 s e 5,1 s porque
o clipe abre e fecha em preto.

---

## Estado atual

Pronto e verificado no navegador:

- Fundação, design system e tokens
- Cardápio, categorias, busca, folha de produto com opções e observação
- Carrinho com editar, remover com desfazer, e persistência por loja
- Checkout em quatro etapas com validação compartilhada
- Criação de pedido com repreço no servidor
- Acompanhamento de pedido e lista de pedidos do aparelho
- Ofertas e página da casa (horários, endereço, pagamento)
- Esquema do banco com RLS e seed de desenvolvimento

Ainda **não** construído:

- **Área administrativa** (dashboard, pedidos, produtos, categorias, clientes,
  configurações) — as regras de domínio e a ação `advanceOrderStatus` já
  existem, falta a interface
- **Adaptador Supabase** — o esquema está escrito, mas o `DataSource` do
  Supabase ainda não foi ligado; com as variáveis definidas, `getDataSource()`
  falha alto de propósito em vez de servir dados errados em silêncio
- **Autenticação** — o modelo separa cliente de usuário administrativo e a RLS
  já depende disso, mas não há tela de login

---

## Banco

`supabase/migrations/0001_init.sql` cria o esquema completo. Para aplicar:

```bash
supabase db push
```

Depois defina as variáveis e o adaptador passa a ser usado:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Créditos

Fotos de produto: [Unsplash](https://unsplash.com) (licença livre), baixadas
para `public/seed/` para que o projeto rode sem depender de rede. Os vídeos em
`public/brand/` foram fornecidos pelo autor do projeto.
