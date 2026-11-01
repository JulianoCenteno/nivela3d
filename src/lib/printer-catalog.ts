/**
 * Catálogo de impressoras populares com consumo MÉDIO durante a impressão (PLA).
 * - Bambu Lab: valores oficiais do Bambu Lab Wiki (Power Consumption).
 * - Demais: estimativas a partir de medições públicas de modelos da mesma classe
 *   (bed-slingers ~80–150 W, CoreXY fechadas ~100–250 W, resina ~40–70 W).
 * O usuário pode sempre ajustar o valor; com um medidor de tomada fica exato.
 */
export interface PrinterModel {
  brand: string;
  model: string;
  watts: number;
  /** "oficial" = dado do fabricante; "estimado" = média de medições da classe. */
  source: "oficial" | "estimado";
  type: "FDM" | "Resina";
}

export const PRINTER_CATALOG: PrinterModel[] = [
  // Bambu Lab
  { brand: "Bambu Lab", model: "A1 mini", watts: 80, source: "oficial", type: "FDM" },
  { brand: "Bambu Lab", model: "A1", watts: 95, source: "oficial", type: "FDM" },
  { brand: "Bambu Lab", model: "P1P", watts: 110, source: "oficial", type: "FDM" },
  { brand: "Bambu Lab", model: "P1S", watts: 105, source: "oficial", type: "FDM" },
  { brand: "Bambu Lab", model: "P2S", watts: 110, source: "estimado", type: "FDM" },
  { brand: "Bambu Lab", model: "X1 Carbon", watts: 105, source: "oficial", type: "FDM" },
  { brand: "Bambu Lab", model: "X1E", watts: 185, source: "oficial", type: "FDM" },
  { brand: "Bambu Lab", model: "H2S", watts: 180, source: "estimado", type: "FDM" },
  { brand: "Bambu Lab", model: "H2D", watts: 197, source: "oficial", type: "FDM" },
  // Creality
  { brand: "Creality", model: "Ender-3 V3 SE", watts: 110, source: "estimado", type: "FDM" },
  { brand: "Creality", model: "Ender-3 V3 KE", watts: 115, source: "estimado", type: "FDM" },
  { brand: "Creality", model: "Ender-3 V3", watts: 120, source: "estimado", type: "FDM" },
  { brand: "Creality", model: "Ender-3 V3 Plus", watts: 150, source: "estimado", type: "FDM" },
  { brand: "Creality", model: "Ender-3 S1 / S1 Pro", watts: 120, source: "estimado", type: "FDM" },
  { brand: "Creality", model: "Creality Hi", watts: 120, source: "estimado", type: "FDM" },
  { brand: "Creality", model: "K1C", watts: 130, source: "estimado", type: "FDM" },
  { brand: "Creality", model: "K1 Max", watts: 200, source: "estimado", type: "FDM" },
  { brand: "Creality", model: "K2 / K2 Pro", watts: 170, source: "estimado", type: "FDM" },
  { brand: "Creality", model: "K2 Plus", watts: 250, source: "estimado", type: "FDM" },
  { brand: "Creality", model: "Halot-Mage (resina)", watts: 55, source: "estimado", type: "Resina" },
  // Elegoo
  { brand: "Elegoo", model: "Neptune 4 / 4 Pro", watts: 130, source: "estimado", type: "FDM" },
  { brand: "Elegoo", model: "Neptune 4 Max", watts: 220, source: "estimado", type: "FDM" },
  { brand: "Elegoo", model: "Centauri Carbon", watts: 130, source: "estimado", type: "FDM" },
  { brand: "Elegoo", model: "Centauri Carbon 2", watts: 130, source: "estimado", type: "FDM" },
  { brand: "Elegoo", model: "Mars 5 Ultra (resina)", watts: 40, source: "estimado", type: "Resina" },
  { brand: "Elegoo", model: "Saturn 4 Ultra (resina)", watts: 60, source: "estimado", type: "Resina" },
  // Anycubic
  { brand: "Anycubic", model: "Kobra 3 / Kobra 3 Combo", watts: 120, source: "estimado", type: "FDM" },
  { brand: "Anycubic", model: "Kobra S1", watts: 150, source: "estimado", type: "FDM" },
  { brand: "Anycubic", model: "Kobra X", watts: 120, source: "estimado", type: "FDM" },
  { brand: "Anycubic", model: "Photon Mono M7 Pro (resina)", watts: 55, source: "estimado", type: "Resina" },
  // Prusa
  { brand: "Prusa", model: "MINI+", watts: 60, source: "estimado", type: "FDM" },
  { brand: "Prusa", model: "MK4S", watts: 90, source: "estimado", type: "FDM" },
  { brand: "Prusa", model: "Core One", watts: 110, source: "estimado", type: "FDM" },
  // Flashforge
  { brand: "Flashforge", model: "Adventurer 5M / 5M Pro", watts: 110, source: "estimado", type: "FDM" },
  { brand: "Flashforge", model: "AD5X", watts: 110, source: "estimado", type: "FDM" },
  // QIDI
  { brand: "QIDI", model: "Q1 Pro", watts: 160, source: "estimado", type: "FDM" },
  { brand: "QIDI", model: "Plus4", watts: 250, source: "estimado", type: "FDM" },
  // Sovol
  { brand: "Sovol", model: "SV06 / SV06 Plus", watts: 110, source: "estimado", type: "FDM" },
  { brand: "Sovol", model: "SV08", watts: 180, source: "estimado", type: "FDM" },
];

export const CATALOG_BRANDS = [...new Set(PRINTER_CATALOG.map((p) => p.brand))];
