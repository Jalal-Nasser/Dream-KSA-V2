import Constants from 'expo-constants';

/**
 * Build a version label like: "1.0.0 (100) — Beta"
 * - Reads from expoConfig if available (dev build friendly)
 * - Falls back to 1.0.0 (100) when missing
 * - Always appends "Beta" as requested
 */
export function getVersionLabel(): string {
  const cfg: any = (Constants as any)?.expoConfig ?? {};
  const v =
    cfg?.version ??
    // fallback when version not present in config at runtime
    '1.0.0';
  // Android numeric build code or iOS buildNumber; fallback to 100
  const build =
    cfg?.android?.versionCode?.toString?.() ??
    cfg?.ios?.buildNumber ??
    '100';
  const stage = 'Beta';
  return build ? `${v} (${build}) — ${stage}` : `${v} — ${stage}`;
}
