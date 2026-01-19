export const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
export const isValidPhone = (s: string) => /^[0-9+\-\s()]{7,20}$/.test(s);

export const isResetKeyword = (s: string) => {
  const input = (s ?? "").trim().toLowerCase();
  return ["hola", "hi", "hello", "menu", "menú", "menú.", "menu."].includes(input);
};
