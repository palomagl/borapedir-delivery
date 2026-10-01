/**
 * Sessão administrativa sem banco.
 *
 * O projeto é de portfólio e roda sobre o seed, então não há tabela de
 * usuários. O que existe é uma senha de operação e um cookie assinado com
 * HMAC: o servidor consegue provar que emitiu aquele cookie e que ele não
 * expirou, sem guardar sessão em lugar nenhum.
 *
 * Usa Web Crypto de propósito — é o que funciona tanto no middleware (edge)
 * quanto nas server actions (node).
 */

export const SESSION_COOKIE = "bruto_admin";

/** Oito horas: um turno. Depois disso a pessoa entra de novo. */
const MAX_AGE_SECONDS = 60 * 60 * 8;

/**
 * Sem ADMIN_PASSWORD definida o projeto assume modo demonstração, com uma
 * senha pública. É o que permite alguém abrir o portfólio e ver a operação
 * por dentro. Em produção, defina a variável.
 */
const DEMO_PASSWORD = "bruto";

export function isDemoMode(): boolean {
  return !process.env.ADMIN_PASSWORD;
}

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEMO_PASSWORD;
}

/**
 * Sem AUTH_SECRET o cookie é assinado com uma chave derivada da senha. Não é
 * o ideal — é o que mantém o projeto funcionando sem configuração, e a
 * assinatura continua verificável.
 */
function secret(): string {
  return process.env.AUTH_SECRET || `bruto-dev-${adminPassword()}`;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

/** Comparação em tempo constante: evita descobrir a senha medindo o tempo. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function isPasswordValid(candidate: string): boolean {
  return timingSafeEqual(candidate, adminPassword());
}

/** Token no formato `expiraEm.assinatura`. */
export async function createSessionToken(now: number = Date.now()): Promise<string> {
  const expiresAt = Math.floor(now / 1000) + MAX_AGE_SECONDS;
  const payload = String(expiresAt);
  return `${payload}.${await sign(payload)}`;
}

export async function isSessionTokenValid(
  token: string | undefined,
  now: number = Date.now(),
): Promise<boolean> {
  if (!token) return false;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt)) return false;
  if (expiresAt * 1000 < now) return false;

  return timingSafeEqual(signature, await sign(payload));
}

export const SESSION_MAX_AGE = MAX_AGE_SECONDS;
