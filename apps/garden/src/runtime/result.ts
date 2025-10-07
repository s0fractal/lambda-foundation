export type Result<T, E = string> = { ok: T } | { err: { code: E; ctx?: unknown } };
export const isOk = <T, E>(r: Result<T, E>): r is { ok: T } => (r as any).ok !== undefined;