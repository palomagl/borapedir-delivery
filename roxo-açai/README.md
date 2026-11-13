# ROXO — Açaí do seu jeito

Loja independente do Bora Pedir, com identidade lilás/roxa e experiência feita primeiro para celular. A entrada permite escolher copos, combos, felicidade, 1 litro, barca, salada de frutas, bowls/família ou bebidas. Só depois de escolher o produto o cliente personaliza.

## Rodar

```bash
cd roxo-açai
npm ci
npm run dev
# http://localhost:3001/roxo
```

`npm run build`, `npm run lint` e `npm test` verificam a aplicação. Painel em `/admin/roxo`. Sem configuração, a senha demonstrativa é `roxo`.

## Cardápio e personalização

Os copos de açaí usam base tradicional. Tamanhos e preços base demonstrativos:

| Copo | Preço | Limite de complementos inclusos |
| --- | ---: | ---: |
| 300 ml | R$ 16,00 | Até 3 |
| 500 ml | R$ 22,00 | Até 4 |
| 700 ml | R$ 28,00 | Até 5 |
| 1 litro | R$ 38,00 | Até 6 |

**Inclusos, conforme a lista da loja:** banana, morango, kiwi, abacaxi, granola, leite em pó, leite condensado, M&M's e Oreo. Frutas e demais inclusos aparecem separados visualmente, mas compartilham o limite do tamanho escolhido. Não existe uma cobertura extra fora dessa cota.

**Cremes e recheios pagos:**

| Opção | Acréscimo |
| --- | ---: |
| Brigadeiro de colher | R$ 6,00 |
| Chocolate branco | R$ 6,00 |
| Chocolate branco com avelã | R$ 6,00 |
| Creme de avelã | R$ 6,00 |
| Creme de morango | R$ 6,00 |
| Creme de Ninho | R$ 7,00 |
| Creme de Oreo | R$ 6,00 |
| Creme de paçoca | R$ 8,00 |
| Nutella | R$ 12,00 |

**Outros adicionais pagos:** Bis, Chocoball, Ovomaltine, paçoca e Trento, R$ 4,00 cada. Todos opcionais. Whey, granola sem açúcar, pistache e os outros complementos não solicitados saíram das opções disponíveis.

Cada escolha tem foto e preço. O total atualiza antes de adicionar à sacola. Colher é opcional e grátis, com escolha explícita de quantidade. Observações permitem pedir os complementos separados. A troca para um copo menor não descarta escolhas silenciosamente: o cliente retira o excesso antes de trocar.

### Combos

| Combo personalizável | Avulsos | Combo |
| --- | ---: | ---: |
| 2 × 300 ml | R$ 32,00 | R$ 28,90 |
| 2 × 500 ml | R$ 44,00 | R$ 39,90 |
| 3 × 300 ml | R$ 48,00 | R$ 42,90 |
| 3 × 500 ml | R$ 66,00 | R$ 58,90 |

Cada copo tem sua própria aba de personalização. Cremes e adicionais pagos são somados por copo, sem alterar a economia anunciada no preço base.

### Outros formatos

- **Copo da felicidade 500 ml:** sobremesa sem açaí, 1 creme incluso e até 3 complementos inclusos. Adicionais extras são opcionais e pagos.
- **Barca 1,5 litro:** sempre tem açaí na base, 1 creme e até 3 complementos por cima. Adicionais extras são opcionais e pagos.
- **Bowl de 700 ml e box de 2 × 1 litro:** açaí personalizável, seguindo os grupos de inclusos e pagos.
- **Salada de frutas:** no mesmo modelo de copo, em 300, 500, 700 ml e 1 litro, com opção de suco de laranja ou só caldo das frutas. Pode escolher até 6 frutas, até 2 complementos inclusos e um creme opcional pago. As demais frutas fotografadas foram mantidas apenas na salada.
- **Bebidas:** água, refrigerante, suco e água de coco, com suas opções de tipo/sabor.

## Clube ROXO

A cada **10 pedidos concluídos**, o cliente ganha **1 copo de 300 ml**. Um pedido vale um selo, independentemente da quantidade de copos. Pendentes e cancelados não contam. Pedidos que usam recompensa não geram selo.

O cartão é vinculado a um token aleatório em cookie HttpOnly; apenas o hash fica no banco. Não utiliza telefone como prova de identidade nem permite ao cliente marcar selos. Esta versão identifica o cartão neste navegador, sem login ou transferência automática entre aparelhos.

O resgate é selecionado na revisão do checkout, quando há saldo e um copo de 300 ml na sacola. Desconta apenas o preço base de um copo; cremes, adicionais pagos e entrega continuam cobrados. Para entrega, o mínimo é verificado depois do desconto; retirada não tem taxa ou mínimo de entrega.

A migration `0003_loyalty.sql` contém o registro de selos e as reservas de recompensa. A contagem é idempotente por pedido, o saldo é bloqueado durante a reserva, e cancelamentos/falhas liberam a recompensa. Não há políticas públicas de escrita no registro de fidelidade.

## Fotos

As imagens ilustrativas foram geradas para a identidade ROXO, com fundo lilás, luz natural e enquadramento consistente. Produtos têm fotos próprias por formato; ingredientes usam álbuns em grade renderizados em pequenas imagens sem gerar dezenas de downloads. O Next entrega versões otimizadas conforme a tela. A correspondência entre nome e imagem está em `src/lib/roxo-media.ts`.

## Operação real e hospedagem

A versão atual é demonstrativa. Complementos e seus acréscimos seguem a lista informada; preços dos produtos, taxa de R$ 5,00, prazos e horários ainda são exemplos. Endereço e contato reais não foram inventados. O checkout informa que não gera cobrança nem envio real.

Sem Supabase, **pedidos e fidelidade ficam em memória**, sem persistência garantida após reinício ou troca de instância. Para atender clientes reais, configure uma base própria, aplique as três migrations, cadastre loja/catálogo, endereço de retirada, contato, horários e área de entrega; defina as variáveis Supabase, `ADMIN_PASSWORD` e `AUTH_SECRET`. Não reutilize as credenciais da hamburgueria.

A hospedagem é independente, com Root Directory `roxo-açai`. O pagamento desta versão é na entrega ou retirada; não há integração com adquirente ou cobrança Pix automática.
