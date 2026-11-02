// Pure policies shared by handlers and regression tests.
export const TRUSTED_ORIGINS = [
  "https://100289ea-3c34-415f-a645-b7b29b76a548.lovableproject.com",
  "https://id-preview--100289ea-3c34-415f-a645-b7b29b76a548.lovable.app",
  "https://c2c.lovable.app",
  "https://c2c-site.site",
  "http://localhost:8080",
  "http://localhost:5173",
];

export function trustedReturnOrigin(origin: string | null): string {
  return origin && TRUSTED_ORIGINS.includes(origin) ? origin : "https://c2c-site.site";
}

export function ownsCheckout(userId: string, metadata: Record<string, string> | null): boolean {
  return Boolean(userId && metadata?.userId === userId);
}

export function validSensorKey(provided: string | null, expected: string | null): boolean {
  if (!provided || !expected) return false;
  let difference = provided.length ^ expected.length;
  for (let i = 0; i < Math.max(provided.length, expected.length); i++) {
    difference |= (provided.charCodeAt(i) || 0) ^ (expected.charCodeAt(i) || 0);
  }
  return difference === 0;
}