export const BRSR_MAP: Record<string, string> = {
  ambuja: "/brsr/Ambuja.pdf",
  ultratech: "/brsr/Ultratech.pdf",
  shree: "/brsr/ShreeCement.pdf",
  acc: "/brsr/ACC.pdf",
  dalmia: "/brsr/Dalmia.pdf",
  jkcement: "/brsr/JKCement.pdf",
  "jk-cement": "/brsr/JKCement.pdf", // alias
};

export function getBrsrUrl(id?: string): string | undefined {
  if (!id) return undefined;
  const key = id.toLowerCase();
  const rel = BRSR_MAP[key] ?? `/brsr/${key}.pdf`;
  const base = (import.meta as any).env?.BASE_URL ?? "/";
  return `${base}${rel}`.replace(/\/{2,}/g, "/");
}