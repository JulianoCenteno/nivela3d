/** Tipos de material mais usados, agrupados para o seletor. */
export const MATERIAL_GROUPS: { group: string; types: string[] }[] = [
  { group: "PLA", types: ["PLA", "PLA+", "PLA Silk", "PLA Matte (fosco)", "PLA Alta Velocidade", "PLA Madeira", "PLA Mármore", "PLA Glow (brilha no escuro)", "PLA Translúcido", "PLA-CF (fibra de carbono)"] },
  { group: "PETG", types: ["PETG", "PETG-CF", "PETG Translúcido"] },
  { group: "Técnicos", types: ["ABS", "ASA", "PC (policarbonato)", "Nylon / PA", "PA-CF", "HIPS", "PVA (suporte solúvel)"] },
  { group: "Flexíveis", types: ["TPU 95A", "TPU 85A", "TPE"] },
  { group: "Resina", types: ["Resina padrão", "Resina ABS-like", "Resina lavável em água", "Resina 8K / alta definição", "Resina flexível", "Resina transparente"] },
  { group: "Outro", types: ["Outro"] },
];

/** Sugestões de insumos para cadastrar com um clique. */
export const SUPPLY_SUGGESTIONS: { name: string; unit: string }[] = [
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
];

export const SUPPLY_UNITS = ["un", "par", "g", "ml", "cm", "m"];
