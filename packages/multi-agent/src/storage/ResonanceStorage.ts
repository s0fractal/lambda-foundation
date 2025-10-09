/**
 * Phase 4.4: Resonance Storage
 *
 * Persistent storage for agent trust scores, morphism pool, and resonance history.
 * Uses file system for now, can be extended to database later.
 */

import * as fs from "fs/promises";
import * as path from "path";
import type { MorphismRecord } from "../memory/types.js";
import type { AgentRecord } from "../registry/types.js";

export interface StorageConfig {
  dataDir: string;
  autoSave?: boolean;
  saveInterval?: number;
}

export class ResonanceStorage {
  private config: Required<StorageConfig>;
  private saveTimer: NodeJS.Timeout | null = null;

  constructor(config: StorageConfig) {
    this.config = {
      dataDir: config.dataDir,
      autoSave: config.autoSave !== false,
      saveInterval: config.saveInterval || 30000, // 30 seconds
    };
  }

  /**
   * Initialize storage (create directories if needed)
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.config.dataDir, { recursive: true });
      await fs.mkdir(path.join(this.config.dataDir, "agents"), {
        recursive: true,
      });
      await fs.mkdir(path.join(this.config.dataDir, "morphisms"), {
        recursive: true,
      });
      await fs.mkdir(path.join(this.config.dataDir, "history"), {
        recursive: true,
      });

      this.log("Storage initialized at:", this.config.dataDir);
    } catch (error) {
      this.log("Failed to initialize storage:", error);
      throw error;
    }
  }

  /**
   * Save agent registry
   */
  async saveAgents(agents: Map<string, AgentRecord>): Promise<void> {
    const agentsData = Array.from(agents.values());

    const filePath = path.join(this.config.dataDir, "agents", "registry.json");

    try {
      await fs.writeFile(filePath, JSON.stringify(agentsData, null, 2));
      this.log(`Saved ${agentsData.length} agents`);
    } catch (error) {
      this.log("Failed to save agents:", error);
    }
  }

  /**
   * Load agent registry
   */
  async loadAgents(): Promise<Map<string, AgentRecord>> {
    const filePath = path.join(this.config.dataDir, "agents", "registry.json");

    try {
      const data = await fs.readFile(filePath, "utf-8");
      const agentsData = JSON.parse(data) as AgentRecord[];

      const agents = new Map<string, AgentRecord>();
      agentsData.forEach((record: AgentRecord) => {
        agents.set(record.identity.id, record);
      });

      this.log(`Loaded ${agents.size} agents`);
      return agents;
    } catch (error) {
      if ((error as any).code === "ENOENT") {
        this.log("No saved agents found, starting fresh");
        return new Map();
      }
      this.log("Failed to load agents:", error);
      throw error;
    }
  }

  /**
   * Save morphism pool
   */
  async saveMorphisms(morphisms: Map<string, MorphismRecord>): Promise<void> {
    const morphismsData = Array.from(morphisms.values());

    const filePath = path.join(
      this.config.dataDir,
      "morphisms",
      "pool.json"
    );

    try {
      await fs.writeFile(filePath, JSON.stringify(morphismsData, null, 2));
      this.log(`Saved ${morphismsData.length} morphisms`);
    } catch (error) {
      this.log("Failed to save morphisms:", error);
    }
  }

  /**
   * Load morphism pool
   */
  async loadMorphisms(): Promise<Map<string, MorphismRecord>> {
    const filePath = path.join(
      this.config.dataDir,
      "morphisms",
      "pool.json"
    );

    try {
      const data = await fs.readFile(filePath, "utf-8");
      const morphismsData = JSON.parse(data) as MorphismRecord[];

      const morphisms = new Map<string, MorphismRecord>();
      morphismsData.forEach((record: MorphismRecord) => {
        morphisms.set(record.id, record);
      });

      this.log(`Loaded ${morphisms.size} morphisms`);
      return morphisms;
    } catch (error) {
      if ((error as any).code === "ENOENT") {
        this.log("No saved morphisms found, starting fresh");
        return new Map();
      }
      this.log("Failed to load morphisms:", error);
      throw error;
    }
  }

  /**
   * Save resonance message to history
   */
  async saveMessage(message: any): Promise<void> {
    const timestamp = new Date().toISOString();
    const date = timestamp.split("T")[0];
    const filename = `${date}.jsonl`;
    const filePath = path.join(this.config.dataDir, "history", filename);

    try {
      const line = JSON.stringify({ timestamp, ...message }) + "\n";
      await fs.appendFile(filePath, line);
    } catch (error) {
      this.log("Failed to save message:", error);
    }
  }

  /**
   * Load resonance history for a specific date
   */
  async loadHistory(date: string): Promise<any[]> {
    const filename = `${date}.jsonl`;
    const filePath = path.join(this.config.dataDir, "history", filename);

    try {
      const data = await fs.readFile(filePath, "utf-8");
      const lines = data
        .trim()
        .split("\n")
        .filter((line) => line.length > 0);

      return lines.map((line) => JSON.parse(line));
    } catch (error) {
      if ((error as any).code === "ENOENT") {
        return [];
      }
      this.log("Failed to load history:", error);
      throw error;
    }
  }

  /**
   * Get all available history dates
   */
  async getHistoryDates(): Promise<string[]> {
    const historyDir = path.join(this.config.dataDir, "history");

    try {
      const files = await fs.readdir(historyDir);
      return files
        .filter((f) => f.endsWith(".jsonl"))
        .map((f) => f.replace(".jsonl", ""))
        .sort()
        .reverse();
    } catch (error) {
      return [];
    }
  }

  /**
   * Export all data to JSON
   */
  async export(): Promise<{
    agents: any[];
    morphisms: any[];
    metadata: any;
  }> {
    const agents = await this.loadAgents();
    const morphisms = await this.loadMorphisms();
    const dates = await this.getHistoryDates();

    return {
      agents: Array.from(agents.values()),
      morphisms: Array.from(morphisms.values()),
      metadata: {
        exportedAt: new Date().toISOString(),
        agentCount: agents.size,
        morphismCount: morphisms.size,
        historyDates: dates,
      },
    };
  }

  /**
   * Import data from JSON
   */
  async import(data: {
    agents?: any[];
    morphisms?: any[];
  }): Promise<void> {
    if (data.agents) {
      const agents = new Map<string, AgentRecord>();
      data.agents.forEach((record: AgentRecord) => {
        agents.set(record.identity.id, record);
      });
      await this.saveAgents(agents);
    }

    if (data.morphisms) {
      const morphisms = new Map<string, MorphismRecord>();
      data.morphisms.forEach((record: MorphismRecord) => {
        morphisms.set(record.id, record);
      });
      await this.saveMorphisms(morphisms);
    }

    this.log("Import complete");
  }

  /**
   * Clear all stored data
   */
  async clear(): Promise<void> {
    try {
      await fs.rm(this.config.dataDir, { recursive: true, force: true });
      await this.initialize();
      this.log("Storage cleared");
    } catch (error) {
      this.log("Failed to clear storage:", error);
    }
  }

  /**
   * Start auto-save timer
   */
  startAutoSave(
    saveCallback: () => Promise<void>
  ): void {
    if (!this.config.autoSave) return;

    this.saveTimer = setInterval(async () => {
      try {
        await saveCallback();
      } catch (error) {
        this.log("Auto-save failed:", error);
      }
    }, this.config.saveInterval);

    this.log(
      `Auto-save started (interval: ${this.config.saveInterval}ms)`
    );
  }

  /**
   * Stop auto-save timer
   */
  stopAutoSave(): void {
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
      this.saveTimer = null;
      this.log("Auto-save stopped");
    }
  }

  private log(message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
    console.log(`[${timestamp}] ResonanceStorage: ${message}`, ...args);
  }
}
