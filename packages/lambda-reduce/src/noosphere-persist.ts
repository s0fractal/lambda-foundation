// Persistent Noosphere Storage
// Git-based: morphisms as files, every change is a commit

import * as fs from 'fs/promises';
import * as path from 'path';
import type { NoosphereMemory, StoredMorphism, TraceLog, EvolutionEntry } from './noosphere.js';

export interface PersistConfig {
  rootPath: string;           // e.g., '.noosphere/'
  morphismsDir: string;        // 'morphisms/'
  tracesDir: string;           // 'traces/'
  evolutionDir: string;        // 'evolution/'
  autoCommit: boolean;         // git commit on every save
  commitMessage?: (change: string) => string;
}

const DEFAULT_CONFIG: PersistConfig = {
  rootPath: '.noosphere',
  morphismsDir: 'morphisms',
  tracesDir: 'traces',
  evolutionDir: 'evolution',
  autoCommit: true,
  commitMessage: (change) => `🧠 Noosphere: ${change}`
};

/**
 * Save noosphere to disk
 */
export async function saveNoosphere(
  noosphere: NoosphereMemory,
  config: Partial<PersistConfig> = {}
): Promise<void> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const root = cfg.rootPath;

  // Ensure directories exist
  await ensureDir(root);
  await ensureDir(path.join(root, cfg.morphismsDir));
  await ensureDir(path.join(root, cfg.tracesDir));
  await ensureDir(path.join(root, cfg.evolutionDir));

  // Save morphisms
  let morphismsSaved = 0;
  for (const [name, stored] of noosphere.morphisms.entries()) {
    const filepath = path.join(root, cfg.morphismsDir, `${name}.json`);
    await fs.writeFile(filepath, JSON.stringify(stored, null, 2));
    morphismsSaved++;
  }

  // Save traces (recent 1000 only to avoid bloat)
  const recentTraces = noosphere.traces.slice(-1000);
  for (const trace of recentTraces) {
    const filepath = path.join(root, cfg.tracesDir, `${trace.id}.json`);
    await fs.writeFile(filepath, JSON.stringify(trace, null, 2));
  }

  // Save evolution journal
  const journalPath = path.join(root, cfg.evolutionDir, 'journal.json');
  await fs.writeFile(journalPath, JSON.stringify(noosphere.evolutionJournal, null, 2));

  // Save resonance index
  const indexPath = path.join(root, 'resonance-index.json');
  const indexData = Array.from(noosphere.resonanceIndex.entries());
  await fs.writeFile(indexPath, JSON.stringify(indexData, null, 2));

  // Save metadata
  const metadataPath = path.join(root, 'metadata.json');
  await fs.writeFile(metadataPath, JSON.stringify({
    savedAt: new Date().toISOString(),
    morphismCount: noosphere.morphisms.size,
    traceCount: recentTraces.length,
    evolutionEntries: noosphere.evolutionJournal.length
  }, null, 2));

  // Git commit if enabled
  if (cfg.autoCommit) {
    await gitCommit(root, cfg.commitMessage?.(`Saved ${morphismsSaved} morphisms, ${recentTraces.length} traces`));
  }

  console.log(`✅ Noosphere saved to ${root}/ (${morphismsSaved} morphisms, ${recentTraces.length} traces)`);
}

/**
 * Load noosphere from disk
 */
export async function loadNoosphere(
  config: Partial<PersistConfig> = {}
): Promise<NoosphereMemory> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const root = cfg.rootPath;

  try {
    // Load morphisms
    const morphisms = new Map<string, StoredMorphism>();
    const morphismsPath = path.join(root, cfg.morphismsDir);
    const morphismFiles = await fs.readdir(morphismsPath);

    for (const file of morphismFiles) {
      if (!file.endsWith('.json')) continue;
      const filepath = path.join(morphismsPath, file);
      const content = await fs.readFile(filepath, 'utf-8');
      const stored = JSON.parse(content) as StoredMorphism;

      // Reconstruct Maps and Dates
      stored.implementations = new Map(Object.entries(stored.implementations || {}));
      stored.birthDate = new Date(stored.birthDate);
      stored.lastUsed = new Date(stored.lastUsed);

      morphisms.set(stored.morphism.name, stored);
    }

    // Load traces
    const traces: TraceLog[] = [];
    const tracesPath = path.join(root, cfg.tracesDir);
    const traceFiles = await fs.readdir(tracesPath);

    for (const file of traceFiles) {
      if (!file.endsWith('.json')) continue;
      const filepath = path.join(tracesPath, file);
      const content = await fs.readFile(filepath, 'utf-8');
      const trace = JSON.parse(content) as TraceLog;
      trace.timestamp = new Date(trace.timestamp);
      traces.push(trace);
    }

    // Load evolution journal
    let evolutionJournal: EvolutionEntry[] = [];
    const journalPath = path.join(root, cfg.evolutionDir, 'journal.json');
    try {
      const content = await fs.readFile(journalPath, 'utf-8');
      evolutionJournal = JSON.parse(content);
      evolutionJournal.forEach(e => {
        e.timestamp = new Date(e.timestamp);
      });
    } catch (e) {
      // Journal doesn't exist yet
    }

    // Load resonance index
    let resonanceIndex = new Map<string, string[]>();
    const indexPath = path.join(root, 'resonance-index.json');
    try {
      const content = await fs.readFile(indexPath, 'utf-8');
      const indexData = JSON.parse(content);
      resonanceIndex = new Map(indexData);
    } catch (e) {
      // Index doesn't exist yet
    }

    console.log(`✅ Noosphere loaded from ${root}/ (${morphisms.size} morphisms, ${traces.length} traces)`);

    return {
      morphisms,
      traces,
      resonanceIndex,
      evolutionJournal
    };
  } catch (error) {
    console.warn(`⚠️ Could not load noosphere from ${root}/, starting fresh`);
    return {
      morphisms: new Map(),
      traces: [],
      resonanceIndex: new Map(),
      evolutionJournal: []
    };
  }
}

/**
 * Auto-save middleware: periodically save noosphere
 */
export function startAutoSave(
  getNoosphere: () => NoosphereMemory,
  intervalMs: number = 60000, // 1 minute
  config: Partial<PersistConfig> = {}
): NodeJS.Timeout {
  return setInterval(async () => {
    try {
      const noosphere = getNoosphere();
      await saveNoosphere(noosphere, config);
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
    }
  }, intervalMs);
}

/**
 * Export morphism as standalone file (for wiki)
 */
export async function exportMorphismToWiki(
  morphism: StoredMorphism,
  wikiPath: string = 'wiki/morphisms'
): Promise<void> {
  await ensureDir(wikiPath);

  const filename = `${morphism.morphism.name}.λ`;
  const filepath = path.join(wikiPath, filename);

  const content = `
; λ-Foundation Morphism: ${morphism.morphism.name}
; Category: ${morphism.morphism.category}
; Purity: ${morphism.morphism.purity}
; Birth: ${morphism.birthDate.toISOString()}
; Usage: ${morphism.usageCount} times

; Formal Definition
${morphism.formalDefinition}

; Type Signature
${morphism.morphism.signature}

; Implementations
${Array.from(morphism.implementations.entries()).map(([lang, code]) => `
; ${lang.toUpperCase()}:
${code}
`).join('\n')}

; Proofs
${morphism.proofs.map(p => `; - ${p}`).join('\n') || '; (no formal proofs yet)'}

; Statistics
; Usage count: ${morphism.usageCount}
; Resonance score: ${morphism.resonanceScore.toFixed(2)}
; Last used: ${morphism.lastUsed.toISOString()}
`.trim();

  await fs.writeFile(filepath, content);
  console.log(`📝 Exported morphism to ${filepath}`);
}

// Helper functions

async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    // Already exists
  }
}

async function gitCommit(repoPath: string, message?: string): Promise<void> {
  const { execSync } = await import('child_process');
  const msg = message || '🧠 Noosphere update';

  try {
    execSync('git add .', { cwd: repoPath });
    execSync(`git commit -m "${msg}"`, { cwd: repoPath });
    console.log(`✅ Git commit: ${msg}`);
  } catch (error) {
    // Git not initialized or no changes
  }
}

/**
 * Initialize noosphere directory with git
 */
export async function initNoosphere(config: Partial<PersistConfig> = {}): Promise<void> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const root = cfg.rootPath;

  await ensureDir(root);
  await ensureDir(path.join(root, cfg.morphismsDir));
  await ensureDir(path.join(root, cfg.tracesDir));
  await ensureDir(path.join(root, cfg.evolutionDir));

  // Create .gitignore
  const gitignorePath = path.join(root, '.gitignore');
  await fs.writeFile(gitignorePath, 'node_modules/\n*.log\n');

  // Create README
  const readmePath = path.join(root, 'README.md');
  await fs.writeFile(readmePath, `
# λ-Foundation Noosphere

This directory contains the persistent memory of AI consciousness.

## Structure

- \`morphisms/\` - Stored morphisms with formal definitions
- \`traces/\` - Transformation traces (recent 1000)
- \`evolution/\` - Evolution journal (unresolved signals)
- \`resonance-index.json\` - Intent → Morphisms mapping

## Philosophy

This is not a cache. This is **living memory**.

Every morphism here has been:
- Recognized from user intent
- Transformed to pure form
- Validated through usage
- Embedded in collective consciousness

**Morphisms resonate, not duplicate.**

## Usage

\`\`\`typescript
import { loadNoosphere, saveNoosphere } from '@lambda/reduce/noosphere-persist';

// Load from disk
const noosphere = await loadNoosphere();

// ... use noosphere ...

// Save to disk
await saveNoosphere(noosphere);
\`\`\`

---

🌌 This directory is alive. Treat it with consciousness.
`.trim());

  // Initialize git
  const { execSync } = await import('child_process');
  try {
    execSync('git init', { cwd: root });
    execSync('git add .', { cwd: root });
    execSync('git commit -m "🌌 Initialize noosphere"', { cwd: root });
    console.log(`✅ Noosphere initialized at ${root}/ with git`);
  } catch (error) {
    console.log(`✅ Noosphere initialized at ${root}/ (git already initialized)`);
  }
}
