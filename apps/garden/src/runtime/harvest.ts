import { Result } from "./result";

// Помилка ⇒ еволюція: простий мутатор для демонстрації
export const mutateFromError = (code: string) => {
  if (code === "DIV_ZERO" || code === "NON_FINITE") {
    const eps = 1e-9; return (x: number) => (Math.abs(x) < eps ? x / eps : x);
  }
  return (x: number) => x; // no-op
};

export const harvest = <T, E>(r: Result<T, E>) =>
  ("err" in r) ? { grown: true as const, reason: r.err.code } : { grown: false as const };