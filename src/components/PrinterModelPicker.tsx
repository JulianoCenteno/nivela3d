"use client";

import { CATALOG_BRANDS, PRINTER_CATALOG } from "@/lib/printer-catalog";

/** Ao escolher um modelo, preenche nome e potência do formulário de impressora. */
export function PrinterModelPicker() {
  return (
    <div>
      <label className="label" htmlFor="catalog">Modelo</label>
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
          set("name", `${m.brand} ${m.model}`);
          set("power_watts", String(m.watts));
        }}
      >
        <option value="">Escolha seu modelo (ou preencha manualmente)</option>
        {CATALOG_BRANDS.map((brand) => (
          <optgroup key={brand} label={brand}>
            {PRINTER_CATALOG.map((m, i) =>
              m.brand === brand ? (
                <option key={i} value={i}>
                  {m.model} — {m.watts} W{m.source === "oficial" ? " (oficial)" : ""}
                </option>
              ) : null,
            )}
          </optgroup>
        ))}
      </select>
      <p className="hint">Preenche o nome e o consumo médio. Ajuste se você tiver medido na tomada.</p>
    </div>
  );
}
