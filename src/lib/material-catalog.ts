import type { Locale } from "@/i18n/config";

type Group = { group: string; types: string[] };

/** Tipos de material mais usados, agrupados para o seletor (por idioma). */
const GROUPS: Record<Locale, Group[]> = {
  pt: [
    { group: "PLA", types: ["PLA", "PLA+", "PLA Silk", "PLA Matte (fosco)", "PLA Alta Velocidade", "PLA Madeira", "PLA Mármore", "PLA Glow (brilha no escuro)", "PLA Translúcido", "PLA-CF (fibra de carbono)"] },
    { group: "PETG", types: ["PETG", "PETG-CF", "PETG Translúcido"] },
    { group: "Técnicos", types: ["ABS", "ASA", "PC (policarbonato)", "Nylon / PA", "PA-CF", "HIPS", "PVA (suporte solúvel)"] },
    { group: "Flexíveis", types: ["TPU 95A", "TPU 85A", "TPE"] },
    { group: "Resina", types: ["Resina padrão", "Resina ABS-like", "Resina lavável em água", "Resina 8K / alta definição", "Resina flexível", "Resina transparente"] },
    { group: "Outro", types: ["Outro"] },
  ],
  en: [
    { group: "PLA", types: ["PLA", "PLA+", "PLA Silk", "PLA Matte", "PLA High Speed", "PLA Wood", "PLA Marble", "PLA Glow in the dark", "PLA Translucent", "PLA-CF (carbon fiber)"] },
    { group: "PETG", types: ["PETG", "PETG-CF", "PETG Translucent"] },
    { group: "Engineering", types: ["ABS", "ASA", "PC (polycarbonate)", "Nylon / PA", "PA-CF", "HIPS", "PVA (soluble support)"] },
    { group: "Flexible", types: ["TPU 95A", "TPU 85A", "TPE"] },
    { group: "Resin", types: ["Standard resin", "ABS-like resin", "Water-washable resin", "8K / high-detail resin", "Flexible resin", "Clear resin"] },
    { group: "Other", types: ["Other"] },
  ],
  es: [
    { group: "PLA", types: ["PLA", "PLA+", "PLA Silk", "PLA Mate", "PLA Alta Velocidad", "PLA Madera", "PLA Mármol", "PLA Glow (brilla en la oscuridad)", "PLA Translúcido", "PLA-CF (fibra de carbono)"] },
    { group: "PETG", types: ["PETG", "PETG-CF", "PETG Translúcido"] },
    { group: "Técnicos", types: ["ABS", "ASA", "PC (policarbonato)", "Nylon / PA", "PA-CF", "HIPS", "PVA (soporte soluble)"] },
    { group: "Flexibles", types: ["TPU 95A", "TPU 85A", "TPE"] },
    { group: "Resina", types: ["Resina estándar", "Resina tipo ABS", "Resina lavable con agua", "Resina 8K / alta definición", "Resina flexible", "Resina transparente"] },
    { group: "Otro", types: ["Otro"] },
  ],
};

export const materialGroups = (l: Locale) => GROUPS[l];
/** Compatibilidade: grupos em português. */
export const MATERIAL_GROUPS = GROUPS.pt;

type Suggestion = { name: string; unit: string };

const SUGGESTIONS: Record<Locale, Suggestion[]> = {
  pt: [
    { name: "Argola de chaveiro", unit: "un" },
    { name: "Corrente para chaveiro", unit: "un" },
    { name: "Mosquetão", unit: "un" },
    { name: "Ímã de neodímio", unit: "un" },
    { name: "Parafuso", unit: "un" },
    { name: "Inserto roscado (latão)", unit: "un" },
    { name: "Ventosa", unit: "un" },
    { name: "Fita dupla face", unit: "cm" },
    { name: "Lâmpada / fita LED", unit: "un" },
    { name: "Cola instantânea", unit: "g" },
    { name: "Tinta / primer", unit: "ml" },
    { name: "Lixa", unit: "un" },
    { name: "Saquinho / embalagem", unit: "un" },
    { name: "Caixa", unit: "un" },
    { name: "Plástico bolha", unit: "cm" },
    { name: "Etiqueta / adesivo", unit: "un" },
    { name: "Cartão de agradecimento", unit: "un" },
  ],
  en: [
    { name: "Keyring", unit: "pc" },
    { name: "Keychain chain", unit: "pc" },
    { name: "Carabiner", unit: "pc" },
    { name: "Neodymium magnet", unit: "pc" },
    { name: "Screw", unit: "pc" },
    { name: "Threaded insert (brass)", unit: "pc" },
    { name: "Suction cup", unit: "pc" },
    { name: "Double-sided tape", unit: "in" },
    { name: "Bulb / LED strip", unit: "pc" },
    { name: "Super glue", unit: "g" },
    { name: "Paint / primer", unit: "ml" },
    { name: "Sandpaper", unit: "pc" },
    { name: "Bag / packaging", unit: "pc" },
    { name: "Box", unit: "pc" },
    { name: "Bubble wrap", unit: "in" },
    { name: "Label / sticker", unit: "pc" },
    { name: "Thank-you card", unit: "pc" },
  ],
  es: [
    { name: "Argolla de llavero", unit: "u" },
    { name: "Cadena para llavero", unit: "u" },
    { name: "Mosquetón", unit: "u" },
    { name: "Imán de neodimio", unit: "u" },
    { name: "Tornillo", unit: "u" },
    { name: "Inserto roscado (latón)", unit: "u" },
    { name: "Ventosa", unit: "u" },
    { name: "Cinta doble faz", unit: "cm" },
    { name: "Foco / tira LED", unit: "u" },
    { name: "Pegamento instantáneo", unit: "g" },
    { name: "Pintura / primer", unit: "ml" },
    { name: "Lija", unit: "u" },
    { name: "Bolsita / empaque", unit: "u" },
    { name: "Caja", unit: "u" },
    { name: "Plástico de burbujas", unit: "cm" },
    { name: "Etiqueta / sticker", unit: "u" },
    { name: "Tarjeta de agradecimiento", unit: "u" },
  ],
};

export const supplySuggestions = (l: Locale) => SUGGESTIONS[l];
export const SUPPLY_SUGGESTIONS = SUGGESTIONS.pt;

const UNITS: Record<Locale, string[]> = {
  pt: ["un", "par", "g", "ml", "cm", "m"],
  en: ["pc", "pair", "g", "ml", "in", "ft", "cm", "m"],
  es: ["u", "par", "g", "ml", "cm", "m"],
};
export const supplyUnits = (l: Locale) => UNITS[l];
export const SUPPLY_UNITS = UNITS.pt;
