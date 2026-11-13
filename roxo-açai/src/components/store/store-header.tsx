"use client";
import { Menu, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { SearchDialog } from "@/components/store/search-dialog";
import { useStore } from "@/components/store/store-context";
import type { Store } from "@/domain/types";
export function StoreHeader({ store }: { store: Store }) {
  const [open, setOpen] = React.useState(false);
  const { itemCount, products } = useStore();
  return <><header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-xl"><div className="mx-auto flex h-[4.5rem] max-w-[80rem] items-center justify-between gap-4 px-4 lg:h-24 lg:px-8">
    <Link href={`/${store.slug}`} aria-label="ROXO início" className="flex items-center gap-4"><span className="roxo-logo">ROXO</span><span className="hidden border-l border-line-strong pl-4 text-[0.6rem] font-extrabold uppercase leading-tight tracking-wide sm:block">Açaí do<br/>seu jeito</span></Link>
    <nav aria-label="Navegação principal" className="hidden items-center gap-8 text-sm font-semibold lg:flex"><Link href={`/${store.slug}`} className="hover:text-brand">Cardápio</Link><Link href={`/${store.slug}?categoria=combos`} className="hover:text-brand">Combos</Link><Link href={`/${store.slug}/fidelidade`} className="hover:text-brand">Clube ROXO</Link><Link href={`/${store.slug}/pedidos`} className="hover:text-brand">Meus pedidos</Link></nav>
    <div className="flex items-center gap-2"><button type="button" aria-label="Buscar no cardápio" onClick={() => setOpen(true)} className="flex size-11 items-center justify-center rounded-xl hover:bg-brand-soft"><Search className="size-5"/></button><Link href={`/${store.slug}/sacola`} aria-label={`Sacola com ${itemCount} itens`} className="relative flex size-11 items-center justify-center rounded-xl hover:bg-brand-soft"><ShoppingBag className="size-6"/>{itemCount > 0 && <span className="absolute right-0 top-0 flex size-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">{itemCount}</span>}</Link><details className="relative lg:hidden"><summary aria-label="Abrir menu" className="flex size-10 list-none items-center justify-center rounded-xl [&::-webkit-details-marker]:hidden"><Menu className="size-5"/></summary><nav aria-label="Mais opções" className="absolute right-0 top-12 grid w-48 rounded-2xl border border-line bg-white p-2 shadow-sm"><Link className="p-3 text-sm" href={`/${store.slug}/fidelidade`}>Meu cartão de fidelidade</Link><Link className="p-3 text-sm" href={`/${store.slug}/perfil`}>A ROXO</Link><Link className="p-3 text-sm" href={`/${store.slug}/ofertas`}>Todos os combos</Link><Link className="p-3 text-sm" href={`/${store.slug}/pedidos`}>Meus pedidos</Link></nav></details></div>
  </div></header><SearchDialog open={open} onOpenChange={setOpen} products={products}/></>;
}
