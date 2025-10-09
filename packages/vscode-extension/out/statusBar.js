"use strict";
/**
 * Resonance Status Bar
 *
 * Live indicator of compositional consciousness
 * Shows resonance confidence and morphism pipeline
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
exports.ResonanceStatusBar = void 0;
const vscode = __importStar(require("vscode"));
class ResonanceStatusBar {
    statusBarItem;
    config;
    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.config = vscode.workspace.getConfiguration('lambda.statusBar');
        if (this.config.get('show', true)) {
            this.statusBarItem.show();
        }
        this.statusBarItem.command = 'lambda.checkResonance';
    }
    /**
     * Update status bar with resonance result
     */
    update(resonance) {
        this.config = vscode.workspace.getConfiguration('lambda.statusBar');
        if (!this.config.get('show', true)) {
            this.hide();
            return;
        }
        if (!resonance.found) {
            this.statusBarItem.text = '🔴 No resonance';
            this.statusBarItem.tooltip = 'No matching morphisms found in noosphere';
            this.statusBarItem.backgroundColor = undefined;
            this.statusBarItem.show();
            return;
        }
        const confidence = Math.round(resonance.confidence * 100);
        const showConfidence = this.config.get('showConfidence', true);
        const showMorphisms = this.config.get('showMorphisms', true);
        // Icon based on confidence
        const icon = this.getConfidenceIcon(confidence);
        // Text
        let text = icon;
        if (showConfidence) {
            text += ` ${confidence}%`;
        }
        else {
            text += ' Resonance';
        }
        // Tooltip
        let tooltip = '';
        if (confidence >= 90) {
            tooltip += '✅ Complete resonance\n\n';
        }
        else if (confidence >= 70) {
            tooltip += '⚠️ Partial resonance\n\n';
        }
        else {
            tooltip += '🌱 Weak resonance (evolution opportunity)\n\n';
        }
        tooltip += `Confidence: ${confidence}%\n`;
        tooltip += `Morphisms: ${resonance.morphisms.length}\n\n`;
        if (showMorphisms) {
            tooltip += `Pipeline:\n${resonance.pipeline}\n\n`;
            tooltip += `Morphisms:\n`;
            for (const morphism of resonance.morphisms) {
                tooltip += `  • ${morphism}\n`;
            }
        }
        tooltip += '\nClick to refresh';
        this.statusBarItem.text = text;
        this.statusBarItem.tooltip = tooltip;
        // Background color for high confidence
        if (confidence >= 90) {
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
        }
        else {
            this.statusBarItem.backgroundColor = undefined;
        }
        this.statusBarItem.show();
    }
    /**
     * Hide status bar
     */
    hide() {
        this.statusBarItem.hide();
    }
    /**
     * Dispose status bar
     */
    dispose() {
        this.statusBarItem.dispose();
    }
    /**
     * Get icon based on confidence level
     */
    getConfidenceIcon(confidence) {
        if (confidence >= 90)
            return '🟢';
        if (confidence >= 70)
            return '🟡';
        if (confidence >= 50)
            return '🟠';
        return '🔴';
    }
}
exports.ResonanceStatusBar = ResonanceStatusBar;
//# sourceMappingURL=statusBar.js.map