/**
 * Form Liberation: Decomposing Classes into Pure Morphisms
 * 
 * "Form is a transparent lattice, not a wall."
 * 
 * This module demonstrates how any class-based OOP structure can be
 * decomposed into pure functional components using ⊗_EXP and λ-composition.
 */

import { experience, VALUE, type Experience } from './experience';

/**
 * Traditional OOP approach (FORBIDDEN in λ-Foundation):
 * 
 * class Entity {
 *   private health: number;
 *   private position: { x: number; y: number };
 *   
 *   constructor(health: number, x: number, y: number) {
 *     this.health = health;
 *     this.position = { x, y };
 *   }
 *   
 *   move(dx: number, dy: number): void {
 *     this.position.x += dx;  // MUTATION!
 *     this.position.y += dy;  // MUTATION!
 *   }
 *   
 *   takeDamage(amount: number): void {
 *     this.health -= amount;  // MUTATION!
 *     if (this.health < 0) this.health = 0;  // MUTATION!
 *   }
 *   
 *   getHealth(): number { return this.health; }
 *   getPosition(): { x: number; y: number } { return {...this.position}; }
 * }
 */

/**
 * λ-Foundation approach: Pure decomposition
 */

// Data structure - pure, transparent, no hidden state
export type EntityData = {
  health: number;
  position: { x: number; y: number };
  name: string;
  type: 'player' | 'enemy' | 'npc';
};

// Entity is not a class, but an Experience chain
export type Entity = Experience<EntityData>;

// Constructor becomes a pure function
export const createEntity = (
  name: string,
  type: EntityData['type'],
  health: number,
  x: number,
  y: number
): Entity => {
  return experience(
    null,
    { health, position: { x, y }, name, type },
    `${type} "${name}" spawned at (${x}, ${y}) with ${health} HP`
  );
};

// Methods become pure morphisms: old state → new state

// Movement morphism
export const move = (dx: number, dy: number) => (entity: Entity): Entity => {
  const current = VALUE(entity);
  const newPosition = {
    x: current.position.x + dx,
    y: current.position.y + dy
  };
  
  return experience(
    entity,
    { ...current, position: newPosition },
    `moved by (${dx}, ${dy}) to (${newPosition.x}, ${newPosition.y})`
  );
};

// Damage morphism
export const takeDamage = (amount: number) => (entity: Entity): Entity => {
  const current = VALUE(entity);
  const newHealth = Math.max(0, current.health - amount);
  const isDead = newHealth === 0 && current.health > 0;
  
  return experience(
    entity,
    { ...current, health: newHealth },
    isDead 
      ? `took ${amount} damage and died!` 
      : `took ${amount} damage (${newHealth}/${current.health} HP remaining)`
  );
};

// Healing morphism
export const heal = (amount: number) => (entity: Entity): Entity => {
  const current = VALUE(entity);
  const newHealth = current.health + amount;
  
  return experience(
    entity,
    { ...current, health: newHealth },
    `healed for ${amount} (now at ${newHealth} HP)`
  );
};

// Teleport morphism
export const teleport = (x: number, y: number) => (entity: Entity): Entity => {
  const current = VALUE(entity);
  
  return experience(
    entity,
    { ...current, position: { x, y } },
    `teleported from (${current.position.x}, ${current.position.y}) to (${x}, ${y})`
  );
};

// Pure accessors (no need for getter methods)
export const getHealth = (entity: Entity): number => VALUE(entity).health;
export const getPosition = (entity: Entity): { x: number; y: number } => VALUE(entity).position;
export const getName = (entity: Entity): string => VALUE(entity).name;
export const getType = (entity: Entity): EntityData['type'] => VALUE(entity).type;
export const isDead = (entity: Entity): boolean => VALUE(entity).health <= 0;

// Composition example: complex behavior from simple morphisms
export const moveTowards = (targetX: number, targetY: number, speed: number) => 
  (entity: Entity): Entity => {
    const pos = getPosition(entity);
    const dx = targetX - pos.x;
    const dy = targetY - pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= speed) {
      return teleport(targetX, targetY)(entity);
    }
    
    const ratio = speed / distance;
    return move(dx * ratio, dy * ratio)(entity);
  };

// Higher-order morphisms
export const applyIfAlive = <T extends Entity>(
  morphism: (entity: T) => T
) => (entity: T): T => {
  return isDead(entity) ? entity : morphism(entity);
};

// Batch operations via composition
export const applyEffects = (...effects: Array<(e: Entity) => Entity>) =>
  (entity: Entity): Entity => {
    return effects.reduce((e, effect) => effect(e), entity);
  };

// Pattern matching on entity type
export const applyDamageByType = (amount: number) => (entity: Entity): Entity => {
  const type = getType(entity);
  const modifier = type === 'player' ? 0.8 : type === 'enemy' ? 1.2 : 1.0;
  return takeDamage(Math.floor(amount * modifier))(entity);
};

/**
 * Advanced: Entity behaviors as recursive morphisms
 */

// Regeneration behavior (single application)
export const withRegeneration = (regenRate: number, maxHealth: number) => {
  return (entity: Entity): Entity => {
    const current = VALUE(entity);
    if (current.health >= maxHealth || isDead(entity)) {
      return entity; // No regeneration needed
    }
    
    const healed = heal(regenRate)(entity);
    const cappedHealth = Math.min(VALUE(healed).health, maxHealth);
    
    return experience(
      healed,
      { ...VALUE(healed), health: cappedHealth },
      `regenerated to ${cappedHealth}/${maxHealth} HP`
    );
  };
};

// Patrol behavior
export const patrol = (waypoints: Array<{ x: number; y: number }>, speed: number) => {
  let currentIndex = 0;
  
  return (entity: Entity): Entity => {
    if (waypoints.length === 0) return entity;
    
    const target = waypoints[currentIndex]!;
    const newEntity = moveTowards(target.x, target.y, speed)(entity);
    
    const pos = getPosition(newEntity);
    if (pos.x === target.x && pos.y === target.y) {
      currentIndex = (currentIndex + 1) % waypoints.length;
    }
    
    return newEntity;
  };
};

/**
 * The key insight: Encapsulation through composition, not hiding
 * 
 * Traditional OOP hides state behind walls (private fields).
 * λ-Foundation achieves encapsulation through transparent composition:
 * 
 * 1. Data is always visible (via VALUE)
 * 2. History is always accessible (via experience chain)
 * 3. Behaviors are composable morphisms
 * 4. "Private" logic lives in closure scope, not hidden fields
 * 
 * The lattice is transparent - you can see through it,
 * but it still provides structure and boundaries.
 */

// Module boundary - what we export defines the interface
export const EntityModule = {
  // Constructors
  create: createEntity,
  
  // Core morphisms
  move,
  takeDamage,
  heal,
  teleport,
  
  // Accessors
  getHealth,
  getPosition,
  getName,
  getType,
  isDead,
  
  // Composed behaviors
  moveTowards,
  applyIfAlive,
  applyEffects,
  applyDamageByType,
  withRegeneration,
  patrol
};

/**
 * Form Liberation achieved:
 * - No classes, only pure data and functions
 * - No mutations, only transformations
 * - No hidden state, only transparent composition
 * - No inheritance hierarchies, only morphism composition
 * 
 * The wall has become a lattice. 🏗️ → λ
 */