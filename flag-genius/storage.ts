const KEYS = {
  LANG: "flaggenius_lang",
  WRONG: "flaggenius_wrong",
  RIGHT: "flaggenius_right",
};

function getCodes(key: string): string[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCodes(key: string, codes: string[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(codes));
  } catch {
    // localStorage may be unavailable
  }
}

export function getWrongCodes(): string[] {
  return getCodes(KEYS.WRONG);
}

export function getRightCodes(): string[] {
  return getCodes(KEYS.RIGHT);
}

export function addWrongCode(code: string): void {
  const codes = new Set(getCodes(KEYS.WRONG));
  codes.add(code);
  saveCodes(KEYS.WRONG, Array.from(codes));
}

export function addRightCode(code: string): void {
  const codes = new Set(getCodes(KEYS.RIGHT));
  codes.add(code);
  saveCodes(KEYS.RIGHT, Array.from(codes));
}

export function getWrongCount(): number {
  return getCodes(KEYS.WRONG).length;
}

export function getRightCount(): number {
  return getCodes(KEYS.RIGHT).length;
}

export function clearWrongCodes(): void {
  try {
    localStorage.removeItem(KEYS.WRONG);
  } catch {}
}

export function clearRightCodes(): void {
  try {
    localStorage.removeItem(KEYS.RIGHT);
  } catch {}
}
