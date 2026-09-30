import type { OpeningHour, OptionGroup, Product, Store } from "./types";

/** Preço efetivamente cobrado: promoção quando existir e for menor. */
export function effectivePriceCents(product: Product): number {
  const { priceCents, promoPriceCents } = product;
  if (promoPriceCents !== null && promoPriceCents < priceCents) return promoPriceCents;
  return priceCents;
}

export function hasPromo(product: Product): boolean {
  return effectivePriceCents(product) < product.priceCents;
}

/** Um produto é "simples" quando não há nada para escolher antes de adicionar. */
export function isSimpleProduct(product: Product): boolean {
  return product.optionGroups.length === 0;
}

export function isGroupRequired(group: OptionGroup): boolean {
  return group.minSelect > 0;
}

export function isSingleChoice(group: OptionGroup): boolean {
  return group.maxSelect === 1;
}

/** Texto de apoio do grupo, quando o lojista não escreveu um. */
export function groupHelperText(group: OptionGroup): string {
  if (group.helperText) return group.helperText;
  if (isSingleChoice(group)) return "Escolha 1 opção";
  if (group.minSelect > 0) return `Escolha de ${group.minSelect} a ${group.maxSelect}`;
  return `Escolha até ${group.maxSelect}`;
}

/* --------------------------------------------------- Horário de funcionamento */

function minutesOfDay(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Considera janelas que viram a meia-noite (18:00 → 02:00 do dia seguinte),
 * que é o caso normal de hamburgueria.
 */
export function isWithinHours(hours: readonly OpeningHour[], at: Date): boolean {
  const weekday = at.getDay();
  const nowMinutes = at.getHours() * 60 + at.getMinutes();

  return hours.some((hour) => {
    const opens = minutesOfDay(hour.opensAt);
    const closes = minutesOfDay(hour.closesAt);

    if (closes > opens) {
      return hour.weekday === weekday && nowMinutes >= opens && nowMinutes < closes;
    }
    // Janela atravessa a meia-noite.
    const yesterday = (weekday + 6) % 7;
    if (hour.weekday === weekday && nowMinutes >= opens) return true;
    return hour.weekday === yesterday && nowMinutes < closes;
  });
}

export function isStoreOpen(store: Store, at: Date = new Date()): boolean {
  return store.acceptingOrders && isWithinHours(store.openingHours, at);
}

const WEEKDAY_LABELS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function weekdayLabel(weekday: number): string {
  return WEEKDAY_LABELS[weekday] ?? "";
}

/** "Abre sexta às 18:00" — próxima janela a partir de agora. */
export function nextOpeningLabel(store: Store, at: Date = new Date()): string | null {
  if (store.openingHours.length === 0) return null;

  for (let offset = 0; offset < 8; offset += 1) {
    const day = (at.getDay() + offset) % 7;
    const candidates = store.openingHours
      .filter((hour) => hour.weekday === day)
      .sort((a, b) => minutesOfDay(a.opensAt) - minutesOfDay(b.opensAt));

    for (const candidate of candidates) {
      const isToday = offset === 0;
      const nowMinutes = at.getHours() * 60 + at.getMinutes();
      if (isToday && minutesOfDay(candidate.opensAt) <= nowMinutes) continue;
      const when = isToday ? "hoje" : offset === 1 ? "amanhã" : weekdayLabel(day).toLowerCase();
      return `Abre ${when} às ${candidate.opensAt}`;
    }
  }
  return null;
}
