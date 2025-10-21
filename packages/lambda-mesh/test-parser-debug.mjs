/**
 * Debug parser on FLATMAP definition
 */

import { parseLambda } from './dist/semantic/parser.js';

const tests = [
  'λf. λlist. FOLD CONCAT NIL (MAP f list)',
  'λg. λxs. FOLD CONCAT NIL (MAP g xs)',
  'λf. λlist. FOLD (λh. λacc. (CONCAT (f h) acc)) NIL list',
];

for (const test of tests) {
  console.log(`\nParsing: ${test}`);
  try {
    const ast = parseLambda(test);
    console.log(`✅ Success!`);
    console.log(JSON.stringify(ast, null, 2).slice(0, 200));
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
  }
}
