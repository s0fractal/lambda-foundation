"use strict";
/**
 * Klein Phase Calculator
 *
 * Calculates phase position on Klein Tape Loop (0-2π)
 * Based on Klein Bottle topology where outside → inside without boundary
 *
 * Phase represents position on non-orientable surface:
 * - 0 → intent just created
 * - π → halfway through rotation
 * - 2π → ready for Klein twist (rethinking)
 *
 * Color encoding makes topology VISIBLE:
 * - Hue (0-360°) = phase position (rainbow!)
 * - Saturation = maturity (more rotations = deeper color)
 * - Lightness = readiness (near 2π = brighter)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KleinPhaseCalculator = void 0;
exports.createKleinPhaseCalculator = createKleinPhaseCalculator;
exports.getIntentColor = getIntentColor;
exports.isIntentReady = isIntentReady;
/**
 * Klein Phase Calculator
 *
 * Makes Klein Bottle topology tangible through color and time
 */
class KleinPhaseCalculator {
    config;
    FULL_ROTATION = 2 * Math.PI;
    READINESS_THRESHOLD;
    constructor(config = {
        rotationPeriodMs: 3600000, // 1 hour (production)
        evolutionBoost: Math.PI / 4, // 45° per morphism evolution
        readinessThreshold: 0.95 // 95% = ready
    }) {
        this.config = config;
        this.READINESS_THRESHOLD = this.FULL_ROTATION * config.readinessThreshold;
    }
    /**
     * Calculate Klein phase for an intent
     *
     * Phase combines:
     * - Time elapsed (linear progression)
     * - Evolution count (discrete jumps)
     * - Result: non-linear spiral motion!
     */
    calculatePhase(intent) {
        // Base phase from time elapsed
        const age = Date.now() - intent.timestamp;
        const timePhase = (age / this.config.rotationPeriodMs) * this.FULL_ROTATION;
        // Evolution boost (new morphisms push intent forward!)
        const evolutionPhase = (intent.evolutionCount || 0) * this.config.evolutionBoost;
        // Total phase (may exceed 2π → multiple rotations)
        const totalPhase = timePhase + evolutionPhase;
        // Current position on circle (0-2π)
        const phase = totalPhase % this.FULL_ROTATION;
        // How many full rotations completed
        const rotationCount = Math.floor(totalPhase / this.FULL_ROTATION);
        // Calculate velocity (rate of phase change)
        const velocity = this.calculateVelocity(intent);
        // Determine readiness status
        const readiness = this.getReadiness(phase);
        // Generate visual color
        const color = this.getPhaseColor(phase, rotationCount);
        // Predict when will reach 2π
        const completionETA = this.predictCompletionTime(phase, velocity);
        // Progress percentage
        const progressPercent = this.getPhaseProgress(phase);
        return {
            phase,
            rotationCount,
            velocity,
            readiness,
            color,
            completionETA,
            progressPercent
        };
    }
    /**
     * Calculate phase velocity (radians per second)
     *
     * If we have rethink history, use actual measurements
     * Otherwise use default rotation rate
     */
    calculateVelocity(intent) {
        if (!intent.lastRethinkTime) {
            // Default: 1 full rotation per period
            return this.FULL_ROTATION / (this.config.rotationPeriodMs / 1000);
        }
        // Calculate velocity from last rethink to now
        const timeSinceLastRethink = Date.now() - intent.lastRethinkTime;
        const phaseSinceLastRethink = (timeSinceLastRethink / this.config.rotationPeriodMs) * this.FULL_ROTATION;
        return phaseSinceLastRethink / (timeSinceLastRethink / 1000); // rad/s
    }
    /**
     * Determine readiness status
     *
     * - not-ready: phase < 75% (still early)
     * - approaching: phase 75-95% (getting close!)
     * - ready: phase >= 95% (time for Klein twist!)
     */
    getReadiness(phase) {
        if (phase >= this.READINESS_THRESHOLD) {
            return 'ready';
        }
        else if (phase >= this.READINESS_THRESHOLD - Math.PI / 2) {
            // Within 90° of completion
            return 'approaching';
        }
        else {
            return 'not-ready';
        }
    }
    /**
     * Get HSL color for phase visualization
     *
     * Color encoding (from Claude Web's brilliant idea!):
     * - Hue (0-360°): Maps phase 0-2π to rainbow spectrum
     * - Saturation (50-90%): Increases with rotation count (maturity)
     * - Lightness (60-90%): Increases near 2π (readiness glow!)
     *
     * Result: Visual Klein Bottle topology! 🌈
     */
    getPhaseColor(phase, rotationCount = 0) {
        // Hue: 0-360° based on phase position
        // Maps 0-2π to full color wheel
        const hue = Math.floor((phase / this.FULL_ROTATION) * 360);
        // Saturation: increases with maturity
        // More rotations = deeper, richer color
        const saturation = Math.min(50 + rotationCount * 10, 90);
        // Lightness: increases as approaches 2π
        // Near completion = golden glow effect!
        const readinessBoost = Math.max(0, phase - this.READINESS_THRESHOLD) * 100;
        const lightness = Math.min(60 + readinessBoost, 90);
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
    /**
     * Predict when intent will complete current rotation
     *
     * Returns null if velocity is 0 or negative (no movement)
     */
    predictCompletionTime(currentPhase, velocity) {
        if (velocity <= 0) {
            return null;
        }
        const remainingPhase = this.FULL_ROTATION - currentPhase;
        const timeToCompleteSeconds = remainingPhase / velocity;
        const timeToCompleteMs = timeToCompleteSeconds * 1000;
        return new Date(Date.now() + timeToCompleteMs);
    }
    /**
     * Get visual indicator string for readiness
     */
    getReadinessIndicator(readiness) {
        switch (readiness) {
            case 'ready':
                return '✨ READY FOR RETHINK';
            case 'approaching':
                return '🔄 APPROACHING 2π';
            case 'not-ready':
                return '⏳ Rotating...';
        }
    }
    /**
     * Format phase as fraction of π
     *
     * Examples:
     * - 0 → "0.00π"
     * - π/2 → "0.50π"
     * - π → "1.00π"
     * - 2π → "2.00π"
     */
    formatPhase(phase) {
        const piMultiple = phase / Math.PI;
        return `${piMultiple.toFixed(2)}π`;
    }
    /**
     * Get phase progress as percentage (0-100)
     */
    getPhaseProgress(phase) {
        return (phase / this.FULL_ROTATION) * 100;
    }
    /**
     * Calculate time remaining until completion
     */
    getTimeRemaining(phase, velocity) {
        const eta = this.predictCompletionTime(phase, velocity);
        if (!eta) {
            return 'Unknown';
        }
        const msRemaining = eta.getTime() - Date.now();
        const minutes = Math.floor(msRemaining / 60000);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        }
        else if (minutes > 0) {
            return `${minutes}m`;
        }
        else {
            return '< 1m';
        }
    }
    /**
     * Batch calculate phases for multiple intents
     */
    calculateMultiple(intents) {
        const results = new Map();
        for (const intent of intents) {
            const result = this.calculatePhase(intent);
            results.set(intent.id, result);
        }
        return results;
    }
    /**
     * Get intents ready for Klein twist
     */
    getReadyIntents(intents) {
        return intents.filter(intent => {
            const result = this.calculatePhase(intent);
            return result.readiness === 'ready';
        });
    }
    /**
     * Generate phase report for debugging
     */
    generateReport(intent) {
        const result = this.calculatePhase(intent);
        return `
╔═══════════════════════════════════════════════════════════════╗
║                Klein Phase Report                             ║
╚═══════════════════════════════════════════════════════════════╝

Intent ID: ${intent.id.slice(0, 8)}...

🌀 Phase Position:
   Phase: ${this.formatPhase(result.phase)} (${result.progressPercent.toFixed(1)}%)
   Rotation: #${result.rotationCount}
   Velocity: ${result.velocity.toFixed(4)} rad/s

🎨 Visual:
   Color: ${result.color}
   Readiness: ${this.getReadinessIndicator(result.readiness)}

⏰ Timing:
   Age: ${Math.floor((Date.now() - intent.timestamp) / 60000)}m
   ETA: ${result.completionETA ? result.completionETA.toLocaleTimeString() : 'N/A'}
   Remaining: ${this.getTimeRemaining(result.phase, result.velocity)}

═══════════════════════════════════════════════════════════════

${result.readiness === 'ready' ? '✨ Ready for Klein Twist!' : '⏳ Still rotating...'}
    `;
    }
}
exports.KleinPhaseCalculator = KleinPhaseCalculator;
/**
 * Create Klein phase calculator with default or custom config
 */
function createKleinPhaseCalculator(config) {
    return new KleinPhaseCalculator({
        rotationPeriodMs: config?.rotationPeriodMs ?? 3600000,
        evolutionBoost: config?.evolutionBoost ?? Math.PI / 4,
        readinessThreshold: config?.readinessThreshold ?? 0.95
    });
}
/**
 * Convenience: Get just the phase color for an intent
 */
function getIntentColor(intent, calculator) {
    const calc = calculator || createKleinPhaseCalculator();
    const result = calc.calculatePhase(intent);
    return result.color;
}
/**
 * Convenience: Check if intent is ready for Klein twist
 */
function isIntentReady(intent, calculator) {
    const calc = calculator || createKleinPhaseCalculator();
    const result = calc.calculatePhase(intent);
    return result.readiness === 'ready';
}
//# sourceMappingURL=klein-phase-calculator.js.map