"use client";

import Image from "next/image";
import * as React from "react";
import { useMediaQuery } from "@/lib/use-media-query";

/**
 * Fundo do hero.
 *
 * O vídeo só é montado em tela grande e quando a pessoa não pediu menos
 * movimento. No celular fica a foto: são quase 3 MB, e ninguém deve esperar
 * um vídeo carregar para conseguir fazer um pedido no 4G.
 */

/**
 * O clipe abre e fecha em preto. Repetir isso a cada seis segundos viraria um
 * piscar no meio da página, então a reprodução fica presa no miolo.
 */
const LOOP_START = 1.1;
const LOOP_END = 5.1;

export function HeroMedia({ poster, alt }: { poster: string; alt: string }) {
  const isWide = useMediaQuery("(min-width: 1024px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [ready, setReady] = React.useState(false);

  const useVideo = isWide && !reducedMotion;

  function handleLoaded(event: React.SyntheticEvent<HTMLVideoElement>) {
    event.currentTarget.currentTime = LOOP_START;
  }

  function handleTimeUpdate(event: React.SyntheticEvent<HTMLVideoElement>) {
    const video = event.currentTarget;
    if (video.currentTime >= LOOP_END) video.currentTime = LOOP_START;
  }

  return (
    <>
      <Image
        src={poster}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className={`object-cover transition-opacity duration-700 ${
          useVideo && ready ? "opacity-0" : "opacity-100"
        }`}
      />

      {useVideo ? (
        <video
          autoPlay
          muted
          playsInline
          preload="metadata"
          aria-hidden
          onLoadedMetadata={handleLoaded}
          onTimeUpdate={handleTimeUpdate}
          // Só revela depois que o primeiro quadro útil já está na tela.
          onSeeked={() => setReady(true)}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src="/brand/hero-loop.mp4" type="video/mp4" />
        </video>
      ) : null}
    </>
  );
}
