"use client";

import { CATALOG_BRANDS, PRINTER_CATALOG } from "@/lib/printer-catalog";
import { useI18n } from "@/i18n/client";

/** Ao escolher um modelo, preenche nome e potência do formulário de impressora. */
export function PrinterModelPicker() {
  const p_ = useI18n().t.catalog.printers;
  const label = (m: string) => m.replace("(resina)", `(${p_.resin})`);
  return (
    <div>
      <label className="label" htmlFor="catalog">{p_.model}</label>
      <select
        id="catalog"
        className="input"
        defaultValue=""
        onChange={(e) => {
          const m = PRINTER_CATALOG[Number(e.target.value)];
          const form = e.currentTarget.form;
          if (!m || !form) return;
          const set = (name: string, v: string) => {
            const el = form.elements.namedItem(name) as HTMLInputElement | null;
            if (el) el.value = v;
          };
          set("name", `${m.brand} ${m.model.replace(" (resina)", "")}`);
          set("power_watts", String(m.watts));
        }}
      >
        <option value="">{p_.pickModel}</option>
        {CATALOG_BRANDS.map((brand) => (
          <optgroup key={brand} label={brand}>
            {PRINTER_CATALOG.map((m, i) =>
              m.brand === brand ? (
                <option key={i} value={i}>
                  {label(m.model)} — {m.watts} W{m.source === "oficial" ? ` (${p_.official})` : ""}
                </option>
              ) : null,
            )}
          </optgroup>
        ))}
      </select>
      <p className="hint">{p_.pickHint}</p>
    </div>
  );
}
