/**
 * Base de datos de interacciones medicamentosas (CDSS - Grupo 2).
 * Cada entrada define un par de medicamentos y el nivel de alerta.
 * Fuente de referencia: Interacciones de uso común en atención primaria (OPS/OMS).
 */
export const DRUG_INTERACTIONS = [
  {
    drugs: ["warfarina", "aspirina", "ácido acetilsalicílico", "aas"],
    level: "critico",
    message: "Warfarina + AAS: riesgo alto de hemorragia. Monitorear TP/INR con frecuencia.",
  },
  {
    drugs: ["warfarina", "ibuprofeno", "naproxeno", "diclofenaco", "aine"],
    level: "critico",
    message: "Warfarina + AINE: riesgo alto de sangrado GI. Evitar combinación si es posible.",
  },
  {
    drugs: ["metformina", "alcohol"],
    level: "advertencia",
    message: "Metformina + alcohol: riesgo de acidosis láctica. Evitar consumo de alcohol.",
  },
  {
    drugs: ["metronidazol", "alcohol"],
    level: "critico",
    message: "Metronidazol + alcohol: reacción tipo disulfiram (náuseas, taquicardia). Contraindicado.",
  },
  {
    drugs: ["enalapril", "lisinopril", "captopril", "ramipril", "ieca", "potasio", "cloruro de potasio"],
    level: "advertencia",
    message: "IECA + suplementos de potasio: riesgo de hiperpotasemia. Monitorear electrolitos.",
  },
  {
    drugs: ["enalapril", "lisinopril", "captopril", "ramipril", "ieca", "espironolactona", "diurético ahorrador de potasio"],
    level: "advertencia",
    message: "IECA + espironolactona: riesgo de hiperpotasemia severa. Control frecuente de potasio sérico.",
  },
  {
    drugs: ["amoxicilina", "ampicilina", "rifampicina", "anticonceptivo", "anticonceptivos orales"],
    level: "elevado",
    message: "Antibiótico + anticonceptivos orales: posible reducción de eficacia anticonceptiva. Usar método adicional.",
  },
  {
    drugs: ["ciprofloxacino", "levofloxacino", "amiodarona", "sotalol", "qt"],
    level: "advertencia",
    message: "Fluoroquinolona + antiarrítmico: riesgo de prolongación del QT. Monitorear ECG.",
  },
  {
    drugs: ["digoxina", "amiodarona"],
    level: "critico",
    message: "Digoxina + amiodarona: la amiodarona eleva niveles de digoxina. Riesgo de toxicidad digitálica.",
  },
  {
    drugs: ["litio", "ibuprofeno", "diclofenaco", "naproxeno", "aine"],
    level: "critico",
    message: "Litio + AINE: los AINEs aumentan niveles de litio. Riesgo de toxicidad por litio.",
  },
  {
    drugs: ["sildenafil", "nitratos", "nitroglicerina", "isosorbide"],
    level: "critico",
    message: "Sildenafil + nitratos: hipotensión severa potencialmente fatal. Contraindicado.",
  },
  {
    drugs: ["simvastatina", "lovastatina", "eritromicina", "claritromicina", "azitromicina"],
    level: "advertencia",
    message: "Estatina + macrólido: riesgo de miopatía/rabdomiólisis. Considerar ajuste de dosis.",
  },
  {
    drugs: ["tramadol", "fluoxetina", "sertralina", "paroxetina", "isrs"],
    level: "advertencia",
    message: "Tramadol + ISRS: riesgo de síndrome serotoninérgico (agitación, hipertermia, taquicardia).",
  },
  {
    drugs: ["metotrexato", "ibuprofeno", "diclofenaco", "aine", "aspirina"],
    level: "critico",
    message: "Metotrexato + AINE: los AINEs reducen eliminación renal del metotrexato. Toxicidad grave.",
  },
  {
    drugs: ["clonazepam", "alprazolam", "diazepam", "benzodiacepina", "alcohol"],
    level: "critico",
    message: "Benzodiacepina + alcohol: depresión severa del SNC. Riesgo de apnea y muerte. Contraindicado.",
  },
];

/**
 * Verifica interacciones entre una nueva droga y la lista de medicamentos actuales.
 * @param {string} newDrug - Nombre del nuevo medicamento a ingresar
 * @param {string[]} currentMeds - Lista de nombres de medicamentos actuales del paciente
 * @returns {{ level, message }[]} - Alertas encontradas
 */
export const checkDrugInteractions = (newDrug, currentMeds) => {
  if (!newDrug?.trim() || !currentMeds?.length) return [];

  const normalize = (s) => s.toLowerCase().trim();
  const newLow = normalize(newDrug);
  const currentLow = currentMeds.map(normalize);

  const alerts = [];

  for (const entry of DRUG_INTERACTIONS) {
    const drugsLow = entry.drugs.map(normalize);
    // La nueva droga coincide con alguno del par
    const newMatches = drugsLow.some((d) => newLow.includes(d) || d.includes(newLow));
    if (!newMatches) continue;

    // Algún medicamento actual coincide con otro del par
    const currentMatches = drugsLow.some((d) =>
      currentLow.some((cm) => cm.includes(d) || d.includes(cm))
    );
    if (!currentMatches) continue;

    // Evitar alertar sobre la misma droga consigo misma
    const otherDrug = drugsLow.find((d) => !newLow.includes(d) && !d.includes(newLow));
    const conflictingCurrent = currentLow.find((cm) => otherDrug && (cm.includes(otherDrug) || otherDrug.includes(cm)));
    if (!conflictingCurrent) continue;

    alerts.push({ level: entry.level, message: entry.message });
  }

  return alerts;
};
