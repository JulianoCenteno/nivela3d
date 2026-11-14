import type { Locale } from "./config";
import common from "./messages/common";
import flash from "./messages/flash";
import gestao from "./messages/gestao";
import ops from "./messages/ops";
import money from "./messages/money";
import catalog from "./messages/catalog";
import manage from "./messages/manage";
import products from "./messages/products";
import content from "./messages/content";
import landing from "./messages/landing";

const AREAS = { common, flash, gestao, ops, money, catalog, manage, products, content, landing } as const;

type Areas = typeof AREAS;
export type Dict = { [K in keyof Areas]: Areas[K]["pt"] };

const built = new Map<Locale, Dict>();

export function dictFor(locale: Locale): Dict {
  const hit = built.get(locale);
  if (hit) return hit;
  const d = Object.fromEntries(Object.entries(AREAS).map(([k, v]) => [k, v[locale]])) as Dict;
  built.set(locale, d);
  return d;
}
