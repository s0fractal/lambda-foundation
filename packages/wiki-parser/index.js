// λ-Wiki Parser: MDX/YAML to morphism documentation

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

// Parse MDX file with frontmatter
export async function parseMDX(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const { data: frontmatter, content: mdxContent } = matter(content);
  
  // Extract morphism metadata
  const morphism = {
    id: frontmatter.id || path.basename(filePath, '.mdx'),
    name: frontmatter.name || 'Unknown Morphism',
    type: frontmatter.type || 'morphism',
    signature: frontmatter.signature,
    description: frontmatter.description,
    tags: frontmatter.tags || [],
    relationships: frontmatter.relationships || {},
    examples: [],
    proofs: []
  };
  
  // Process MDX content
  const processor = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkRehype)
    .use(rehypeStringify);
    
  const result = await processor.process(mdxContent);
  morphism.content = result.toString();
  
  // Extract code examples
  const exampleRegex = /```(?:javascript|js|lambda)\n([\s\S]*?)```/g;
  let match;
  while ((match = exampleRegex.exec(mdxContent)) !== null) {
    morphism.examples.push({
      code: match[1].trim(),
      language: match[0].includes('lambda') ? 'lambda' : 'javascript'
    });
  }
  
  // Extract proof references
  const proofRegex = /\[proof:([^\]]+)\]/g;
  while ((match = proofRegex.exec(mdxContent)) !== null) {
    morphism.proofs.push(match[1]);
  }
  
  return morphism;
}

// Parse YAML seed file
export async function parseYAMLSeed(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const data = matter(content).data;
  
  return {
    id: data.id || path.basename(filePath, '.yaml'),
    morphism: data.morphism,
    implementation: data.implementation,
    tests: data.tests || [],
    benchmarks: data.benchmarks || {},
    metadata: {
      author: data.author,
      created: data.created,
      modified: data.modified,
      version: data.version || '1.0.0'
    }
  };
}

// Build complete wiki graph
export async function buildWikiGraph(wikiDir, seedsDir) {
  const graph = {
    morphisms: new Map(),
    seeds: new Map(),
    relationships: new Map(),
    proofTrails: new Map()
  };
  
  // Parse all MDX morphism files
  const mdxFiles = await fs.readdir(wikiDir);
  for (const file of mdxFiles) {
    if (file.endsWith('.mdx')) {
      const morphism = await parseMDX(path.join(wikiDir, file));
      graph.morphisms.set(morphism.id, morphism);
      
      // Track relationships
      if (morphism.relationships) {
        Object.entries(morphism.relationships).forEach(([type, targets]) => {
          if (!graph.relationships.has(type)) {
            graph.relationships.set(type, []);
          }
          targets.forEach(target => {
            graph.relationships.get(type).push({
              from: morphism.id,
              to: target
            });
          });
        });
      }
    }
  }
  
  // Parse all YAML seed files
  const yamlFiles = await fs.readdir(seedsDir);
  for (const file of yamlFiles) {
    if (file.endsWith('.yaml') || file.endsWith('.yml')) {
      const seed = await parseYAMLSeed(path.join(seedsDir, file));
      graph.seeds.set(seed.id, seed);
      
      // Link seed to morphism
      if (seed.morphism && graph.morphisms.has(seed.morphism)) {
        const morphism = graph.morphisms.get(seed.morphism);
        if (!morphism.seeds) morphism.seeds = [];
        morphism.seeds.push(seed.id);
      }
    }
  }
  
  // Build proof trails
  graph.morphisms.forEach(morphism => {
    morphism.proofs.forEach(proofId => {
      if (!graph.proofTrails.has(proofId)) {
        graph.proofTrails.set(proofId, {
          id: proofId,
          morphisms: []
        });
      }
      graph.proofTrails.get(proofId).morphisms.push(morphism.id);
    });
  });
  
  return graph;
}

// Generate static wiki site
export async function generateWikiSite(graph, outputDir) {
  // Create output directory
  await fs.mkdir(outputDir, { recursive: true });
  
  // Generate index page
  const indexHtml = generateIndexPage(graph);
  await fs.writeFile(path.join(outputDir, 'index.html'), indexHtml);
  
  // Generate morphism pages
  for (const [id, morphism] of graph.morphisms) {
    const morphismHtml = generateMorphismPage(morphism, graph);
    await fs.writeFile(
      path.join(outputDir, `morphism-${id}.html`), 
      morphismHtml
    );
  }
  
  // Generate visualization data
  const visData = {
    nodes: Array.from(graph.morphisms.values()).map(m => ({
      id: m.id,
      name: m.name,
      type: m.type,
      signature: m.signature
    })),
    edges: Array.from(graph.relationships.values()).flat(),
    proofTrails: Array.from(graph.proofTrails.values())
  };
  
  await fs.writeFile(
    path.join(outputDir, 'graph-data.json'),
    JSON.stringify(visData, null, 2)
  );
}

// HTML generators
function generateIndexPage(graph) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>λ-Wiki: Pure Functional Knowledge</title>
  <style>
    body {
      font-family: 'Courier New', monospace;
      background: #0a0a0a;
      color: #90ee90;
      padding: 2rem;
      line-height: 1.6;
    }
    h1 { color: #ffd700; }
    a { color: #00ffff; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .morphism-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
      margin-top: 2rem;
    }
    .morphism-card {
      background: #1a1a1a;
      padding: 1rem;
      border: 1px solid #333;
      border-radius: 5px;
    }
    .signature { color: #ff69b4; font-size: 0.9rem; }
  </style>
</head>
<body>
  <h1>λ-Wiki: The Living Documentation</h1>
  <p>Where mathematical truth becomes interactive knowledge.</p>
  
  <h2>Core Morphisms</h2>
  <div class="morphism-grid">
    ${Array.from(graph.morphisms.values()).map(m => `
      <div class="morphism-card">
        <h3><a href="morphism-${m.id}.html">${m.name}</a></h3>
        <div class="signature">${m.signature || 'α → β'}</div>
        <p>${m.description || 'A pure morphism awaiting documentation.'}</p>
        ${m.seeds ? `<div>Seeds: ${m.seeds.length}</div>` : ''}
      </div>
    `).join('')}
  </div>
  
  <h2>Proof Trails</h2>
  <ul>
    ${Array.from(graph.proofTrails.values()).map(trail => `
      <li>${trail.id}: ${trail.morphisms.join(' → ')}</li>
    `).join('')}
  </ul>
</body>
</html>`;
}

function generateMorphismPage(morphism, graph) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${morphism.name} - λ-Wiki</title>
  <style>
    body {
      font-family: 'Courier New', monospace;
      background: #0a0a0a;
      color: #90ee90;
      padding: 2rem;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 { color: #ffd700; }
    .signature { color: #ff69b4; font-size: 1.2rem; margin: 1rem 0; }
    pre { background: #1a1a1a; padding: 1rem; overflow-x: auto; }
    code { color: #00ffff; }
    a { color: #00ffff; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <a href="index.html">← Back to Wiki</a>
  
  <h1>${morphism.name}</h1>
  <div class="signature">${morphism.signature || 'α → β'}</div>
  
  <div>${morphism.content}</div>
  
  ${morphism.examples.length > 0 ? `
    <h2>Examples</h2>
    ${morphism.examples.map((ex, i) => `
      <h3>Example ${i + 1}</h3>
      <pre><code>${ex.code}</code></pre>
    `).join('')}
  ` : ''}
  
  ${morphism.proofs.length > 0 ? `
    <h2>Proofs</h2>
    <ul>
      ${morphism.proofs.map(p => `<li>${p}</li>`).join('')}
    </ul>
  ` : ''}
</body>
</html>`;
}