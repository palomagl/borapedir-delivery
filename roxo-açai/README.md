# ROXO — Açaí do seu jeito

Projeto independente de açaí dentro do Bora Pedir. A experiência começa pela montagem do copo: não há receitas prontas. Interface clara em roxo, lilás e verde, feita primeiro para celular.

## Rodar

```bash
cd roxo-açai
npm ci
npm run dev
```

Acesse `http://localhost:3001/roxo`. `npm run build`, `npm run lint` e `npm test` verificam a aplicação. O painel fica em `/admin/roxo`; sem configuração, o acesso demonstrativo usa a senha `roxo`.

## Catálogo demonstrativo

| Formato | Preço base | Acompanhamentos inclusos |
| --- | ---: | ---: |
| Copo de 300 ml | R$ 16,00 | Até 3 |
| Copo de 500 ml | R$ 22,00 | Até 4 |
| Copo de 700 ml | R$ 28,00 | Até 5 |
| Copo de 1 litro | R$ 38,00 | Até 6 |
| Copo da felicidade 500 ml | R$ 29,90 | Até 3 + 1 creme |
| Bowl 700 ml | R$ 29,90 | Até 5 |
| Barca 1,5 litro | R$ 65,90 | Até 8 |
| Box família 2 × 1 litro | R$ 69,90 | Até 6 por pote |

Todos permitem escolher base, cobertura, extras e colheres. Acompanhamentos são opcionais: o cliente pode escolher menos do que o limite. A troca para um copo menor é bloqueada quando excederia o novo limite, preservando as escolhas.

**16 acompanhamentos inclusos:** banana, morango, manga, uva, kiwi, granolas, aveia, coco, paçoca, amendoim, chocoball, flocos de arroz, confete, biscoito e gotas de chocolate.

**14 extras pagos:** leite em pó, creme de avelã, pistache, doce de leite, amendoim, brigadeiro, coco, brownie, chocolate branco, whey e porções extras de fruta e crocantes. Cada preço aparece antes da confirmação. Uma cobertura é grátis. Colher é uma escolha explícita, gratuita e opcional.

| Combo | Avulsos | Combo |
| --- | ---: | ---: |
| 2 × 300 ml | R$ 32,00 | R$ 28,90 |
| 2 × 500 ml | R$ 44,00 | R$ 39,90 |
| 3 × 300 ml | R$ 48,00 | R$ 42,90 |
| 3 × 500 ml | R$ 66,00 | R$ 58,90 |

Cada copo do combo é montado separadamente em abas. Complementos e extras pertencem ao copo escolhido; a promoção não elimina a personalização. O catálogo também inclui água, refrigerante, suco e água de coco.

## Pedido

Sacola persistida no navegador, edição de itens, quantidades, observações, entrega e retirada. Retirada remove taxa e mínimo de entrega. Checkout valida endereço apenas na entrega; pagamento na entrega/retirada e acompanhamento do pedido estão disponíveis no fluxo demonstrativo. O servidor recalcula preços e valida opções e limites: valores enviados pelo navegador não são aceitos como preço final.

## Dados e publicação

A versão inicial é **demonstrativa**: preços, taxa de R$ 5,00, prazos e horários são exemplos; endereço e telefone não foram inventados. O checkout sinaliza que pedidos de demonstração não geram cobrança ou envio real. No modo sem Supabase, pedidos ficam em memória e não têm persistência garantida após reiniciar ou trocar uma instância do servidor.

Para operação real, configure uma base Supabase própria, aplique as migrations, cadastre a loja e o catálogo, defina a área/valor de entrega, endereço de retirada, contato, horários, `ADMIN_PASSWORD`, `AUTH_SECRET` e as variáveis de Supabase descritas em `src/server/supabase/client.ts`. A publicação é um projeto de hospedagem independente, com Root Directory `roxo-açai`. Não reutilize as credenciais da hamburgueria.

As fotos são ilustrativas, geradas para esta identidade. Os originais ficam em `public/acai`; o Next entrega versões dimensionadas para a tela.
