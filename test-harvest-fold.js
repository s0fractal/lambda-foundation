// test-harvest-fold.js
// Imperative code with reduce mutation patterns
// λ_HARVEST should detect these and suggest pure fold from @lambda/morphisms

function calculateStats(numbers) {
  // ❌ IMPERATIVE PATTERN 1: reduce with mutation
  const stats = numbers.reduce((acc, x) => {
    acc.sum += x;
    acc.count++;
    return acc;
  }, { sum: 0, count: 0 });

  return stats;
}

function groupInvoices(invoices) {
  // ❌ IMPERATIVE PATTERN 2: reduce with object mutation
  const grouped = invoices.reduce((acc, invoice) => {
    const key = invoice.amount < 150 ? 'small' : 'large';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(invoice);
    return acc;
  }, {});

  return grouped;
}

function buildUserMap(users) {
  // ❌ IMPERATIVE PATTERN 3: reduce building mutable map
  const userMap = users.reduce((map, user) => {
    map[user.id] = user;
    return map;
  }, {});

  return userMap;
}

function accumulateScores(games) {
  // ❌ IMPERATIVE PATTERN 4: reduce with array mutation
  const scores = games.reduce((acc, game) => {
    acc.push(game.score);
    return acc;
  }, []);

  return scores;
}

// ✅ FUNCTIONAL ALTERNATIVE (what λ_HARVEST should suggest):
// import { fold } from '@lambda/morphisms';
//
// const calculateStats = fold(
//   (acc, x) => ({ sum: acc.sum + x, count: acc.count + 1 })
// )({ sum: 0, count: 0 });
//
// const groupInvoices = fold(
//   (acc, invoice) => {
//     const key = invoice.amount < 150 ? 'small' : 'large';
//     return {
//       ...acc,
//       [key]: [...(acc[key] || []), invoice]
//     };
//   }
// )({});
//
// const buildUserMap = fold(
//   (acc, user) => ({ ...acc, [user.id]: user })
// )({});
//
// const accumulateScores = fold(
//   (acc, game) => [...acc, game.score]
// )([]);

// Test data
const numbers = [1, 2, 3, 4, 5];
const invoices = [
  { id: 1, amount: 100 },
  { id: 2, amount: 200 },
  { id: 3, amount: 150 }
];
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
];
const games = [
  { id: 1, score: 100 },
  { id: 2, score: 200 }
];

console.log('Stats:', calculateStats(numbers));
console.log('Grouped:', groupInvoices(invoices));
console.log('User map:', buildUserMap(users));
console.log('Scores:', accumulateScores(games));
