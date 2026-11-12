"use client";
import { Home, ReceiptText, ShoppingBag, Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/components/store/store-context";
export function StoreTabBar({ storeSlug }: { storeSlug: string }) {
  const path = usePathname(); const { itemCount } = useStore();
  if (path.startsWith(`/${storeSlug}/sacola`) || path.startsWith(`/${storeSlug}/checkout`)) return null;
  const tabs = [{ href: "", label: "Início", icon: Home }, { href: "/sacola", label: "Sacola", icon: ShoppingBag }, { href: "/pedidos", label: "Pedidos", icon: ReceiptText }, { href: "/perfil", label: "A ROXO", icon: Store }];
  return <nav aria-label="Navegação do celular" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur-xl safe-b lg:hidden"><ul className="flex h-[var(--spacing-tabbar)]">{tabs.map(t => { const href=`/${storeSlug}${t.href}`; const active=path===href;const Icon=t.icon;return <li key={t.label} className="flex-1"><Link href={href} aria-current={active?"page":undefined} className={`flex h-full flex-col items-center justify-center gap-1 text-[10px] font-semibold ${active?"text-brand":"text-ink-muted"}`}><span className="relative"><Icon className="size-5"/>{t.label==="Sacola"&&itemCount>0&&<span className="absolute -right-3 -top-2 flex size-4 items-center justify-center rounded-full bg-brand text-[9px] text-white">{itemCount}</span>}</span>{t.label}</Link></li>})}</ul></nav>;
}
