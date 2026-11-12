import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * Imagem de preview do link.
 *
 * É o que aparece quando alguém cola o endereço no WhatsApp, no LinkedIn ou
 * numa mensagem. Sem ela, um projeto inteiro de identidade vira um retângulo
 * cinza com o domínio escrito.
 *
 * Foto e fontes entram lidas do repositório, não buscadas na rede: o gerador
 * roda no servidor sem base de URL confiável, e depender de CDN na hora de
 * montar a imagem é depender de mais uma coisa que pode cair.
 */

export const alt = "BRUTO — Burger & Chapa. Carne. Chapa. Fogo. Sem desculpas.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function asset(path: string) {
  return readFile(join(process.cwd(), path));
}

export default async function OpengraphImage() {
  const [cover, bebas, inter] = await Promise.all([
    asset("public/brand/cover.jpg"),
    asset("src/app/fonts/BebasNeue-Regular.ttf"),
    asset("src/app/fonts/Inter-SemiBold.ttf"),
  ]);

  const background = `data:image/jpeg;base64,${cover.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          backgroundColor: "#0e0e0e",
          // A faixa escura à esquerda é o que garante contraste do texto sobre
          // a foto, qualquer que seja o quadro.
          backgroundImage: `linear-gradient(90deg, #0e0e0e 0%, rgba(14,14,14,0.96) 34%, rgba(14,14,14,0.55) 62%, rgba(14,14,14,0.15) 100%), url(${background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "0 80px 76px",
        }}
      >
        {/* O risco vermelho é a assinatura gráfica da marca. */}
        <div style={{ display: "flex", width: 64, height: 7, backgroundColor: "#ff4b2b" }} />

        <div
          style={{
            display: "flex",
            fontFamily: "Inter",
            fontSize: 24,
            letterSpacing: 5,
            color: "#b4ada0",
            marginTop: 28,
          }}
        >
          CARNE. CHAPA. FOGO. SEM DESCULPAS.
        </div>

        <div
          style={{
            display: "flex",
            fontFamily: "Bebas Neue",
            fontSize: 190,
            lineHeight: 1,
            letterSpacing: 2,
            color: "#ede8de",
            marginTop: 6,
          }}
        >
          BRUTO
        </div>

        <div
          style={{
            display: "flex",
            fontFamily: "Inter",
            fontSize: 28,
            letterSpacing: 13,
            color: "#9b9488",
            marginTop: 10,
          }}
        >
          BURGER &amp; CHAPA
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Bebas Neue", data: bebas, style: "normal", weight: 400 },
        { name: "Inter", data: inter, style: "normal", weight: 600 },
      ],
    },
  );
}
