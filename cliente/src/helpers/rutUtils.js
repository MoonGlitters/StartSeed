// --- rutUtils.js ---
// Funciones reutilizables para formatear, limpiar y validar RUT chileno.

export const normalizeRut = (value = "") => {
  const clean = value.replace(/[^0-9kK]/g, "").toUpperCase();
  if (clean.length === 0) return "";
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  return `${body}-${dv}`;
};

export const formatRutPretty = (value = "") => {
  const clean = value.replace(/[^0-9kK]/g, "").toUpperCase();
  if (clean.length <= 1) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  let bodyWithDots = "";
  let counter = 0;
  for (let i = body.length - 1; i >= 0; i--) {
    bodyWithDots = body[i] + bodyWithDots;
    counter++;
    if (counter === 3 && i !== 0) {
      bodyWithDots = "." + bodyWithDots;
      counter = 0;
    }
  }
  return `${bodyWithDots}-${dv}`;
};

export const isValidRut = (value = "") => {
  const clean = value.replace(/[^0-9kK]/g, "").toUpperCase();
  if (clean.length < 2) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const rest = 11 - (sum % 11);
  const dvCalc = rest === 11 ? "0" : rest === 10 ? "K" : String(rest);

  return dv === dvCalc;
};
