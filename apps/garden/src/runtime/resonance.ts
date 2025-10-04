// Подія композиції як резонанс 432 Hz (UI-двигун інтерпретує цю подію й вмикає WebAudio)
export type ResonanceEvent = { type: "RESONANCE_432"; gain?: number; dur?: number };

export const withResonance = <T>(value: T, active = true): [T, ResonanceEvent[]] => {
  if (!active) return [value, []];
  return [value, [{ type: "RESONANCE_432", gain: 0.05, dur: 0.3 }]];
};