import * as Phaser from 'phaser';
import Player from './Player';
import Game from '../scenes/Game';
import { HudInfo, Resources } from '../utils';
import * as Sprites from "../../assets/sprites";
import Client from '../client';
import AttackUnit from './npcs/AttackUnit';
import Archer from './npcs/Archer';
import Goblin from './npcs/Goblin';
import Soldier from './npcs/Soldier';

export default abstract class PlayerEntity extends Phaser.GameObjects.Sprite {
    // protected attributes:
    protected _owner: Player;
    protected _id: string;
    protected _health: number;
    protected _totalHealth: number;
    protected _visionRange: number;
    protected _spawningTime: number;
    protected _spawningCost: Resources;
    protected _hudInfo: HudInfo;

    static readonly COST: Resources;
    static readonly SPAWN_TIME_MS: number;

    /**
     * @constructor
     * @param owner is the player who created the entity, not optional.
     * @returns Object
     */
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, owner: Player, health: number, totalHealth: number, spawningTime: number, spawningCost: Resources, visionRange: number, frame?: string | number) {
        super(scene, x, y, texture, frame);
        this._owner = owner;
        this._health = health;
        this._totalHealth = totalHealth;
        this._spawningTime = spawningTime;
        this._spawningCost = spawningCost;
        this._visionRange = visionRange;

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        
        this.setInteractive( {pixelPerfect: true} );
        this.on('pointerup', this.onEntityClicked, this);
        this.on('pointerdown', this.onDown, this);
        this.on('pointerover', this.onHover, this);
        this.on('pointerout', this.onOut, this);

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
            // TODO: Kill / Destroy entity
            this.dieOrDestroy();
        }
    }

    protected abstract dieOrDestroy();

    onEntityClicked(pointer: Phaser.Input.Pointer): void {
        if (pointer.leftButtonReleased()) {
            (<Game>(this.scene)).setSelectedEntity(this);
        }
    }

    onDown(pointer: Phaser.Input.Pointer): void { // TODO Se sobre pone el de game
        let entity = (<Game>(this.scene)).getSelectedEntity();

        if (entity && entity instanceof PlayerEntity // TODO Tiene que ser solo para las AttackUnits
            && entity.belongsToMe() && !this.belongsToMe() && pointer.rightButtonDown()) {
            this.scene.input.setDefaultCursor(`url(${Sprites.UI.Pointers.Sword_Pressed}), pointer`);
        }
    }

    onHover(): void {
        let entity = (<Game>(this.scene)).getSelectedEntity();

        if (entity && entity instanceof PlayerEntity // TODO Tiene que ser solo para las AttackUnits
            && entity.belongsToMe() && !this.belongsToMe()) {
            this.scene.input.setDefaultCursor(`url(${Sprites.UI.Pointers.Sword}), pointer`);
        }
    }

    onOut(): void {
        this.scene.input.setDefaultCursor(`url(${Sprites.UI.Pointers.Pointer}), pointer`);
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

    getHealth(): number {
        return this._health;
    }
}