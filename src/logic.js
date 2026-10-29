export function checkCode(input, expected) {
  return typeof expected === 'string' && /^\d+$/.test(expected) && input === expected;
}
export function validateExternalUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return { error: 'المفاجأة لم تجهز بعد' };
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) throw new Error();
    return { url: url.href };
  } catch {
    return { error: 'رابط المفاجأة غير صالح. يرجى إضافة رابط كامل وآمن يبدأ بـ HTTPS في الإعدادات.' };
  }
}
