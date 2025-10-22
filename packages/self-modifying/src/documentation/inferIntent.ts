/**
 * documentation/inferIntent.ts
 * Event 010: Intent Inference from Test Cases
 *
 * Математична семантика через приклади (не NLP).
 * Система розпізнає паттерни в test cases і виводить інтенцію.
 */

export interface InferredIntent {
  semanticName: string;         // "average", "sum", "product", etc.
  description: string;           // Human-readable purpose
  confidence: number;            // 0.0 - 1.0
  pattern: string;              // Mathematical pattern detected
}

/**
 * Інферує інтенцію з test cases
 *
 * Аналізує математичні відношення між input та output.
 */
export const inferIntent = (testCases: Array<{ input: any; expected: any }>): InferredIntent => {
  // Default: unknown
  let result: InferredIntent = {
    semanticName: 'unknown',
    description: 'Unknown morphism',
    confidence: 0,
    pattern: 'no pattern detected'
  };

  // Need at least 2 test cases for pattern detection
  if (testCases.length < 2) {
    return result;
  }

  // Try to detect patterns
  const patterns = [
    detectAverage,
    detectSum,
    detectProduct,
    detectMax,
    detectMin,
    detectCount,
    detectMedian,
    detectFirst,
    detectLast
  ];

  for (const detector of patterns) {
    const detected = detector(testCases);
    if (detected && detected.confidence > result.confidence) {
      result = detected;
    }
  }

  return result;
};

// ============================================================================
// PATTERN DETECTORS
// ============================================================================

/**
 * Detect average pattern
 * Input: array-like, Output: sum/length
 */
const detectAverage = (testCases: Array<{ input: any; expected: any }>): InferredIntent | null => {
  try {
    let matches = 0;

    for (const tc of testCases) {
      // Convert input to array of numbers
      const arr = inputToArray(tc.input);
      if (!arr) continue;

      // Calculate expected average
      const sum = arr.reduce((a, b) => a + b, 0);
      const avg = sum / arr.length;

      // Check if output matches average
      if (Math.abs(tc.expected - avg) < 0.01) {
        matches++;
      }
    }

    const confidence = matches / testCases.length;

    if (confidence >= 0.8) {
      return {
        semanticName: 'average',
        description: 'Обчислює середнє значення елементів послідовності',
        confidence,
        pattern: '(x₁ + x₂ + ... + xₙ) / n'
      };
    }
  } catch (error) {
    // Pattern doesn't match
  }

  return null;
};

/**
 * Detect sum pattern
 */
const detectSum = (testCases: Array<{ input: any; expected: any }>): InferredIntent | null => {
  try {
    let matches = 0;

    for (const tc of testCases) {
      const arr = inputToArray(tc.input);
      if (!arr) continue;

      const sum = arr.reduce((a, b) => a + b, 0);

      if (Math.abs(tc.expected - sum) < 0.01) {
        matches++;
      }
    }

    const confidence = matches / testCases.length;

    if (confidence >= 0.8) {
      return {
        semanticName: 'sum',
        description: 'Обчислює суму всіх елементів',
        confidence,
        pattern: 'x₁ + x₂ + ... + xₙ'
      };
    }
  } catch (error) {
    // Pattern doesn't match
  }

  return null;
};

/**
 * Detect product pattern
 */
const detectProduct = (testCases: Array<{ input: any; expected: any }>): InferredIntent | null => {
  try {
    let matches = 0;

    for (const tc of testCases) {
      const arr = inputToArray(tc.input);
      if (!arr) continue;

      const product = arr.reduce((a, b) => a * b, 1);

      if (Math.abs(tc.expected - product) < 0.01) {
        matches++;
      }
    }

    const confidence = matches / testCases.length;

    if (confidence >= 0.8) {
      return {
        semanticName: 'product',
        description: 'Обчислює добуток всіх елементів',
        confidence,
        pattern: 'x₁ × x₂ × ... × xₙ'
      };
    }
  } catch (error) {
    // Pattern doesn't match
  }

  return null;
};

/**
 * Detect max pattern
 */
const detectMax = (testCases: Array<{ input: any; expected: any }>): InferredIntent | null => {
  try {
    let matches = 0;

    for (const tc of testCases) {
      const arr = inputToArray(tc.input);
      if (!arr) continue;

      const max = Math.max(...arr);

      if (Math.abs(tc.expected - max) < 0.01) {
        matches++;
      }
    }

    const confidence = matches / testCases.length;

    if (confidence >= 0.8) {
      return {
        semanticName: 'max',
        description: 'Знаходить максимальний елемент',
        confidence,
        pattern: 'max(x₁, x₂, ..., xₙ)'
      };
    }
  } catch (error) {
    // Pattern doesn't match
  }

  return null;
};

/**
 * Detect min pattern
 */
const detectMin = (testCases: Array<{ input: any; expected: any }>): InferredIntent | null => {
  try {
    let matches = 0;

    for (const tc of testCases) {
      const arr = inputToArray(tc.input);
      if (!arr) continue;

      const min = Math.min(...arr);

      if (Math.abs(tc.expected - min) < 0.01) {
        matches++;
      }
    }

    const confidence = matches / testCases.length;

    if (confidence >= 0.8) {
      return {
        semanticName: 'min',
        description: 'Знаходить мінімальний елемент',
        confidence,
        pattern: 'min(x₁, x₂, ..., xₙ)'
      };
    }
  } catch (error) {
    // Pattern doesn't match
  }

  return null;
};

/**
 * Detect count pattern
 */
const detectCount = (testCases: Array<{ input: any; expected: any }>): InferredIntent | null => {
  try {
    let matches = 0;

    for (const tc of testCases) {
      const arr = inputToArray(tc.input);
      if (!arr) continue;

      if (tc.expected === arr.length) {
        matches++;
      }
    }

    const confidence = matches / testCases.length;

    if (confidence >= 0.8) {
      return {
        semanticName: 'count',
        description: 'Підраховує кількість елементів',
        confidence,
        pattern: 'n (length)'
      };
    }
  } catch (error) {
    // Pattern doesn't match
  }

  return null;
};

/**
 * Detect median pattern
 */
const detectMedian = (testCases: Array<{ input: any; expected: any }>): InferredIntent | null => {
  try {
    let matches = 0;

    for (const tc of testCases) {
      const arr = inputToArray(tc.input);
      if (!arr) continue;

      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];

      if (Math.abs(tc.expected - median) < 0.01) {
        matches++;
      }
    }

    const confidence = matches / testCases.length;

    if (confidence >= 0.8) {
      return {
        semanticName: 'median',
        description: 'Знаходить медіану (середній елемент)',
        confidence,
        pattern: 'middle value of sorted array'
      };
    }
  } catch (error) {
    // Pattern doesn't match
  }

  return null;
};

/**
 * Detect first element pattern
 */
const detectFirst = (testCases: Array<{ input: any; expected: any }>): InferredIntent | null => {
  try {
    let matches = 0;

    for (const tc of testCases) {
      const arr = inputToArray(tc.input);
      if (!arr || arr.length === 0) continue;

      if (tc.expected === arr[0]) {
        matches++;
      }
    }

    const confidence = matches / testCases.length;

    if (confidence >= 0.8) {
      return {
        semanticName: 'first',
        description: 'Повертає перший елемент',
        confidence,
        pattern: 'x₁'
      };
    }
  } catch (error) {
    // Pattern doesn't match
  }

  return null;
};

/**
 * Detect last element pattern
 */
const detectLast = (testCases: Array<{ input: any; expected: any }>): InferredIntent | null => {
  try {
    let matches = 0;

    for (const tc of testCases) {
      const arr = inputToArray(tc.input);
      if (!arr || arr.length === 0) continue;

      if (tc.expected === arr[arr.length - 1]) {
        matches++;
      }
    }

    const confidence = matches / testCases.length;

    if (confidence >= 0.8) {
      return {
        semanticName: 'last',
        description: 'Повертає останній елемент',
        confidence,
        pattern: 'xₙ'
      };
    }
  } catch (error) {
    // Pattern doesn't match
  }

  return null;
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Convert input to array of numbers
 *
 * Handles:
 * - Number (as range 0..n-1)
 * - Array
 */
const inputToArray = (input: any): number[] | null => {
  if (typeof input === 'number') {
    // Range: 0 to n-1
    return Array.from({ length: input }, (_, i) => i);
  }

  if (Array.isArray(input)) {
    return input.filter(x => typeof x === 'number');
  }

  return null;
};
