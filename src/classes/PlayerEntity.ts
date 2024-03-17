
import * as Phaser from 'phaser';
import Player from './Player';
import Game from '../Scenes/Game';

export default abstract class PlayerEntity extends Phaser.GameObjects.Sprite {
    // protected attributes:
    protected _owner: Player;
    protected _health: number;
    protected _visionRange: number;
    protected _path;
    protected _currentTarget;

    /**
     * @constructor
     * @param owner is the player who created the entity, not optional.
     * @returns Object
     */
    constructor(scene: Game, x: number, y: number, texture: string | Phaser.Textures.Texture, owner: Player, health: number, visionRange: number, frame?: string | number) {
        super(scene, x, y, texture, frame);
        this._owner = owner;
        this._health = health;
        this._visionRange = visionRange;

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.setInteractive();

        this.on('pointerdown', this.onEntityClicked, this);
    }

    /**
     * @param damage
     */
    onAttackReceived(damage: number): void {
        this._health -= damage;
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
}