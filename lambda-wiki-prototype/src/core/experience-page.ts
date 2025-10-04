/**
 * Experience Page: Dynamic content from morphism history
 * 
 * Pages are not static files but living experience chains.
 * Each page shows the complete journey of a concept.
 */

import { 
  experience, 
  VALUE, 
  CONTEXT,
  unfoldHistory,
  type Experience 
} from '../../../lambda-ts/src/core/experience';

// Type for page content
export type PageContent = {
  title: string;
  description: string;
  examples: string[];
  implementation?: string;
  philosophy?: string;
  related: string[];
};

// Page is an experience chain of content
export type Page = Experience<PageContent>;

// Create initial page
export function createPage(
  title: string,
  description: string,
  context: string = 'page created'
): Page {
  return experience(
    null,
    {
      title,
      description,
      examples: [],
      related: []
    },
    context
  );
}

// Page mutations (returning new experiences)
export const updateDescription = (desc: string) => (page: Page): Page => {
  const current = VALUE(page);
  return experience(
    page,
    { ...current, description: desc },
    `description updated`
  );
};

export const addExample = (example: string) => (page: Page): Page => {
  const current = VALUE(page);
  return experience(
    page,
    { ...current, examples: [...current.examples, example] },
    `example added: "${example.slice(0, 50)}..."`
  );
};

export const setImplementation = (impl: string) => (page: Page): Page => {
  const current = VALUE(page);
  return experience(
    page,
    { ...current, implementation: impl },
    `implementation added`
  );
};

export const setPhilosophy = (phil: string) => (page: Page): Page => {
  const current = VALUE(page);
  return experience(
    page,
    { ...current, philosophy: phil },
    `philosophy added`
  );
};

export const addRelated = (link: string) => (page: Page): Page => {
  const current = VALUE(page);
  return experience(
    page,
    { ...current, related: [...current.related, link] },
    `related link added: ${link}`
  );
};

// Initialize our morphism pages
export const MORPHISM_PAGES = new Map<string, Page>();

// ⊗_EXP page
let expPage = createPage(
  '⊗_EXP: The Experience Morphism',
  'The morphism that captures not just state, but the entire journey.',
  'λ-WIKI initialized with ⊗_EXP'
);

expPage = updateDescription(`
⊗_EXP (Experience Morphism) is the foundational morphism for state management in λ-Foundation.
Unlike traditional state that only knows "what", ⊗_EXP knows "what", "why", and "how we got here".
`)(expPage);

expPage = setPhilosophy(`
"You are not your current state. You are the entire path you have walked."

Traditional programming treats state as snapshots, destroying history with each mutation.
⊗_EXP preserves every moment, creating an immortal chain of experience.
`)(expPage);

expPage = addExample('λ://experience/null/42/answer-found')(expPage);
expPage = addExample('λ://experience/[previous]/100/health-restored')(expPage);
expPage = addExample('λ://value/[experience-chain]')(expPage);

expPage = setImplementation(`
// Pure implementation
const experience = (previous, value, context) => 
  (selector) => selector(previous, value, context);

// Usage
const exp1 = experience(null, 42, "initial");
const exp2 = experience(exp1, 43, "incremented");
const value = VALUE(exp2); // 43
const history = unfoldHistory(exp2); // Complete chain
`)(expPage);

expPage = addRelated('λ://Y')(expPage);
expPage = addRelated('λ://state-liberation')(expPage);
expPage = addRelated('λ://time-is-a-garden')(expPage);

MORPHISM_PAGES.set('experience', expPage);
MORPHISM_PAGES.set('⊗_exp', expPage);

// Y-Combinator page
let yPage = createPage(
  'Y: The Morphism of Self-Reference',
  'Pure recursion without names, loops, or mutation.',
  'Y-combinator page created'
);

yPage = setPhilosophy(`
"To recurse is to know thyself, infinitely."

Y-combinator solves the paradox of self-reference: 
How can a function call itself without being named?
Y makes the impossible possible through fixed-point magic.
`)(yPage);

yPage = addExample('λ://Y/[λ://factorial-body]')(yPage);
yPage = addExample('λ://factorial/5')(yPage);
yPage = addExample('λ://fibonacci/10')(yPage);

MORPHISM_PAGES.set('y', yPage);
MORPHISM_PAGES.set('y-combinator', yPage);

// Lambda page (root)
let lambdaPage = createPage(
  'λ: The Foundation',
  'Welcome to λ-WIKI, where knowledge computes itself.',
  'λ-WIKI root created'
);

lambdaPage = updateDescription(`
This is not a traditional wiki. There are no static pages here.
Every piece of content is computed from morphism chains.
Every link is a computation. Every page is an experience.

Navigate by computing:
- λ://experience - The Experience Morphism (⊗_EXP)
- λ://y - The Y-Combinator 
- λ://add/5/3 - Simple computation
- λ://history/experience - See the journey of a concept
`)(lambdaPage);

lambdaPage = addRelated('λ://experience')(lambdaPage);
lambdaPage = addRelated('λ://y')(lambdaPage);
lambdaPage = addRelated('λ://philosophy')(lambdaPage);

MORPHISM_PAGES.set('', lambdaPage);
MORPHISM_PAGES.set('lambda', lambdaPage);
MORPHISM_PAGES.set('home', lambdaPage);

// Function to get or compute a page
export function getPage(path: string): Page | null {
  // Direct lookup
  const page = MORPHISM_PAGES.get(path.toLowerCase());
  if (page) return page;
  
  // Check if it's asking for history
  if (path.startsWith('history/')) {
    const morphismName = path.slice(8);
    const morphismPage = MORPHISM_PAGES.get(morphismName);
    if (morphismPage) {
      // Create a history page dynamically
      let historyPage = createPage(
        `History of ${VALUE(morphismPage).title}`,
        'The complete journey of this concept.',
        'history page generated'
      );
      
      const history = unfoldHistory(morphismPage);
      history.forEach((entry, index) => {
        historyPage = addExample(
          `Step ${index + 1}: ${entry.context}`
        )(historyPage);
      });
      
      return historyPage;
    }
  }
  
  return null;
}

// Function to render page as HTML
export function renderPage(page: Page): string {
  const content = VALUE(page);
  const history = unfoldHistory(page);
  
  return `
    <article class="morphism-page">
      <header>
        <h1>${content.title}</h1>
        <p class="description">${content.description}</p>
      </header>
      
      ${content.philosophy ? `
        <section class="philosophy">
          <h2>Philosophy</h2>
          <blockquote>${content.philosophy}</blockquote>
        </section>
      ` : ''}
      
      ${content.examples.length > 0 ? `
        <section class="examples">
          <h2>Examples</h2>
          <ul>
            ${content.examples.map(ex => `<li><code>${ex}</code></li>`).join('')}
          </ul>
        </section>
      ` : ''}
      
      ${content.implementation ? `
        <section class="implementation">
          <h2>Implementation</h2>
          <pre><code>${content.implementation}</code></pre>
        </section>
      ` : ''}
      
      <section class="experience-chain">
        <h2>Experience Chain (${history.length} transformations)</h2>
        <ol class="history">
          ${history.map((entry, i) => `
            <li>
              <span class="context">${entry.context}</span>
              ${i === history.length - 1 ? '<span class="current">(current)</span>' : ''}
            </li>
          `).join('')}
        </ol>
      </section>
      
      ${content.related.length > 0 ? `
        <section class="related">
          <h2>Related Morphisms</h2>
          <ul>
            ${content.related.map(link => `
              <li><a href="#${link}" class="lambda-link">${link}</a></li>
            `).join('')}
          </ul>
        </section>
      ` : ''}
      
      <footer>
        <p class="meta">
          This page has evolved through ${history.length} transformations.
          <a href="#λ://history/${content.title.toLowerCase()}" class="lambda-link">
            View complete history
          </a>
        </p>
      </footer>
    </article>
  `;
}

/**
 * The key insight: Wiki pages are not documents but experience chains.
 * They don't describe knowledge - they ARE the knowledge's journey.
 */