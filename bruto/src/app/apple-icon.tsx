import { ImageResponse } from "next/og";

/**
 * Ícone de tamanho grande: tela inicial do iPhone, atalho, instalação.
 *
 * Aqui cabe o desenho completo — o gergelim no pão e o recorte da alface —
 * que na aba do navegador, a 16 px, viraria mancha. O `icon.svg` cuida do
 * tamanho pequeno com a versão simplificada.
 */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", backgroundColor: "#0e0e0e" }}>
        <svg width="180" height="180" viewBox="0 0 64 64">
          <path
            d="M14 12H36c6.5 0 10.5 4 10.5 9.5 0 4-2 7-5.5 8.5 4.5 1.3 8 5 8 10.5 0 6.5-4.5 11.5-11.5 11.5H14Z"
            fill="#ede8de"
          />
          <ellipse cx="25.5" cy="19" rx="1.5" ry="2.3" transform="rotate(-20 25.5 19)" fill="#0e0e0e" />
          <ellipse cx="30.5" cy="21" rx="1.5" ry="2.3" transform="rotate(15 30.5 21)" fill="#0e0e0e" />
          <ellipse cx="35" cy="18.5" rx="1.5" ry="2.3" transform="rotate(-10 35 18.5)" fill="#0e0e0e" />
          <ellipse cx="39" cy="21" rx="1.5" ry="2.3" transform="rotate(22 39 21)" fill="#0e0e0e" />
          <rect x="22" y="25" width="19.5" height="9" rx="2.5" fill="#0e0e0e" />
          <rect x="22" y="27.9" width="20.5" height="3.2" rx=".6" fill="#ff4b2b" />
          <path
            d="M22 39c1.6-1.8 3.4-.3 4.8.7 1.5 1 2.8-1 4.6-1.5 1.9-.5 2.8 1.6 4.6 1.1 1.4-.4 2.3-1.7 3.6-.8V43a2.5 2.5 0 0 1-2.5 2.5H24.5A2.5 2.5 0 0 1 22 43Z"
            fill="#0e0e0e"
          />
        </svg>
      </div>
    ),
    size,
  );
}
