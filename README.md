# Bora Pedir

Projetos independentes de lojas de pedidos. Cada pasta tem sua marca, catálogo e aplicação Next.js.

| Pasta | Projeto | Experiência |
| --- | --- | --- |
| [bruto-hamburgueria/](bruto-hamburgueria) | **BRUTO — Burger & Chapa** | Hamburgueria: cardápio, personalização, sacola e operação |
| [roxo-açai/](roxo-a%C3%A7ai) | **ROXO — Açaí do seu jeito** | Copos e combos personalizáveis, barca, felicidade, extras e retirada |

## Rodar

```bash
cd bruto-hamburgueria
npm ci
npm run dev
```

```bash
cd roxo-açai
npm ci
npm run dev
# http://localhost:3001/roxo
```

Cada projeto tem dependências, configuração, banco e hospedagem próprios. As características e limites do ROXO demonstrativo estão em seu README.

## Hospedagem

- BRUTO: pasta principal `bruto-hamburgueria`. O caminho `bruto` é um atalho de compatibilidade para a hospedagem já configurada; não há uma segunda cópia do projeto. Em uma nova configuração, selecione `bruto-hamburgueria` como Root Directory.
- ROXO: criar projeto separado de hospedagem com Root Directory `roxo-açai`.

A organização por pastas identifica o estabelecimento; ela não altera suas rotas públicas nem mistura os dados das lojas.
