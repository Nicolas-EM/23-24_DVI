import Client from "../../client";
import Archer from "../npcs/Archer";
import Goblin from "../npcs/Goblin";
import Soldier from "../npcs/Soldier";
import Villager from "../npcs/Villager";
import Player from "../Player";
import Building from "./Building"

export default abstract class SpawnerBuilding extends Building {

    // Attributes
    protected spawnQueue: (typeof Archer | typeof Goblin | typeof Soldier | typeof Villager)[] = [];
    protected spawnTimer: Phaser.Time.TimerEvent;
    protected spawnTimerHud: Phaser.Time.TimerEvent;

    // Constructor
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, owner: Player, health: number, totalHealth: number, frame?: string | number) {
        super(scene, x, y, texture, owner, health, totalHealth, frame);
    }

    queueNPC(npcType: typeof Archer | typeof Goblin | typeof Soldier | typeof Villager): void {
        if (this._owner.hasResource(npcType.COST)) {
            // Pay
            this._owner.pay(npcType.COST);
            // Add to queue
            this.spawnQueue.push(npcType);
            // If queue was empty, start it
            if (!this.spawnTimer) {
                if ("queueIcon" in this._hudInfo.info && "queueTime" in this._hudInfo.info) {  
                    this._hudInfo.info.queueIcon = npcType.ICON + this._owner.getColor();
                    this._hudInfo.info.queueTime = npcType.SPAWN_TIME_MS / 1000;
                }
                this.startSpawnTimer(npcType.SPAWN_TIME_MS);
            }
        }
    }
    
    cancelNPC() {
        // Remove from queue
        const cancelledNPC = this.spawnQueue.shift();
        // Return resources to player
        this._owner.addResources(cancelledNPC.COST);

        this.stopSpawnTimer();  // Stop current timer
        // Update with new (or current) NPC about to be spawned (if any)
        if (this.spawnQueue.length > 0) {
            const npcType = this.spawnQueue[0];

            if ("queueIcon" in this._hudInfo.info && "queueTime" in this._hudInfo.info) {  // Should always be true
                this._hudInfo.info.queueIcon = npcType.ICON + this._owner.getColor();
                this._hudInfo.info.queueTime = npcType.SPAWN_TIME_MS / 1000;
            }
            this.startSpawnTimer(npcType.SPAWN_TIME_MS);
        }
        else if (this.spawnQueue.length === 0) {
            if ("queueIcon" in this._hudInfo.info && "queueTime" in this._hudInfo.info) {  // Should always be true
                this._hudInfo.info.queueIcon = null;
                this._hudInfo.info.queueTime = null;
            }
        }
    }
    
    spawn(): void {
        if (this.spawnQueue.length > 0) {
            // If player can spawn more NPCs (MAX_POPULATION)
            if (this._owner.getNPCs().length < this._owner.getMaxPopulation()) {
                const npcType = this.spawnQueue.shift();
                Client.spawnNpc(npcType.ICON, this.x, this.y  + this.height/2, this._owner.getColor());
            }

            // Update with new (or current) NPC about to be spawned (if any)
            if (this.spawnQueue.length > 0) {
                const npcType = this.spawnQueue[0];
                if ("queueIcon" in this._hudInfo.info && "queueTime" in this._hudInfo.info) {  // Should always be true
                    this._hudInfo.info.queueIcon = npcType.ICON + this._owner.getColor();
                    this.setQueueTime();
                }
            }
        }
        if (this.spawnQueue.length === 0) {
            // No more NPCs in queue, stop timer and delete queue
            this.stopSpawnTimer();
            if ("queueIcon" in this._hudInfo.info && "queueTime" in this._hudInfo.info) {  // Should always be true
                this._hudInfo.info.queueIcon = null;
                this._hudInfo.info.queueTime = null;
            }
        }
    }

    startSpawnTimer(delay: number): void {
        // Timer for spawning NPC (SPAWNING_TIME)
        this.spawnTimer = this.scene.time.addEvent({
            delay,
            callback: this.spawn,
            callbackScope: this,
            loop: true
        });

        // Timer for HUD (1s)
        this.spawnTimerHud = this.scene.time.addEvent({
            delay: 1000,
            callback: this.setQueueTime,
            callbackScope: this,
            loop: true
        });
    }

    setQueueTime() {
        const npcType = this.spawnQueue[0];
        if ("queueTime" in this._hudInfo.info) {
            if (this._owner.getNPCs().length >= this._owner.getMaxPopulation()) {  // Can't spawn, not enough space
                this._hudInfo.info.queueTime = Infinity;
            } else if (this._hudInfo.info.queueTime === Infinity || this._hudInfo.info.queueTime == 0) {  // New NPC in queue
                this._hudInfo.info.queueTime = npcType.SPAWN_TIME_MS / 1000;
            } else {  // Substract 1s
                this._hudInfo.info.queueTime -= 1;
            }
        }
    }

    stopSpawnTimer(): void {
        // Spawn timer
        if (this.spawnTimer) {
            this.spawnTimer.remove();
            this.spawnTimer = null;
        }
        // Hud timer
        if (this.spawnTimerHud) {
            this.spawnTimerHud.remove();
            this.spawnTimerHud = null;
        }
    }

    dieOrDestroy() {
        // If there were NPCs in queue, cancel all of them
        while (this.spawnQueue.length) {
            const npcType = this.spawnQueue.pop();
            this._owner.addResources(npcType.COST);
        }
        this.stopSpawnTimer();

        super.dieOrDestroy();
    }
};