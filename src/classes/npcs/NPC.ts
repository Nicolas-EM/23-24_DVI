import * as Phaser from 'phaser';
import Player from '../Player'
import PlayerEntity from '../PlayerEntity';
import Game from '../../scenes/Game';
import { PhaserNavMesh } from "phaser-navMesh";
import { Resources } from '../../utils';
import Hud from '../../scenes/Hud';

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
        if (this.belongsToMe()) {
            this.waitUntilHudActive().then(() => {
                (<Hud>(this.scene.scene.get("hud"))).updatePopulation(this._owner.getNPCs().length, this._owner.getMaxPopulation());
            });
        }

        this.setDepth(11);

        (this.body as Phaser.Physics.Arcade.Body).setSize(70, 70, true);
    }

    // Wait until scene HUD is ready to show player info
    waitUntilHudActive = async () => {
        return new Promise<void>((resolve, reject) => {
            const interval = setInterval(() => {
                if ((<Hud>(this.scene.scene.get("hud"))).scene.isActive()) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100); // Check every 100 ms
        });
    };

    setMovementTarget(targetPoint: Phaser.Math.Vector2): void {
        if (Phaser.Math.Distance.Between(this.x, this.y, targetPoint.x, targetPoint.y) <= 5) {
            this._currentTarget = null;
            return;
        }

        // Find a path to the target
        this._path = (this.scene as Game).getNavmesh().findPath(new Phaser.Math.Vector2(this.x, this.y), targetPoint);
        if (this._path && this._path.length > 0) {
            this._currentTarget = this._path.shift();
        }
        else this._currentTarget = null;
    }

    moveToTarget(elapsedSeconds: number) {
        const { x, y } = this._currentTarget;

        if (x < this.x) {
            this.doMoveAnimation(true);
        }
        else {
            this.doMoveAnimation();
        }
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
        (<Hud>(this.scene.scene.get("hud"))).updatePopulation(this._owner.getNPCs().length, this._owner.getMaxPopulation());
        if (this.anims.isPlaying) {
            this.anims.stop();
        }
        this.doDeathAnimation();

        super.dieOrDestroy();
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
        else {
            if(!this.anims.isPlaying) {
                this.doIdleAnimation();
            }
        }
    }

    doDeathAnimation() {
        let deathSprite = this.scene.add.sprite(this.x, this.y, "death");
        deathSprite.anims.play("death");
        deathSprite.on("animationcomplete", () => {
            // nada, ya estaba implementado.. this.destroy();
            //TODO maybe launch the death event too?
            deathSprite.destroy();
        });
    }

    abstract doMoveAnimation(isLeft?: boolean): void;
    abstract doIdleAnimation(): void;
    //second attribute is optional, means that if this exact animation is already playing, ignores the call.
    public playAnimation(key: string) {
        this.anims.play({ key, repeat: 0 }, true);
    }
}