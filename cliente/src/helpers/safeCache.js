// Maneja el cache de forma segura 

export const getSafeCache = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {

    localStorage.removeItem(key);
    return null;
  }
};

export const setSafeCache = (key, data) => {
  try {
    const payload = JSON.stringify({
      timestamp: Date.now(),
      data,
    });
    localStorage.setItem(key, payload);
  } catch {

  }
};