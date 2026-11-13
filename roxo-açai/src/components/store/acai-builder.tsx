"use client";
import Image from "next/image";
import { IngredientPhoto } from "@/components/store/ingredient-photo";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Leaf, Minus, Plus, ShoppingBag } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { useStore } from "@/components/store/store-context";
import { validateSelections, type CartSelection } from "@/domain/cart";
import { effectivePriceCents } from "@/domain/catalog";
import { formatCents } from "@/domain/money";
import type { OptionGroup, Product, ProductOption } from "@/domain/types";

function selection(group: OptionGroup, option: ProductOption): CartSelection { return { groupId: group.id, groupName: group.name, optionId: option.id, optionName: option.name, priceDeltaCents: option.priceDeltaCents }; }
function defaults(product: Product) { return product.optionGroups.flatMap(g => { const o=g.options.find(o=>o.available&&o.priceDeltaCents===0); return g.minSelect===1&&g.maxSelect===1&&o ? [selection(g,o)] : []; }); }
export function AcaiBuilder({ products, initialProductSlug }: { products: Product[]; initialProductSlug?: string }) {
  const { addItem, store } = useStore();
  const router = useRouter();
  const initialProduct = products.find(p => p.slug === initialProductSlug) ?? products[1] ?? products[0];
  const [product, setProduct] = React.useState(initialProduct);
  const [chosen, setChosen] = React.useState<CartSelection[]>(()=>defaults(initialProduct));
  const [quantity, setQuantity] = React.useState(1);
  const [note, setNote] = React.useState("");
  const [extrasOpen, setExtrasOpen] = React.useState(false);
  const [creamsOpen, setCreamsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const total = effectivePriceCents(product) + chosen.reduce((sum,s)=>sum+s.priceDeltaCents,0);
  function changeSize(next: Product) {
    if(next.id===product.id)return;
    const nextChosen=next.optionGroups.flatMap(g=>g.options.filter(o=>chosen.some(s=>s.groupName===g.name&&s.optionName===o.name)).map(o=>selection(g,o)));
    if(next.optionGroups.some(g=>nextChosen.filter(s=>s.groupId===g.id).length>g.maxSelect)){toast.info("Retire alguns acompanhamentos antes de escolher um copo menor.");return;}
    setProduct(next);setChosen(nextChosen);setQuery("");
  }
  function toggle(g: OptionGroup,o: ProductOption) {
    const selected=chosen.some(s=>s.optionId===o.id);const others=chosen.filter(s=>s.groupId!==g.id);const current=chosen.filter(s=>s.groupId===g.id);
    if(g.maxSelect===1){setChosen(selected&&g.minSelect===0?others:[...others,selection(g,o)]);return;}
    if(selected){setChosen(chosen.filter(s=>s.optionId!==o.id));return;}
    if(current.length>=g.maxSelect){toast.info(`Você pode escolher até ${g.maxSelect} opções neste grupo.`);return;}
    setChosen([...chosen,selection(g,o)]);
  }
  function add() {
    const errors=validateSelections(product,chosen);if(errors.length){toast.error(errors[0].message);return;}
    addItem(product,chosen,note.trim()||null,quantity);
    toast.success(`${quantity===1?"Seu açaí foi":"Seus açaís foram"} para a sacola`,{action:{label:"Ver sacola",onClick:()=>router.push(`/${store.slug}/sacola`)}});
  }
  const groups=product.optionGroups;const included=groups.find(g=>g.name==="Acompanhamentos inclusos")!;const premium=groups.find(g=>g.name==="Extras pagos")!;const creams=groups.find(g=>g.name==="Cremes pagos")!;const spoons=groups.find(g=>g.name==="Colheres")!;
  const count=chosen.filter(s=>s.groupId===included.id).length;
  function options(g:OptionGroup, names?:readonly string[]){return g.options.filter(o=>(!names || names.includes(o.name)) && (!query||g.id!==included.id||o.name.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")))).map(o=>{const selected=chosen.some(s=>s.optionId===o.id);const full=chosen.filter(s=>s.groupId===g.id).length>=g.maxSelect;return <button key={o.id} type="button" aria-pressed={selected} aria-label={`${o.name}${o.priceDeltaCents?` + ${formatCents(o.priceDeltaCents)}`:""}`} disabled={!o.available||(!selected&&full&&g.maxSelect>1)} onClick={()=>toggle(g,o)} className={g.name === "Colheres" ? "roxo-chip relative justify-start pr-8 text-left" : "roxo-chip relative flex-col justify-start text-center"} style={{fontSize:11}}><IngredientPhoto name={o.name} /><span className="w-full flex-1">{o.name}{o.priceDeltaCents>0&&<span className="mt-0.5 block text-[10px] font-medium text-ink-muted">+ {formatCents(o.priceDeltaCents)}</span>}</span>{selected&&<Check aria-hidden className="absolute right-2 top-2 size-4 rounded-full bg-brand p-0.5 text-white"/>}</button>})}
  return <section id="monte-o-seu" className="roxo-section"><div className="mb-5"><p className="mb-2 text-xs font-bold uppercase tracking-[.14em] text-brand">Seu momento ROXO</p><h2 className="font-display text-2xl lg:text-3xl">Monte o seu copo</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">A base é sua. As combinações também. Escolha o tamanho e deixe com a sua cara.</p></div>
    <div className="roxo-card lg:grid lg:grid-cols-[.72fr_1.3fr]">
      <div className="hidden p-6 lg:block"><div className="sticky top-28"><div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-brand-soft"><Image src={product.imageUrl ?? "/acai/berry.png"} fill sizes="(min-width: 1024px) 430px, 1px" alt={`${product.name}, sugestão de montagem`} className="object-cover"/></div><p className="mt-3 text-xs leading-relaxed text-ink-muted">Imagem ilustrativa. O seu copo leva só o que você escolher.</p><div className="mt-6 flex gap-3 rounded-xl bg-[#eef4dc] p-4"><Leaf aria-hidden className="mt-0.5 size-5 shrink-0 text-[#5c7526]"/><p className="text-xs leading-relaxed text-[#4f612c]">Colher é opcional e grátis. Se você já tem uma, pode pedir sem.</p></div></div></div>
      <div className="min-w-0 p-4 sm:p-6 lg:py-8 lg:pr-8">
        <fieldset><legend className="mb-3 text-base font-extrabold">1. Qual é o tamanho da sua fome?</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{products.map(p=><button key={p.id} type="button" onClick={()=>changeSize(p)} aria-pressed={product.id===p.id} className="roxo-size rounded-xl border border-line bg-white px-2 py-4 text-center"><span className="block text-base font-extrabold">{p.slug==="copo-1000"?"1 litro":p.name.split("·")[1]?.trim()}</span><span className="mt-1 block text-sm font-semibold">{formatCents(effectivePriceCents(p))}</span><span className="mt-2 block text-[10px] text-ink-muted">Até {p.optionGroups.find(g=>g.name===included.name)?.maxSelect} inclusos</span></button>)}</div></fieldset>
        <p className="mt-5 rounded-xl bg-paper px-3 py-2.5 text-xs text-ink-muted">Base de açaí tradicional. Os complementos ficam por sua conta.</p>
        <fieldset className="mt-7"><legend className="text-base font-extrabold">2. Complementos inclusos</legend><div className="mt-1 flex items-center justify-between gap-2"><p className="text-xs text-ink-muted">Até {included.maxSelect} inclusos. Pode escolher menos.</p><span aria-live="polite" className="whitespace-nowrap rounded-full bg-[#edf5d7] px-2.5 py-1 text-[10px] font-bold text-[#46611e]">{count} de {included.maxSelect}</span></div><input aria-label="Buscar acompanhamento" placeholder="Buscar fruta ou acompanhamento..." value={query} onChange={e=>setQuery(e.target.value)} className="mt-3 h-11 w-full rounded-xl border border-line bg-paper px-3 text-xs outline-none focus:border-brand"/><p className="mt-4 mb-2 text-xs font-bold">Frutas inclusas</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{options(included,["Banana","Morango","Kiwi","Abacaxi"])}</div><p className="mt-4 mb-2 text-xs font-bold">Outros complementos inclusos</p><div className="grid grid-cols-3 gap-2">{options(included,included.options.filter(o=>!["Banana","Morango","Kiwi","Abacaxi"].includes(o.name)).map(o=>o.name))}</div>{query&&!included.options.some(o=>o.name.toLowerCase().includes(query.toLowerCase()))&&<p className="mt-3 text-xs text-ink-muted">Nenhum acompanhamento encontrado.</p>}</fieldset>
        <div className="mt-7 rounded-2xl border border-line"><button type="button" aria-expanded={creamsOpen} aria-controls="cream-options" onClick={()=>setCreamsOpen(!creamsOpen)} className="flex w-full items-center justify-between gap-3 p-4 text-left"><span><span className="block text-sm font-extrabold">3. Cremes e recheios pagos</span><span className="mt-1 block text-xs text-ink-muted">Opcionais · até 2 · preço separado para cada creme</span></span><ChevronDown className={`size-5 shrink-0 transition-transform ${creamsOpen?"rotate-180":""}`}/></button>{creamsOpen&&<fieldset id="cream-options" className="border-t border-line p-3"><legend className="sr-only">Cremes pagos</legend><div className="grid grid-cols-3 gap-2">{options(creams)}</div></fieldset>}</div>
        <div className="mt-7 rounded-2xl border border-line"><button type="button" aria-expanded={extrasOpen} aria-controls="premium-options" onClick={()=>setExtrasOpen(!extrasOpen)} className="flex w-full items-center justify-between gap-3 p-4 text-left"><span><span className="block text-sm font-extrabold">4. Outros adicionais pagos</span><span className="mt-1 block text-xs text-ink-muted">Opcionais · valores acrescentados ao total</span></span><ChevronDown className={`size-5 shrink-0 transition-transform ${extrasOpen?"rotate-180":""}`}/></button>{extrasOpen&&<fieldset id="premium-options" className="border-t border-line p-3"><legend className="sr-only">Extras pagos</legend><div className="grid grid-cols-2 gap-2">{options(premium)}</div></fieldset>}</div>
        <fieldset className="mt-7"><legend className="mb-1 text-sm font-bold">5. Precisa de colher?</legend><p className="mb-3 text-xs text-ink-muted">Sem custo. Peça só o que vai usar.</p><div className="flex flex-wrap gap-2">{options(spoons)}</div></fieldset>
        <div className="mt-6 flex items-center justify-between gap-3"><div><p className="text-sm font-bold">Quantos copos iguais?</p><p className="mt-1 text-xs text-ink-muted">Mesma montagem em todos.</p></div><div className="flex items-center rounded-xl border border-line"><button type="button" aria-label="Diminuir quantidade" onClick={()=>setQuantity(Math.max(1,quantity-1))} disabled={quantity===1} className="flex size-9 items-center justify-center disabled:opacity-30"><Minus className="size-3"/></button><span aria-live="polite" className="w-5 text-center text-xs font-bold">{quantity}</span><button type="button" aria-label="Aumentar quantidade" onClick={()=>setQuantity(Math.min(20,quantity+1))} disabled={quantity===20} className="flex size-9 items-center justify-center"><Plus className="size-3"/></button></div></div>
        <label className="mt-6 block text-sm font-bold" htmlFor="cup-note">Quer deixar uma observação?</label><textarea id="cup-note" maxLength={180} rows={2} value={note} onChange={e=>setNote(e.target.value)} placeholder="Ex.: granola separada, por favor" className="mt-2 w-full resize-y rounded-xl border border-line bg-paper p-3 text-xs"/>
        <details className="mt-4 text-xs text-ink-muted"><summary className="cursor-pointer">Informações sobre alergênicos</summary><p className="mt-2 leading-relaxed">Alguns complementos contêm leite, amendoim, castanhas ou glúten. Consulte a equipe antes de pedir em caso de alergia.</p></details>
        <div className="sticky bottom-[calc(var(--spacing-tabbar)+env(safe-area-inset-bottom,0px))] z-20 -mx-4 -mb-4 mt-6 flex items-center justify-between gap-3 border-t border-line bg-white/95 p-4 backdrop-blur-xl sm:-mx-6 sm:-mb-6 lg:static lg:mx-0 lg:mb-0 lg:px-0">
          <div><p className="text-[10px] text-ink-muted">Seu copo {quantity>1?`× ${quantity}`:""}</p><p aria-live="polite" data-testid="builder-total" className="text-xl font-extrabold tracking-tight">{formatCents(total*quantity)}</p></div>
          <div className="flex items-center gap-2"><button type="button" onClick={add} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-xs font-bold text-white hover:bg-brand-hover"><ShoppingBag aria-hidden className="hidden size-4 sm:block"/>Adicionar à sacola</button></div>
        </div>
      </div>
    </div>
  </section>;
}
