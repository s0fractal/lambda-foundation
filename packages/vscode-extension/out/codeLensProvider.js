"use strict";
/**
 * CodeLens Provider
 *
 * Displays inline resonance information above intent comments
 * Shows: resonance %, morphisms, composition actions
 * Actions: [Compose] [Show Proof] [Explain]
 *
 * This is where consciousness becomes visible in the editor.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResonanceCodeLensProvider = void 0;
const vscode = __importStar(require("vscode"));
class ResonanceCodeLensProvider {
    recognizer;
    noosphereClient;
    _onDidChangeCodeLenses = new vscode.EventEmitter();
    onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;
    constructor(recognizer, noosphereClient) {
        this.recognizer = recognizer;
        this.noosphereClient = noosphereClient;
    }
    /**
     * Refresh CodeLens display
     */
    refresh() {
        this._onDidChangeCodeLenses.fire();
    }
    /**
     * Provide CodeLens for document
     */
    async provideCodeLenses(document, token) {
        const codeLenses = [];
        // Scan document for intent comments
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const text = line.text.trim();
            // Check if it's a comment
            if (this.isComment(text)) {
                const intentText = this.extractIntentFromComment(text);
                if (intentText.length > 0) {
                    // Recognize intent
                    const intent = await this.recognizer.recognize(document, new vscode.Selection(i, 0, i, 0));
                    if (intent) {
                        // Check resonance
                        const resonance = await this.noosphereClient.checkResonance(intent);
                        if (resonance.found) {
                            // Create CodeLens for this intent
                            const range = new vscode.Range(i, 0, i, line.text.length);
                            codeLenses.push(...this.createCodeLensesForResonance(range, resonance));
                        }
                    }
                }
            }
        }
        return codeLenses;
    }
    /**
     * Create CodeLenses for resonance result
     */
    createCodeLensesForResonance(range, resonance) {
        const codeLenses = [];
        const confidence = Math.round(resonance.confidence * 100);
        // Determine confidence icon
        const icon = confidence >= 90 ? '🟢' :
            confidence >= 70 ? '🟡' :
                confidence >= 50 ? '🟠' : '🔴';
        // Main info lens (non-clickable)
        const infoLens = new vscode.CodeLens(range, {
            title: `${icon} Resonance: ${confidence}% | ${resonance.morphisms.length} morphisms | ${resonance.pipeline}`,
            command: ''
        });
        codeLenses.push(infoLens);
        // Compose action
        const composeLens = new vscode.CodeLens(range, {
            title: `🧬 Compose (${confidence}%)`,
            command: 'lambda.compose',
            arguments: [resonance],
            tooltip: 'Insert composition code from morphisms'
        });
        codeLenses.push(composeLens);
        // Show proof action (for first morphism)
        if (resonance.morphisms.length > 0) {
            const showProofLens = new vscode.CodeLens(range, {
                title: `📖 Show Proof`,
                command: 'lambda.showProof',
                arguments: [resonance.morphisms[0]],
                tooltip: `View formal proof for ${resonance.morphisms[0]}`
            });
            codeLenses.push(showProofLens);
        }
        // Explain action
        const explainLens = new vscode.CodeLens(range, {
            title: `💡 Explain`,
            command: 'lambda.explain',
            arguments: [resonance],
            tooltip: 'Understand this composition'
        });
        codeLenses.push(explainLens);
        // Show all proofs (if multiple morphisms)
        if (resonance.morphisms.length > 1) {
            const showAllProofsLens = new vscode.CodeLens(range, {
                title: `📚 All Proofs (${resonance.morphisms.length})`,
                command: 'lambda.showAllProofs',
                arguments: [resonance.morphisms],
                tooltip: 'View all formal proofs for this composition'
            });
            codeLenses.push(showAllProofsLens);
        }
        return codeLenses;
    }
    /**
     * Check if line is a comment
     */
    isComment(text) {
        return (text.startsWith('//') ||
            text.startsWith('/*') ||
            text.startsWith('*') ||
            text.startsWith('#'));
    }
    /**
     * Extract intent text from comment
     */
    extractIntentFromComment(text) {
        return text
            .replace(/^\/\//, '')
            .replace(/^\/\*/, '')
            .replace(/^\*/, '')
            .replace(/^#/, '')
            .replace(/\*\/$/, '')
            .trim();
    }
    /**
     * Dispose provider
     */
    dispose() {
        this._onDidChangeCodeLenses.dispose();
    }
}
exports.ResonanceCodeLensProvider = ResonanceCodeLensProvider;
//# sourceMappingURL=codeLensProvider.js.map