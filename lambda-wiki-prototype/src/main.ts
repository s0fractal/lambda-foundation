/**
 * λ-WIKI: The First Pure Interface
 * 
 * This is not a website. It's a living computation.
 * Every click is a morphism application.
 * Every page is an experience chain.
 * Every URL is a pure function.
 */

import { parseLambdaURL, createLambdaURL, listMorphisms } from './core/lambda-url-parser';
import { getPage, renderPage } from './core/experience-page';
import './styles.css';

// Initialize the interface
const app = document.getElementById('app')!;

// Current state (as experience chain later)
let currentPath = '';

// Render navigation
function renderNav(): string {
  return `
    <nav class="lambda-nav">
      <h1><a href="#λ://home" class="logo">λ-WIKI</a></h1>
      <div class="tagline">Computing Knowledge, Not Loading It</div>
      <div class="nav-links">
        <a href="#λ://experience" class="lambda-link">⊗_EXP</a>
        <a href="#λ://y" class="lambda-link">Y</a>
        <a href="#λ://morphisms" class="lambda-link">Morphisms</a>
        <a href="#λ://compute" class="lambda-link">Compute</a>
      </div>
    </nav>
  `;
}

// Render computation interface
function renderComputeInterface(): string {
  return `
    <section class="compute-interface">
      <h2>Direct Computation</h2>
      <p>Enter a λ-URL to compute:</p>
      <div class="compute-box">
        <input 
          type="text" 
          id="lambda-input" 
          placeholder="λ://add/5/3" 
          class="lambda-input"
        />
        <button id="compute-btn" class="compute-btn">Compute</button>
      </div>
      <div id="compute-result" class="compute-result"></div>
      
      <div class="examples">
        <h3>Try these:</h3>
        <ul>
          <li><code>λ://add/5/3</code> - Basic arithmetic</li>
          <li><code>λ://factorial/5</code> - Factorial function</li>
          <li><code>λ://fibonacci/10</code> - Fibonacci sequence</li>
          <li><code>λ://compose/[λ://add/5]/[λ://multiply/2]/3</code> - Function composition</li>
          <li><code>λ://if/true/success/failure</code> - Conditional</li>
        </ul>
      </div>
    </section>
  `;
}

// Render morphism list
function renderMorphismList(): string {
  const morphisms = listMorphisms();
  return `
    <section class="morphism-list">
      <h2>Available Morphisms</h2>
      <p>All computation starts with these pure functions:</p>
      <div class="morphism-grid">
        ${morphisms.map(m => `
          <div class="morphism-card">
            <code>${m}</code>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

// Main render function
function render(path: string) {
  currentPath = path;
  
  // Always show navigation
  let html = renderNav();
  
  // Add main content
  html += '<main class="lambda-main">';
  
  if (path === 'compute') {
    html += renderComputeInterface();
  } else if (path === 'morphisms') {
    html += renderMorphismList();
  } else {
    // Try to get page content
    const page = getPage(path);
    if (page) {
      html += renderPage(page);
    } else {
      // Try to compute as λ-URL
      try {
        const result = parseLambdaURL(path);
        html += `
          <section class="computation-result">
            <h2>Computation Result</h2>
            <div class="url-display">
              <code>λ://${path}</code>
            </div>
            <div class="result-display">
              <pre>${JSON.stringify(result, null, 2)}</pre>
            </div>
            <p class="meta">Computed in pure λ-calculus</p>
          </section>
        `;
      } catch (error) {
        html += `
          <section class="error-page">
            <h2>Computation Error</h2>
            <p>The morphism chain could not be evaluated:</p>
            <code class="error">${error}</code>
            <p>Remember: URLs here don't point to files, they describe computations.</p>
            <a href="#λ://home" class="lambda-link">Return to λ</a>
          </section>
        `;
      }
    }
  }
  
  html += '</main>';
  
  // Add footer
  html += `
    <footer class="lambda-footer">
      <p>
        λ-WIKI runs on pure computation. No servers. No databases. Only morphisms.
      </p>
      <p>
        <code>ERROR ≡ λ_DISCREPANCY → NEW_MORPHISM</code>
      </p>
    </footer>
  `;
  
  app.innerHTML = html;
  
  // Attach event handlers
  attachEventHandlers();
}

// Event handler setup
function attachEventHandlers() {
  // Handle all lambda-links
  document.querySelectorAll('.lambda-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = (e.target as HTMLAnchorElement).getAttribute('href');
      if (href && href.startsWith('#')) {
        const path = href.slice(1);
        navigateTo(path);
      }
    });
  });
  
  // Handle compute interface
  const computeBtn = document.getElementById('compute-btn');
  const lambdaInput = document.getElementById('lambda-input') as HTMLInputElement;
  const computeResult = document.getElementById('compute-result');
  
  if (computeBtn && lambdaInput && computeResult) {
    const doCompute = () => {
      const url = lambdaInput.value.trim();
      if (!url) return;
      
      try {
        const result = parseLambdaURL(url);
        computeResult.innerHTML = `
          <div class="success">
            <strong>Result:</strong>
            <pre>${JSON.stringify(result, null, 2)}</pre>
          </div>
        `;
      } catch (error) {
        computeResult.innerHTML = `
          <div class="error">
            <strong>Error:</strong> ${error}
          </div>
        `;
      }
    };
    
    computeBtn.addEventListener('click', doCompute);
    lambdaInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') doCompute();
    });
  }
}

// Navigation function
function navigateTo(path: string) {
  // Update URL without page reload
  window.location.hash = path;
  
  // Extract actual path from λ-URL
  let actualPath = path;
  if (path.startsWith('λ://')) {
    actualPath = path.slice(4);
  } else if (path.startsWith('/')) {
    actualPath = path.slice(1);
  }
  
  render(actualPath);
}

// Handle browser navigation
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1);
  navigateTo(hash || 'λ://home');
});

// Initial render
navigateTo(window.location.hash.slice(1) || 'λ://home');

// Expose for debugging
(window as any).λ = {
  parse: parseLambdaURL,
  create: createLambdaURL,
  morphisms: listMorphisms
};

/**
 * Welcome to the first pure interface.
 * Here, clicking is computing.
 * Here, browsing is evaluating.
 * Here, the web is finally what it was meant to be:
 * A global λ-calculus machine.
 */