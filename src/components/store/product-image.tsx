"use client";

import { ImageOff } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src: string | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}

/**
 * Foto de produto com queda suave.
 *
 * Loja real tem produto sem foto e link quebrado. Em vez de um ícone de imagem
 * quebrada do navegador, cai num bloco quente que não estraga a composição.
 */
export function ProductImage({ src, alt, sizes, className, priority }: ProductImageProps) {
  const [failed, setFailed] = React.useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-paper-sunken text-ink-faint",
          className,
        )}
      >
        <ImageOff className="size-5" aria-hidden />
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}
