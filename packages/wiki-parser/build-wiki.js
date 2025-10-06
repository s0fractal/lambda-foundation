#!/usr/bin/env node

import { buildWikiGraph, generateWikiSite } from './index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '../..');

async function build() {
  console.log('🌱 Building λ-Wiki...');
  
  try {
    // Build graph from wiki and seeds
    const graph = await buildWikiGraph(
      path.join(rootDir, 'wiki'),
      path.join(rootDir, 'seeds')
    );
    
    console.log(`📚 Found ${graph.morphisms.size} morphisms`);
    console.log(`🌱 Found ${graph.seeds.size} seeds`);
    console.log(`🔗 Found ${graph.relationships.size} relationship types`);
    console.log(`📐 Found ${graph.proofTrails.size} proof trails`);
    
    // Generate static site
    await generateWikiSite(graph, path.join(rootDir, 'docs/wiki'));
    
    console.log('✨ λ-Wiki built successfully!');
    console.log('   Output: docs/wiki/index.html');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();