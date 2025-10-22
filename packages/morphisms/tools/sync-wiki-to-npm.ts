/**
 * sync-wiki-to-npm.ts
 *
 * Synchronizes wiki/morphisms/* to packages/morphisms/src/*
 *
 * Source of truth: wiki/morphisms/*/projections/ts.js
 * Target: packages/morphisms/src/*.ts
 *
 * This tool enforces Квен's ontological standard:
 * - Platonic forms (.λ) are immutable
 * - Projections (ts.js) are derived from forms
 * - npm package is a projection layer
 */

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WIKI_MORPHISMS_PATH = join(__dirname, '../../../wiki/morphisms');
const NPM_SRC_PATH = join(__dirname, '../src');

async function scanWikiMorphisms() {
  const morphisms = [];

  try {
    const entries = await readdir(WIKI_MORPHISMS_PATH, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const morphismName = entry.name;
      const morphismDir = join(WIKI_MORPHISMS_PATH, morphismName);

      // Read Platonic form
      const platonicPath = join(morphismDir, `${morphismName}.λ`);
      const platonicForm = await readFile(platonicPath, 'utf-8');

      // Read TypeScript projection
      const projectionPath = join(morphismDir, 'projections/ts.js');
      const projection = await readFile(projectionPath, 'utf-8');

      // Read intent from README
      const readmePath = join(morphismDir, 'README.md');
      const readme = await readFile(readmePath, 'utf-8');
      const intentMatch = readme.match(/## Інтенція\n\n(.+?)\n\n/s);
      const intent = intentMatch ? intentMatch[1].trim() : '';

      morphisms.push({
        name: morphismName,
        platonicForm: platonicForm.trim(),
        projection: projection.trim(),
        intent
      });
    }
  } catch (error) {
    console.error('Error scanning wiki morphisms:', error);
  }

  return morphisms;
}

async function generateNpmProjections(morphisms) {
  // Ensure src directory exists
  await mkdir(NPM_SRC_PATH, { recursive: true });

  // Generate individual morphism files
  for (const morphism of morphisms) {
    const filepath = join(NPM_SRC_PATH, `${morphism.name}.ts`);

    // Convert .js projection to .ts (add type annotations)
    const tsProjection = morphism.projection
      .replace('export const', `/**\n * ${morphism.intent}\n * \n * Platonic form: ${morphism.platonicForm}\n * \n * Source: wiki/morphisms/${morphism.name}/projections/ts.js\n */\nexport const`)
      .replace('.js', '.ts');

    await writeFile(filepath, tsProjection, 'utf-8');
    console.log(`✓ Synced ${morphism.name}.ts`);
  }

  // Generate index.ts (barrel export)
  const indexContent = morphisms
    .map(m => `export { ${m.name} } from './${m.name}.js';`)
    .join('\n') + '\n';

  await writeFile(join(NPM_SRC_PATH, 'index.ts'), indexContent, 'utf-8');
  console.log(`✓ Generated index.ts`);
}

async function main() {
  console.log('🔄 Syncing wiki/morphisms → packages/morphisms/src...\n');

  const morphisms = await scanWikiMorphisms();

  if (morphisms.length === 0) {
    console.log('⚠️  No morphisms found in wiki/morphisms/');
    return;
  }

  console.log(`📦 Found ${morphisms.length} morphism(s):`);
  for (const m of morphisms) {
    console.log(`   - ${m.name} (${m.platonicForm})`);
  }
  console.log();

  await generateNpmProjections(morphisms);

  console.log('\n✅ Sync complete!');
  console.log('💡 Run `pnpm build` to compile TypeScript projections');
}

main().catch(console.error);
