// Pure function: drop oldest if length > maxAge

export function prune(history: string[], maxAge: number): string[] {
  if (history.length <= maxAge) {
    return history;
  }
  
  // Keep only the most recent maxAge entries
  return history.slice(history.length - maxAge);
}