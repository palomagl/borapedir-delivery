import { Skeleton } from "@/components/ui/skeleton";

/**
 * Esqueleto com a forma do cardápio, não um bloco genérico.
 *
 * A pessoa já vê onde cada coisa vai aparecer, e a troca pelo conteúdo real
 * não desloca a página.
 */
export default function Loading() {
  return (
    <div>
      <Skeleton className="h-[28rem] w-full rounded-none sm:h-[34rem] lg:h-[40rem]" />

      <div className="mx-auto max-w-[88rem] px-4 lg:px-8">
        <div className="flex gap-2 py-5">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-9 w-28 rounded-full" />
          ))}
        </div>

        <Skeleton className="h-9 w-56" />

        <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="flex gap-3.5 rounded-lg bg-surface p-3 hairline">
              <div className="flex-1 space-y-2.5 py-1">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-3/5" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="size-[5.5rem] shrink-0 rounded-md sm:size-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
