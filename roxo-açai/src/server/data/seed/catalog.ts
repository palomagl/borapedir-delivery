import { productImage } from "@/lib/roxo-media";
import type { Category, OptionGroup, Product, Store } from "@/domain/types";

export const SEED_STORE_ID = "str_roxo";
export const INCLUDED = ["Banana", "Morango", "Kiwi", "Abacaxi", "Granola", "Leite em pó", "Leite condensado", "M&M's", "Oreo"];
export const FRUITS = ["Banana", "Morango", "Manga", "Uva", "Kiwi", "Abacaxi", "Mamão", "Melancia", "Maçã", "Laranja", "Pera", "Melão"];
export const CREAMS: [string, number][] = [["Brigadeiro de colher", 600], ["Chocolate branco", 600], ["Chocolate branco com avelã", 600], ["Creme de avelã", 600], ["Creme de morango", 600], ["Creme de Ninho", 700], ["Creme de Oreo", 600], ["Creme de paçoca", 800], ["Nutella", 1200]];
export const PAID_EXTRAS: [string, number][] = [["Bis", 400], ["Chocoball", 400], ["Ovomaltine", 400], ["Paçoca", 400], ["Trento", 400]];
export const PREMIUM: [string, number][] = [...CREAMS, ...PAID_EXTRAS];
export const SIZES = [{ slug: "copo-300", ml: 300, price: 1600, included: 3 }, { slug: "copo-500", ml: 500, price: 2200, included: 4 }, { slug: "copo-700", ml: 700, price: 2800, included: 5 }, { slug: "copo-1000", ml: 1000, price: 3800, included: 6 }];
type GroupInput = { key: string; name: string; min?: number; max: number; helper: string; options: [string, number][] };
function group(productId: string, input: GroupInput, index: number): OptionGroup {
  const id = `${productId}_${input.key}`;
  return { id, productId, name: input.name, minSelect: input.min ?? 0, maxSelect: input.max, helperText: input.helper, sortOrder: index,
    options: input.options.map(([name, priceDeltaCents], i) => ({ id: `${id}_${name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`, groupId: id, name, priceDeltaCents, available: true, sortOrder: i })) };
}
export function cupGroups(key: string, max: number, label = ""): GroupInput[] {
  const prefix = label ? `${label} · ` : "";
  return [
    { key: `${key}_base_v3`, name: `${prefix}Base`, min: 1, max: 1, helper: "Base de açaí tradicional", options: [["Açaí tradicional", 0]] },
    { key: `${key}_included_v3`, name: `${prefix}Acompanhamentos inclusos`, max, helper: `Até ${max} inclusos no preço. Não precisa escolher todos.`, options: INCLUDED.map(name => [name, 0]) },

    { key: `${key}_creams_v3`, name: `${prefix}Cremes pagos`, max: 2, helper: "Opcional. Escolha até 2 cremes; cada preço é acrescentado ao total.", options: CREAMS },
    { key: `${key}_extras_v3`, name: `${prefix}Extras pagos`, max: 5, helper: "Opcional. Até 5 extras, cobrados separadamente dos inclusos.", options: PAID_EXTRAS },
  ];
}
function dessertGroups(): GroupInput[] {
  return [
    { key: "dessert_cream_v2", name: "Seu creme incluso", min: 1, max: 1, helper: "Escolha 1 creme. Ele já está no preço.", options: [...CREAMS].sort((a,b) => a[0] === "Creme de Ninho" ? -1 : b[0] === "Creme de Ninho" ? 1 : 0).map(([name]) => [name, 0]) },
    { key: "dessert_included_v2", name: "Adicionais inclusos", max: 3, helper: "Escolha até 3 frutas, doces ou crocantes inclusos.", options: INCLUDED.map(name => [name, 0]) },
    { key: "dessert_extras_v3", name: "Extras pagos", max: 5, helper: "Opcionais. Cada preço é acrescentado ao total.", options: PAID_EXTRAS },
  ];
}
function spoon(count: number): GroupInput {
  return { key: "spoon", name: "Colheres", min: 1, max: 1, helper: "Sem custo. Peça só o que vai usar.", options: [["Sem colher", 0], ...Array.from({ length: count }, (_, i): [string, number] => [`${i + 1} ${i === 0 ? "colher" : "colheres"} grátis`, 0])] };
}
export const seedCategories: Category[] = [
  ["copos", "Monte seu copo", "Do seu tamanho. Do seu jeito."], ["combos", "Combos para compartilhar", "Cada copo com a sua combinação."], ["especiais", "Além do copo", "Mais espaço para suas combinações."], ["frutas", "Salada de frutas", "Frutas fresquinhas, escolhidas por você."], ["bebidas", "Bebidas", "Para acompanhar."],
].map(([slug, name, subtitle], sortOrder) => ({ id: `cat_${slug}`, storeId: SEED_STORE_ID, slug, name, subtitle, sortOrder, active: true }));
interface Spec { slug: string; name: string; description: string; price: number; promo?: number; category: string; photo?: string; featured?: boolean; groups?: GroupInput[] }
function product(spec: Spec, sortOrder: number): Product {
  const id = `prd_${spec.slug}`;
  return { id, storeId: SEED_STORE_ID, categoryId: `cat_${spec.category}`, slug: spec.slug, name: spec.name, description: spec.description, priceCents: spec.price, promoPriceCents: spec.promo ?? null, imageUrl: productImage(spec.slug), available: true, featured: spec.featured ?? false, sortOrder, optionGroups: (spec.groups ?? []).map((g, i) => group(id, g, i)) };
}
const specs: Spec[] = [
  ...SIZES.map(s => ({ slug: s.slug, name: `Seu açaí · ${s.ml === 1000 ? "1 litro" : `${s.ml} ml`}`, description: `Monte com até ${s.included} complementos inclusos. Cremes e extras pagos são opcionais.`, price: s.price, category: "copos", groups: [...cupGroups("cup", s.included), spoon(s.ml === 1000 ? 4 : 2)] })),
  { slug: "dupla-300", name: "Duplinha · 2 copos de 300 ml", description: "2 copos, cada um com sua base, 3 inclusos. Personalize cada um separadamente.", price: 3200, promo: 2890, category: "combos", photo: "combo", groups: [...cupGroups("cup1", 3, "Copo 1"), ...cupGroups("cup2", 3, "Copo 2"), spoon(2)] },
  { slug: "dupla-500", name: "Dupla perfeita · 2 copos de 500 ml", description: "2 copos de 500 ml. Cada um leva sua base, 4 inclusos. Cada pessoa escolhe o seu.", price: 4400, promo: 3990, category: "combos", photo: "combo", featured: true, groups: [...cupGroups("cup1", 4, "Copo 1"), ...cupGroups("cup2", 4, "Copo 2"), spoon(2)] },
  { slug: "trio-300", name: "Trio da galera · 3 copos de 300 ml", description: "3 copos personalizados: base, 3 inclusos para cada um. A conta fica mais leve.", price: 4800, promo: 4290, category: "combos", photo: "combo", featured: true, groups: [...cupGroups("cup1", 3, "Copo 1"), ...cupGroups("cup2", 3, "Copo 2"), ...cupGroups("cup3", 3, "Copo 3"), spoon(3)] },
  { slug: "trio-500", name: "Trio sem miséria · 3 copos de 500 ml", description: "3 copos de 500 ml. Base, 4 acompanhamentos inclusos em cada copo. Extras cobrados à parte.", price: 6600, promo: 5890, category: "combos", photo: "combo", groups: [...cupGroups("cup1", 4, "Copo 1"), ...cupGroups("cup2", 4, "Copo 2"), ...cupGroups("cup3", 4, "Copo 3"), spoon(3)] },
  { slug: "copo-felicidade", name: "Copo da felicidade · 500 ml", description: "Uma sobremesa, sem açaí: 1 creme e até 3 frutas, doces ou crocantes inclusos. Você monta suas camadas.", price: 2990, category: "especiais", groups: [...dessertGroups(), spoon(2)] },
  { slug: "bowl-700", name: "Bowl do seu jeito · 700 ml", description: "Na tigela: sua base, 5 acompanhamentos . Para comer com calma, onde quiser.", price: 2990, category: "especiais", photo: "bowl", groups: [...cupGroups("cup", 5), spoon(2)] },
  { slug: "barca-1500", name: "Barca de açaí · 1,5 litro", description: "Base de açaí na barca, 1 creme e até 3 frutas, doces ou crocantes por cima. Para compartilhar do seu jeito.", price: 6590, category: "especiais", featured: true, groups: [{ key: "barca_base_v3", name: "Base de açaí", min: 1, max: 1, helper: "A barca sempre leva açaí tradicional na base.", options: [["Açaí tradicional",0]] }, ...dessertGroups(), spoon(4)] },
  { slug: "box-familia", name: "Box da família · 2 litros", description: "2 potes de 1 litro, com 6 inclusos por pote. Monte cada um e divida com a família.", price: 7600, promo: 6990, category: "especiais", photo: "combo", groups: [...cupGroups("pot1", 6, "Pote 1"), ...cupGroups("pot2", 6, "Pote 2"), spoon(6)] },
  ...[{ml:300,price:1290},{ml:500,price:1790},{ml:700,price:2290},{ml:1000,price:2990}].map(size => ({ slug: `salada-frutas-${size.ml}`, name: `Salada de frutas · ${size.ml === 1000 ? "1 litro" : `${size.ml} ml`}`, description: "No mesmo copo do açaí, com frutas em cubos e suco. Escolha suas frutas; cremes são opcionais e pagos à parte.", price: size.price, category: "frutas", groups: [
    { key: "fruits", name: "Suas frutas", min: 1, max: 6, helper: "Escolha de 1 a 6 frutas. Todas inclusas no preço.", options: FRUITS.map((name): [string,number] => [name,0]) },
    { key: "juice", name: "Caldo da salada", min: 1, max: 1, helper: "Escolha como prefere. Sem custo adicional.", options: [["Com suco de laranja",0],["Só o caldo das frutas",0]] as [string,number][] },
    { key: "included", name: "Complementos inclusos", max: 2, helper: "Até 2 inclusos, se quiser.", options: [["Granola",0],["Leite em pó",0],["Leite condensado",0]] as [string,number][] },
    { key: "creams", name: "Cremes pagos", max: 1, helper: "Opcional. O preço do creme é acrescentado ao total.", options: CREAMS }, spoon(1),
  ] })),
  { slug: "agua", name: "Água mineral · 500 ml", description: "Sem gás ou com gás. Você escolhe.", price: 500, category: "bebidas", photo: "drink", groups: [{ key: "type", name: "Sua água", min: 1, max: 1, helper: "Escolha 1 opção", options: [["Sem gás", 0], ["Com gás", 0]] }] },
  { slug: "refrigerante", name: "Refrigerante · 350 ml", description: "Lata gelada para acompanhar. Escolha o sabor.", price: 700, category: "bebidas", photo: "drink", groups: [{ key: "flavor", name: "Sabor", min: 1, max: 1, helper: "Escolha 1 opção", options: [["Cola", 0], ["Cola zero", 0], ["Guaraná", 0], ["Guaraná zero", 0], ["Laranja", 0]] }] },
  { slug: "suco", name: "Suco integral · 300 ml", description: "Integral, sem adição de açúcar. Escolha o sabor.", price: 900, category: "bebidas", photo: "drink", groups: [{ key: "flavor", name: "Sabor", min: 1, max: 1, helper: "Escolha 1 opção", options: [["Uva", 0], ["Maçã", 0], ["Laranja", 0]] }] },
  { slug: "agua-coco", name: "Água de coco · 200 ml", description: "Geladinha, para acompanhar seu açaí.", price: 650, category: "bebidas", photo: "drink" },
];
export const seedProducts = specs.map(product);
export const seedStore: Store = { id: SEED_STORE_ID, slug: "roxo", name: "ROXO", tagline: "Açaí do seu jeito", headline: "Seu açaí. Do seu jeito.", logoUrl: null, coverUrl: "/acai/hero.png", theme: { brand: "#651875", brandContrast: "#ffffff" }, phone: null, address: null, serviceModes: ["delivery", "pickup"], deliveryFeeCents: 500, minOrderCents: 1600, deliveryEtaMinutes: [25, 40], pickupEtaMinutes: [15, 20], paymentMethods: ["pix", "credit", "debit", "cash"], openingHours: Array.from({ length: 7 }, (_, weekday) => ({ weekday, opensAt: "00:00", closesAt: "23:59" })), acceptingOrders: true };
