import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="mt-3 h-4 w-64" />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-32 rounded-lg" />
        ))}
      </div>

      <div className="mt-9 grid gap-3 xl:grid-cols-2">
        {[0, 1].map((index) => (
          <Skeleton key={index} className="h-72 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
