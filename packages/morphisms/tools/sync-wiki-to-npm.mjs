// sync-wiki-to-npm.mjs
// Synchronizes wiki/morphisms to packages/morphisms/src
// Source of truth - wiki/morphisms projections
// Target - packages/morphisms/src

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WIKI_MORPHISMS_PATH = join(__dirname, '../../../wiki/morphisms');
const NPM_SRC_PATH = join(__dirname, '../src');

/**
 * Infer TypeScript types from Platonic λ-calculus form
 *
 * Pattern matching on common λ-expressions:
 * - λx.x → <T>(x: T) => T
 * - λf.λg.λx.f(g(x)) → <A,B,C>(f: (b:B)=>C) => (g: (a:A)=>B) => (x:A) => C
 * - λx.λy.x → <A,B>(x: A) => (y: B) => A
 */
function inferTypesFromPlatonicForm(name, platonicForm, implementation) {
  const normalized = platonicForm.trim().replace(/\s+/g, '');

  // Pattern 1: λx.x (identity)
  if (/^λ\w\.(\w)$/.test(normalized) && normalized.match(/^λ(\w)\.(\1)$/)) {
    return implementation.replace(
      new RegExp(`export const ${name} = (\\w+) => \\1;`),
      `export const ${name} = <T>(x: T): T => x;`
    );
  }

  // Pattern 2: λf.λg.λx.f(g(x)) (compose)
  if (/^λ\w\.λ\w\.λ\w\.\w+\(\w+\(\w+\)\)$/.test(normalized)) {
    return implementation.replace(
      new RegExp(`export const ${name} = (\\w+) => (\\w+) => (\\w+) => \\1\\(\\2\\(\\3\\)\\);`),
      `export const ${name} = <A, B, C>(f: (b: B) => C) => (g: (a: A) => B) => (x: A): C => f(g(x));`
    );
  }

  // Pattern 3: λx.λy.x (const)
  if (/^λ(\w)\.λ\w\.(\1)$/.test(normalized)) {
    const funcName = name === 'const' ? 'const_' : name;
    return implementation.replace(
      new RegExp(`export const ${funcName} = (\\w+) => (\\w+) => \\1;`),
      `export const ${funcName} = <A, B>(x: A) => (y: B): A => x;`
    );
  }

  // Pattern 4: λf.λx.λy.f(y)(x) (flip)
  if (/^λ\w\.λ\w\.λ\w\.\w+\(\w+\)\(\w+\)$/.test(normalized)) {
    return implementation.replace(
      new RegExp(`export const ${name} = (\\w+) => (\\w+) => (\\w+) => \\1\\(\\3\\)\\(\\2\\);`),
      `export const ${name} = <A, B, C>(f: (a: A) => (b: B) => C) => (x: B) => (y: A): C => f(y)(x);`
    );
  }

  // Pattern 5: λf.λxs.FOLD... or λf.λxs.xs.map(f) (map - functor)
  if (name === 'map' || /^λ\w\.λ\w+\.FOLD/.test(normalized) || /^λ\w\.λ\w+\.\w+\.map\(\w+\)$/.test(normalized)) {
    return implementation.replace(
      new RegExp(`export const ${name} = (\\w+) => (\\w+) => \\2\\.map\\(\\1\\);`),
      `export const ${name} = <A, B>(f: (a: A) => B) => (xs: A[]): B[] => xs.map(f);`
    );
  }

  // Pattern 6: λf.λz.λxs.xs.reduce(f, z) (fold - catamorphism)
  // Note: JavaScript reduce signature is (acc, element) not (element, acc)
  if (name === 'fold' || /^λ\w\.λ\w\.λ\w+\.\w+\.reduce\(\w+,\w+\)$/.test(normalized)) {
    return implementation.replace(
      new RegExp(`export const ${name} = (\\w+) => (\\w+) => (\\w+) => \\3\\.reduce\\(\\1,\\s*\\2\\);`),
      `export const ${name} = <A, B>(f: (acc: B, a: A) => B) => (z: B) => (xs: A[]): B => xs.reduce(f, z);`
    );
  }

  // Default: return as-is (will need manual type annotation)
  console.warn(`⚠️  No type pattern match for ${name} (${platonicForm})`);
  return implementation;
}

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

    // Extract the implementation from projection (remove JSDoc if present)
    let implementation = morphism.projection;

    // Remove the JSDoc comment from the original projection if it exists
    implementation = implementation.replace(/\/\*\*[\s\S]*?\*\/\s*/g, '');

    // Pattern-based type inference from Platonic form
    const typedImplementation = inferTypesFromPlatonicForm(
      morphism.name,
      morphism.platonicForm,
      implementation
    );
    implementation = typedImplementation;

    // Build the TypeScript file with a single, clean JSDoc comment
    const tsContent = `/**
 * ${morphism.intent}
 *
 * Platonic form: ${morphism.platonicForm}
 *
 * Source: wiki/morphisms/${morphism.name}/${morphism.name}.λ
 */
${implementation}`;

    await writeFile(filepath, tsContent, 'utf-8');
    console.log(`✓ Synced ${morphism.name}.ts`);
  }

  // Generate index.ts (barrel export)
  const indexContent = morphisms
    .map(m => {
      // Handle reserved keywords (const → const_)
      const exportName = m.name === 'const' ? 'const_' : m.name;
      if (exportName !== m.name) {
        return `export { ${exportName} } from './${m.name}.js';`;
      }
      return `export { ${m.name} } from './${m.name}.js';`;
    })
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
