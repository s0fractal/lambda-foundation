// Pure function: append current form to history

export function remember(history: string[], currentForm: string): string[] {
  // Don't add duplicates (same form as last)
  if (history.length > 0 && history[history.length - 1] === currentForm) {
    return history;
  }
  
  // Create new history array (immutable)
  return [...history, currentForm];
}