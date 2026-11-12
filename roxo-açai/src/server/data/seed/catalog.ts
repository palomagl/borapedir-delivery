import type { Category, OptionGroup, Product, Store } from "@/domain/types";

export const SEED_STORE_ID = "str_roxo";
export const INCLUDED = ["Banana", "Morango", "Manga", "Uva", "Kiwi", "Granola tradicional", "Granola sem açúcar", "Aveia", "Coco ralado", "Paçoca", "Amendoim", "Chocoball", "Flocos de arroz", "Confete", "Biscoito triturado", "Gotas de chocolate"];
export const PREMIUM: [string, number][] = [["Leite em pó", 300], ["Creme de avelã", 500], ["Creme de pistache", 700], ["Doce de leite", 400], ["Creme de amendoim", 400], ["Brigadeiro", 400], ["Creme de coco", 350], ["Brownie em pedaços", 500], ["Chocolate branco", 400], ["Whey de baunilha", 600], ["Morango extra", 300], ["Banana extra", 200], ["Granola extra", 200], ["Paçoca extra", 200]];
export const SIZES = [{ slug: "copo-300", ml: 300, price: 1600, included: 3 }, { slug: "copo-500", ml: 500, price: 2200, included: 4 }, { slug: "copo-700", ml: 700, price: 2800, included: 5 }, { slug: "copo-1000", ml: 1000, price: 3800, included: 6 }];
type GroupInput = { key: string; name: string; min?: number; max: number; helper: string; options: [string, number][] };
function group(productId: string, input: GroupInput, index: number): OptionGroup {
  const id = `${productId}_${input.key}`;
  return { id, productId, name: input.name, minSelect: input.min ?? 0, maxSelect: input.max, helperText: input.helper, sortOrder: index,
    options: input.options.map(([name, priceDeltaCents], i) => ({ id: `${id}_${i}`, groupId: id, name, priceDeltaCents, available: true, sortOrder: i })) };
}
export function cupGroups(key: string, max: number, label = ""): GroupInput[] {
  const prefix = label ? `${label} · ` : "";
  return [
    { key: `${key}_base`, name: `${prefix}Base`, min: 1, max: 1, helper: "Escolha a base do seu açaí", options: [["Açaí tradicional", 0], ["Açaí sem adição de xarope", 200], ["Meio açaí, meio cupuaçu", 200], ["Cupuaçu", 200]] },
    { key: `${key}_included`, name: `${prefix}Acompanhamentos inclusos`, max, helper: `Até ${max} inclusos no preço. Não precisa escolher todos.`, options: INCLUDED.map(name => [name, 0]) },
    { key: `${key}_syrup`, name: `${prefix}Cobertura`, max: 1, helper: "1 cobertura grátis, se quiser", options: [["Leite condensado", 0], ["Calda de chocolate", 0], ["Calda de morango", 0], ["Mel", 0]] },
    { key: `${key}_premium`, name: `${prefix}Adicionais premium`, max: 5, helper: "O valor de cada extra aparece no total. Até 5 por copo.", options: PREMIUM },
  ];
}
function spoon(count: number): GroupInput {
  return { key: "spoon", name: "Colheres", min: 1, max: 1, helper: "Sem custo. Peça só o que vai usar.", options: [["Sem colher", 0], ...Array.from({ length: count }, (_, i): [string, number] => [`${i + 1} ${i === 0 ? "colher" : "colheres"} grátis`, 0])] };
}
export const seedCategories: Category[] = [
  ["copos", "Monte seu copo", "Do seu tamanho. Do seu jeito."], ["combos", "Combos para compartilhar", "Cada copo com a sua combinação."], ["especiais", "Além do copo", "Mais espaço para suas combinações."], ["bebidas", "Bebidas", "Para acompanhar."],
].map(([slug, name, subtitle], sortOrder) => ({ id: `cat_${slug}`, storeId: SEED_STORE_ID, slug, name, subtitle, sortOrder, active: true }));
interface Spec { slug: string; name: string; description: string; price: number; promo?: number; category: string; photo?: string; featured?: boolean; groups?: GroupInput[] }
function product(spec: Spec, sortOrder: number): Product {
  const id = `prd_${spec.slug}`;
  return { id, storeId: SEED_STORE_ID, categoryId: `cat_${spec.category}`, slug: spec.slug, name: spec.name, description: spec.description, priceCents: spec.price, promoPriceCents: spec.promo ?? null, imageUrl: spec.photo === "drink" ? null : `/acai/${spec.photo ?? "berry"}.png`, available: true, featured: spec.featured ?? false, sortOrder, optionGroups: (spec.groups ?? []).map((g, i) => group(id, g, i)) };
}
const specs: Spec[] = [
  ...SIZES.map(s => ({ slug: s.slug, name: `Seu açaí · ${s.ml === 1000 ? "1 litro" : `${s.ml} ml`}`, description: `Escolha a base, até ${s.included} acompanhamentos inclusos e uma cobertura grátis. Extras são opcionais.`, price: s.price, category: "copos", groups: [...cupGroups("cup", s.included), spoon(s.ml === 1000 ? 4 : 2)] })),
  { slug: "dupla-300", name: "Duplinha · 2 copos de 300 ml", description: "2 copos, cada um com sua base, 3 inclusos e uma cobertura. Personalize cada um separadamente.", price: 3200, promo: 2890, category: "combos", photo: "combo", groups: [...cupGroups("cup1", 3, "Copo 1"), ...cupGroups("cup2", 3, "Copo 2"), spoon(2)] },
  { slug: "dupla-500", name: "Dupla perfeita · 2 copos de 500 ml", description: "2 copos de 500 ml. Cada um leva sua base, 4 inclusos e uma cobertura. Cada pessoa escolhe o seu.", price: 4400, promo: 3990, category: "combos", photo: "combo", featured: true, groups: [...cupGroups("cup1", 4, "Copo 1"), ...cupGroups("cup2", 4, "Copo 2"), spoon(2)] },
  { slug: "trio-300", name: "Trio da galera · 3 copos de 300 ml", description: "3 copos personalizados: base, 3 inclusos e uma cobertura para cada um. A conta fica mais leve.", price: 4800, promo: 4290, category: "combos", photo: "combo", featured: true, groups: [...cupGroups("cup1", 3, "Copo 1"), ...cupGroups("cup2", 3, "Copo 2"), ...cupGroups("cup3", 3, "Copo 3"), spoon(3)] },
  { slug: "trio-500", name: "Trio sem miséria · 3 copos de 500 ml", description: "3 copos de 500 ml. Base, 4 acompanhamentos inclusos e cobertura em cada copo. Extras cobrados à parte.", price: 6600, promo: 5890, category: "combos", photo: "combo", groups: [...cupGroups("cup1", 4, "Copo 1"), ...cupGroups("cup2", 4, "Copo 2"), ...cupGroups("cup3", 4, "Copo 3"), spoon(3)] },
  { slug: "copo-felicidade", name: "Copo da felicidade · 500 ml", description: "Monte suas camadas: açaí, um creme incluso, 3 acompanhamentos e cobertura. Seu doce do seu jeito.", price: 2990, category: "especiais", groups: [...cupGroups("cup", 3), { key: "cream", name: "Seu creme incluso", min: 1, max: 1, helper: "Escolha 1 creme incluso no preço", options: [["Creme de leite em pó", 0], ["Brigadeiro", 0], ["Doce de leite", 0], ["Creme de coco", 0]] }, spoon(2)] },
  { slug: "bowl-700", name: "Bowl do seu jeito · 700 ml", description: "Na tigela: sua base, 5 acompanhamentos e uma cobertura. Para comer com calma, onde quiser.", price: 2990, category: "especiais", photo: "bowl", groups: [...cupGroups("cup", 5), spoon(2)] },
  { slug: "barca-1500", name: "Barca para dividir · 1,5 litro", description: "Açaí para 2 a 3 pessoas. Escolha a base, até 8 acompanhamentos e uma cobertura. Enviamos os complementos separados.", price: 6590, category: "especiais", photo: "bowl", featured: true, groups: [...cupGroups("cup", 8), spoon(4)] },
  { slug: "box-familia", name: "Box da família · 2 litros", description: "2 potes de 1 litro, com 6 inclusos e uma cobertura por pote. Monte cada um e divida com a família.", price: 7600, promo: 6990, category: "especiais", photo: "combo", groups: [...cupGroups("pot1", 6, "Pote 1"), ...cupGroups("pot2", 6, "Pote 2"), spoon(6)] },
  { slug: "agua", name: "Água mineral · 500 ml", description: "Sem gás ou com gás. Você escolhe.", price: 500, category: "bebidas", photo: "drink", groups: [{ key: "type", name: "Sua água", min: 1, max: 1, helper: "Escolha 1 opção", options: [["Sem gás", 0], ["Com gás", 0]] }] },
  { slug: "refrigerante", name: "Refrigerante · 350 ml", description: "Lata gelada para acompanhar. Escolha o sabor.", price: 700, category: "bebidas", photo: "drink", groups: [{ key: "flavor", name: "Sabor", min: 1, max: 1, helper: "Escolha 1 opção", options: [["Cola", 0], ["Cola zero", 0], ["Guaraná", 0], ["Guaraná zero", 0], ["Laranja", 0]] }] },
  { slug: "suco", name: "Suco integral · 300 ml", description: "Integral, sem adição de açúcar. Escolha o sabor.", price: 900, category: "bebidas", photo: "drink", groups: [{ key: "flavor", name: "Sabor", min: 1, max: 1, helper: "Escolha 1 opção", options: [["Uva", 0], ["Maçã", 0], ["Laranja", 0]] }] },
  { slug: "agua-coco", name: "Água de coco · 200 ml", description: "Geladinha, para acompanhar seu açaí.", price: 650, category: "bebidas", photo: "drink" },
];
export const seedProducts = specs.map(product);
export const seedStore: Store = { id: SEED_STORE_ID, slug: "roxo", name: "ROXO", tagline: "Açaí do seu jeito", headline: "Seu açaí. Do seu jeito.", logoUrl: null, coverUrl: "/acai/hero.png", theme: { brand: "#651875", brandContrast: "#ffffff" }, phone: null, address: null, serviceModes: ["delivery", "pickup"], deliveryFeeCents: 500, minOrderCents: 1600, deliveryEtaMinutes: [25, 40], pickupEtaMinutes: [15, 20], paymentMethods: ["pix", "credit", "debit", "cash"], openingHours: Array.from({ length: 7 }, (_, weekday) => ({ weekday, opensAt: "00:00", closesAt: "23:59" })), acceptingOrders: true };
