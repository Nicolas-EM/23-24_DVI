import Client from "../../client";
import Game from "../../scenes/Game";
import { Resources } from "../../utils";
import Archer from "../npcs/Archer";
import Goblin from "../npcs/Goblin";
import Soldier from "../npcs/Soldier";
import Villager from "../npcs/Villager";
import Player from "../Player";
import Building from "./Building"

export default abstract class SpawnerBuilding extends Building {
    protected spawnQueue: (typeof Archer | typeof Goblin | typeof Soldier | typeof Villager)[] = [];
    protected spawnTimer: Phaser.Time.TimerEvent | null = null;
    protected spawnTimerHud: Phaser.Time.TimerEvent | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, owner: Player, health: number, totalHealth: number, spawningTime: number, spawningCost: Resources, visionRange: number, frame?: string | number) {
        super(scene, x, y, texture, owner, health, totalHealth, spawningTime, spawningCost, visionRange, frame);
    }

    queueNPC(npcType: typeof Archer | typeof Goblin | typeof Soldier | typeof Villager): void {
        if (this._owner.hasResource(npcType.COST)) {
            this._owner.pay(npcType.COST);
            this.spawnQueue.push(npcType);
            // Start the queue
            if (!this.spawnTimer) {
                // Always true
                if ("queueIcon" in this._hudInfo.info && "queueTime" in this._hudInfo.info) {
                    this._hudInfo.info.queueIcon = npcType.ICON + this._owner.getColor();
                    this._hudInfo.info.queueTime = npcType.SPAWN_TIME_MS / 1000;
                }
                this.startSpawnTimer(npcType.SPAWN_TIME_MS);
            }
        }
    }
    
    cancelNPC() {
        this.spawnQueue.shift();
    }

    spawn(): void {
        if (this.spawnQueue.length > 0 && this._owner.getNPCs().length < this._owner.getMaxPopulation()) {
            const npcType = this.spawnQueue.shift();
            Client.spawnNpc(npcType.name, this.x + this.width, this.y, this._owner.getColor());
            // Update with new NPC about to be spawned (if any)
            if (this.spawnQueue.length > 0) {
                const npcType = this.spawnQueue[0];
                // Always true
                if ("queueIcon" in this._hudInfo.info && "queueTime" in this._hudInfo.info) {
                    this._hudInfo.info.queueIcon = npcType.ICON + this._owner.getColor();
                    this._hudInfo.info.queueTime = npcType.SPAWN_TIME_MS / 1000 + 1;
                }
            }
        }
        if (this.spawnQueue.length === 0) {
            // No more NPCs in queue, stop timer and delete queue
            this.stopSpawnTimer();
            // Always true
            if ("queueIcon" in this._hudInfo.info && "queueTime" in this._hudInfo.info) {
                this._hudInfo.info.queueIcon = null;
                this._hudInfo.info.queueTime = null;
            }
        }
    }

    startSpawnTimer(delay: number): void {
        this.spawnTimer = this.scene.time.addEvent({
            delay,
            callback: this.spawn,
            callbackScope: this,
            loop: true
        });

        this.spawnTimerHud = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                if ("queueTime" in this._hudInfo.info) {
                    this._hudInfo.info.queueTime -= 1;
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    stopSpawnTimer(): void {
        if (this.spawnTimer) {
            this.spawnTimer.destroy();
            this.spawnTimer = null;
        }
        if (this.spawnTimerHud) {
            this.spawnTimerHud.destroy();
            this.spawnTimerHud = null;
        }
    }
    
};