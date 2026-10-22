/** توليد معرف فريد — crypto.randomUUID مع fallback آمن للأجهزة القديمة */
export const uid = (): string => {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    /* fallback تحت */
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};
