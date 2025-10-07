import { Result, Fn1 } from "./types.js";

export const defaultSamples = (n = 16): number[] =>
  Array.from({ length: n }, (_, i) => i - Math.floor(n / 2));

const hash32 = (s: string): string =>
  [...s].reduce((a, c) => ((a * 131) ^ c.charCodeAt(0)) >>> 0, 0).toString(16);

export const compileFn1 = (src: string): Result<Fn1> => {
  try {
    // UI/host шар несе відповідальність за sandboxing.
    // Тут — лише скелет для демонстрації.
    const f = new Function("x", `return (${src})(x)`) as Fn1;
    // пробний виклик для перевірки арності/валідності
    void f(0);
    return { ok: f };
  } catch (e: any) {
    return { err: { code: "COMPILE_ERR", ctx: e } };
  }
};

export const fingerprint = (f: Fn1, xs: number[] = defaultSamples()): Result<string> => {
  try {
    const vec = xs.map((x) => {
      const y = f(x);
      if (!Number.isFinite(y)) throw { code: "NON_FINITE", ctx: { x, y } };
      return y;
    });
    return { ok: hash32(vec.join(",")) };
  } catch (e: any) {
    return { err: { code: e.code ?? "EXN", ctx: e.ctx ?? e } };
  }
};