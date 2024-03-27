import * as Phaser from 'phaser';
import Player from './Player';
import Game from '../scenes/Game';
import { HudInfo, IconInfo, Resources } from '../utils';
import Client from '../client';
import AttackUnit from './npcs/AttackUnit';

export default abstract class PlayerEntity extends Phaser.GameObjects.Sprite {
    // protected attributes:
    protected _owner: Player;
    protected _id: string;
    protected _health: number;
    protected _totalHealth: number;
    protected _visionRange: number;
    protected _path;
    protected _currentTarget;
    protected _iconInfo: IconInfo;
    protected _spawningTime: number;
    protected _spawningCost: Resources;
    abstract _hudInfo: HudInfo;

    static readonly COST: Resources;
    static readonly SPAWN_TIME_MS: number;

    /**
     * @constructor
     * @param owner is the player who created the entity, not optional.
     * @returns Object
     */
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, owner: Player, health: number, totalHealth: number, spawningTime: number, spawningCost: Resources, visionRange: number, iconInfo: IconInfo, frame?: string | number) {
        super(scene, x, y, texture, frame);
        this._owner = owner;
        this._health = health;
        this._totalHealth = totalHealth;
        this._spawningTime = spawningTime;
        this._spawningCost = spawningCost;
        this._visionRange = visionRange;
        this._iconInfo = iconInfo;

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        
        this.setInteractive();
        this.on('pointerdown', this.onEntityClicked, this);

        this.scene.events.on("update", this.update, this);
    }

    /**
     * @param damage
     */
    onAttackReceived(damage: number, attackUnit: AttackUnit): void {
        this._health -= damage;
        (this._hudInfo.info as {
            isMine: boolean;
            health: number;
            totalHealth: number;
            damage?: number;
        }).health = this._health;

        if(this._health <= 0) {
            // Kill / Destroy entity
        }
    }

    onEntityClicked(pointer: Phaser.Input.Pointer): void {
        if (pointer.leftButtonDown()) {
            (<Game>(this.scene)).setSelectedEntity(this);
        }
    }

    destroy() {
        if (this.scene) this.scene.events.off("update", this.update, this);
            super.destroy();
    }

    belongsToMe(): boolean {
        return this._owner.getColor() === Client.getMyColor();
    }

    getHudInfo(): HudInfo {
        return this._hudInfo;
    };
    
    getId(): string {
        return this._id;
    }
}