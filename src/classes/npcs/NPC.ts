import * as Phaser from 'phaser';
import Player from '../Player'
import PlayerEntity from '../PlayerEntity';
import Game from '../../scenes/Game';
import { PhaserNavMesh } from "phaser-navMesh";
import { Resources } from '../../utils';

export default abstract class NPC extends PlayerEntity {
    protected _path;
    protected _currentTarget;
    protected _movementSpeed: number;

    /**
     * @constructor
     * @param owner is the player who created the entity, not optional.
     * @returns NPC instance
     */
    constructor(scene: Game, x: number, y: number, texture: string | Phaser.Textures.Texture, owner: Player, health: number, totalHealth: number, spawningTime: number, spawningCost: Resources, visionRange: number, movementSpeed: number, frame?: string | number) {
        super(scene, x, y, texture, owner, health, totalHealth, spawningTime, spawningCost, visionRange, frame);
        this._movementSpeed = movementSpeed;

        this._id = `${owner.getColor()}_NPC_${owner.getNextEntityId()}`;
        owner.addNPC(this);
    }

    setMovementTarget(targetPoint: Phaser.Math.Vector2, navMesh: PhaserNavMesh): void {
        // Find a path to the target
        this._path = navMesh.findPath(new Phaser.Math.Vector2(this.x, this.y), targetPoint);
        if (this._path && this._path.length > 0) {
            this._currentTarget = this._path.shift();
        }
        else this._currentTarget = null;
    }

    moveToTarget(elapsedSeconds: number) {
        const { x, y } = this._currentTarget;
        const angle = Phaser.Math.Angle.Between(this.x, this.y, x, y);
        const distance = Phaser.Math.Distance.Between(this.x, this.y, x, y);
        const targetSpeed = distance / elapsedSeconds;
        const magnitude = Math.min(this._movementSpeed, targetSpeed);

        const velocityX = Math.cos(angle) * magnitude;
        const velocityY = Math.sin(angle) * magnitude;

        this.x += velocityX;
        this.y += velocityY;
    }

    dieOrDestroy() {
        this._owner.removeNPC(this);
        this.destroy();
    }

    update(time: number, deltaTime: number) {
        if (!this.body) return;

        if (this._currentTarget) {
            const { x, y } = this._currentTarget;
            const distance = Phaser.Math.Distance.Between(this.x, this.y, x, y);

            if (distance < 5) {
                if (this._path.length > 0) this._currentTarget = this._path.shift();
                else this._currentTarget = null;
            }

            if (this._currentTarget) this.moveToTarget(deltaTime / 1000);
        }
    }
}