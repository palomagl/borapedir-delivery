"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CupSoda, Leaf, Plus } from "lucide-react";
import { useProductModal } from "@/components/store/product-modal";
import { useStore } from "@/components/store/store-context";
import { ServiceModeToggle } from "@/components/store/service-mode-toggle";
import { AcaiBuilder } from "@/components/store/acai-builder";
import { effectivePriceCents, hasPromo } from "@/domain/catalog";
import { formatCents } from "@/domain/money";
import type { CatalogSection, Product } from "@/domain/types";
function CatalogCard({ product }: { product: Product }) {
  const { open }=useProductModal();const promo=hasPromo(product);const drink=product.categoryId==="cat_bebidas";
  return <button type="button" onClick={()=>open(product)} aria-label={`Personalizar ${product.name}`} className="roxo-card group relative flex w-full overflow-hidden text-left transition-colors hover:border-brand/50 sm:block">
    <span className="relative m-3 block size-24 shrink-0 overflow-hidden rounded-xl bg-brand-soft sm:m-0 sm:aspect-[4/3] sm:h-auto sm:w-full sm:rounded-none">{product.imageUrl?<Image src={product.imageUrl} alt={product.name} fill sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 96px" className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"/>:<span className="flex size-full items-center justify-center bg-[#f0f3e5]"><CupSoda className="size-10 text-[#728b43]" strokeWidth={1.3}/></span>}{promo&&<span className="absolute left-2 top-2 hidden rounded-full bg-[#def0b0] px-2 py-1 text-[10px] font-bold text-[#405621] sm:block">Economize {formatCents(product.priceCents-effectivePriceCents(product))}</span>}</span>
    <span className="flex min-w-0 flex-1 flex-col p-3 pl-0 sm:p-4"><span className="block text-sm font-extrabold leading-snug tracking-tight lg:text-base">{product.name}</span><span className="clamp-3 mb-3 mt-2 block text-xs leading-relaxed text-ink-muted sm:min-h-[3.6rem]">{product.description}</span>{promo&&<span className="mb-1 block text-[10px] font-semibold text-[#527b17] sm:hidden">Economize {formatCents(product.priceCents-effectivePriceCents(product))}</span>}<span className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1 pr-8"><span className="text-base font-extrabold">{formatCents(effectivePriceCents(product))}</span>{promo&&<span className="text-xs text-ink-muted line-through">{formatCents(product.priceCents)}</span>}</span><span className="mt-2 block text-[10px] font-semibold text-brand">{drink?"Escolher opção":product.categoryId==="cat_combos"?"Personalizar cada copo":"Montar do meu jeito"}</span></span><span aria-hidden className="absolute bottom-4 right-3 flex size-7 items-center justify-center rounded-lg bg-brand text-white"><Plus className="size-4"/></span>
  </button>;
}
interface RoxoCatalogProps {
  catalog: CatalogSection[];
  categorySlug?: string;
  cupSlug?: string;
}
export function RoxoCatalog({ catalog, categorySlug, cupSlug }: RoxoCatalogProps) {
  const { store, isOpen } = useStore();
  const allProducts = catalog.flatMap(section => section.products);
  const cups = allProducts.filter(p => p.categoryId === "cat_copos");
  const categories = [
    { slug: "copos", name: "Copos de açaí", detail: "300, 500 e 700 ml", description: "Escolha o tamanho. A montagem é toda sua.", image: "/acai/berry.png", products: cups.filter(p => p.slug !== "copo-1000"), badge: "Você monta" },
    { slug: "combos", name: "Combos promocionais", detail: "2 ou 3 copos personalizados", description: "Cada pessoa escolhe o seu e vocês economizam.", image: "/acai/combo.png", products: allProducts.filter(p => p.categoryId === "cat_combos"), badge: "Para economizar" },
    { slug: "felicidade", name: "Copo da felicidade", detail: "500 ml com creme incluso", description: "Camadas de açaí, seu creme e seus complementos.", image: "/acai/berry.png", products: allProducts.filter(p => p.slug === "copo-felicidade"), badge: null },
    { slug: "litro", name: "Açaí de 1 litro", detail: "Até 6 acompanhamentos inclusos", description: "Seu copão, com espaço para mais combinações.", image: "/acai/hero.png", products: cups.filter(p => p.slug === "copo-1000"), badge: "Tamanho família" },
    { slug: "dividir", name: "Barcas, bowls e box", detail: "De 700 ml a 2 litros", description: "Escolha o formato e personalize para dividir ou aproveitar sozinho.", image: "/acai/bowl.png", products: allProducts.filter(p => ["bowl-700", "barca-1500", "box-familia"].includes(p.slug)), badge: null },
    { slug: "bebidas", name: "Bebidas", detail: "Água, sucos e refrigerantes", description: "Uma bebida gelada para acompanhar.", image: null, products: allProducts.filter(p => p.categoryId === "cat_bebidas"), badge: null },
  ].filter(category => category.products.length > 0);
  const selectedCategory = categories.find(category => category.slug === categorySlug);
  const selectedCup = cups.find(product => product.slug === cupSlug);
  const base = `/${store.slug}`;
  const backCategory = selectedCup?.slug === "copo-1000" ? "litro" : "copos";
  return <>
    <section aria-label="Entrega e retirada" className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-[80rem] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 lg:px-8">
        <div className="w-full max-w-lg"><ServiceModeToggle /></div>
        <div className="flex items-center gap-4 text-[10px] font-medium text-ink-muted sm:text-xs">
          <span className="flex items-center gap-1.5"><span aria-hidden className={`size-2 rounded-full ${isOpen ? "bg-[#9abe35]" : "bg-ink-faint"}`} />{isOpen ? "Aberto agora" : "Fechado agora"}</span>
          <span>Mínimo para entrega {formatCents(store.minOrderCents)}</span>
        </div>
      </div>
    </section>
    {selectedCategory && !selectedCup && <nav aria-label="Categorias do cardápio" className="sticky top-[4.5rem] z-20 border-b border-line bg-paper/95 backdrop-blur-xl lg:top-24">
      <div className="scroll-x mx-auto flex max-w-[80rem] gap-2 px-4 py-3 lg:px-8">
        {categories.map(category => <Link key={category.slug} href={`${base}?categoria=${category.slug}`} aria-current={category.slug === selectedCategory.slug ? "page" : undefined} className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-semibold ${category.slug === selectedCategory.slug ? "bg-brand text-white" : "hover:bg-brand-soft"}`}>{category.name}</Link>)}
      </div>
    </nav>}
    <main className="mx-auto max-w-[80rem] px-4 py-6 lg:px-8 lg:py-10">
      {selectedCup ? <>
        <Link href={`${base}?categoria=${backCategory}`} className="mb-6 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-brand"><ArrowLeft className="size-4" />Voltar aos tamanhos</Link>
        <AcaiBuilder products={cups} initialProductSlug={selectedCup.slug} key={selectedCup.id} />
      </> : selectedCategory ? <>
        <Link href={base} className="mb-4 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-brand"><ArrowLeft className="size-4" />Voltar ao cardápio</Link>
        <div className="mb-6"><p className="mb-2 text-[10px] font-bold uppercase tracking-[.14em] text-brand">{selectedCategory.slug === "copos" || selectedCategory.slug === "litro" ? "1. Escolha seu tamanho" : "Escolha o que combina com você"}</p>
          <h1 className="font-display text-2xl lg:text-4xl">{selectedCategory.name}</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">{selectedCategory.description}{selectedCategory.slug !== "bebidas" && " Os complementos você escolhe no próximo passo."}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {selectedCategory.products.map(product => product.categoryId === "cat_copos" ? <Link key={product.id} href={`${base}?produto=${product.slug}`} className="roxo-card group flex items-center gap-4 p-4 transition-colors hover:border-brand/50 sm:block sm:p-5">
            <span className="relative block size-24 shrink-0 overflow-hidden rounded-xl bg-brand-soft sm:aspect-[4/3] sm:h-auto sm:w-full"><Image src={product.imageUrl!} alt={product.name} fill sizes="(min-width: 1024px) 385px, (min-width: 640px) 45vw, 96px" className="object-cover" /></span>
            <span className="block sm:mt-4"><span className="block text-lg font-extrabold">{product.name}</span><span className="mt-2 block text-xs text-ink-muted">Até {product.optionGroups.find(g => g.name === "Acompanhamentos inclusos")?.maxSelect} acompanhamentos inclusos</span><span className="mt-3 block text-lg font-extrabold">{formatCents(effectivePriceCents(product))}</span><span className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-brand">Montar este copo<ArrowRight className="size-4" /></span></span>
          </Link> : <CatalogCard product={product} key={product.id} />)}
        </div>
      </> : <>
        <div className="mb-5 lg:mb-7"><p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-brand"><Leaf className="size-3" />Seu momento ROXO</p><h1 className="font-display text-[1.8rem] lg:text-4xl">O que vai ser hoje?</h1><p className="mt-2 max-w-xl text-xs leading-relaxed text-ink-muted lg:text-sm">Primeiro escolha o seu favorito. Depois, monte do seu jeito.</p></div>
        <div aria-label="Escolha o que quer comprar" className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">
          {categories.map((category,index) => <Link key={category.slug} href={`${base}?categoria=${category.slug}`} className="roxo-card group overflow-hidden transition-colors hover:border-brand/50">
            <span className={`relative block aspect-[4/3] overflow-hidden ${category.image ? "bg-brand-soft" : "bg-[#edf3df]"}`}>
              {category.image ? <Image src={category.image} alt="" fill priority={index < 2} sizes="(min-width: 1280px) 392px, (min-width: 1024px) 31vw, 47vw" className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105" /> : <span className="flex size-full items-center justify-center"><CupSoda className="size-14 text-[#6c8539] lg:size-20" strokeWidth={1.3} /></span>}
              {category.badge && <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[9px] font-bold text-brand lg:left-3 lg:top-3 lg:text-[10px]">{category.badge}</span>}
            </span>
            <span className="block p-3 lg:p-5"><span className="block min-h-10 text-sm font-extrabold leading-snug tracking-tight lg:min-h-0 lg:text-lg">{category.name}</span><span className="mt-1 block min-h-8 text-[10px] leading-relaxed text-ink-muted lg:min-h-0 lg:text-xs">{category.detail}</span><span className="mt-2 flex items-center justify-between gap-2 border-t border-line pt-2.5 lg:mt-3 lg:pt-3"><span className="text-[10px] font-semibold lg:text-xs">A partir de <span className="whitespace-nowrap font-extrabold">{formatCents(Math.min(...category.products.map(effectivePriceCents)))}</span></span><ArrowRight aria-hidden className="size-4 shrink-0 text-brand" /></span></span>
          </Link>)}
        </div>
        <p className="mt-5 text-center text-[10px] text-ink-muted lg:mt-7 lg:text-xs">Seu açaí não vem pronto: a base, os complementos e a colher são escolhidos por você.</p>
      </>}
    </main>
    <footer className="mx-auto mt-8 flex max-w-[80rem] flex-wrap items-center justify-between gap-5 px-4 pb-8 lg:px-8">
      <div><span className="roxo-logo">ROXO</span><p className="mt-3 text-xs text-ink-muted">Seu açaí. Suas combinações.</p></div>
      <div className="flex gap-5 text-xs font-semibold"><Link href={`${base}/perfil`}>A ROXO</Link><Link href={`${base}/pedidos`}>Meus pedidos</Link></div>
      <p className="w-full border-t border-line pt-5 text-[10px] text-ink-muted">Catálogo demonstrativo. Preços, área de entrega e endereço de retirada sujeitos à configuração da loja. Imagens ilustrativas.</p>
    </footer>
  </>;
}
