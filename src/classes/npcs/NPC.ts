import * as Phaser from 'phaser';
import Player from '../Player'
import PlayerEntity from '../PlayerEntity';
import Game from '../../scenes/Game';
import { Resources } from '../../utils';
import Hud from '../../scenes/Hud';
import Client from '../../client';

export default abstract class NPC extends PlayerEntity {

    // Attributes
    protected _path;
    protected _currentTarget;
    protected _movementSpeed: number;
    protected _spawningTime: number;
    protected _spawningCost: Resources;

    // Constructor
    constructor(scene: Game, x: number, y: number, texture: string | Phaser.Textures.Texture, owner: Player, health: number, totalHealth: number, spawningTime: number, spawningCost: Resources, movementSpeed: number, frame?: string | number) {
        super(scene, x, y, texture, owner, health, totalHealth, frame);
        
        this._movementSpeed = movementSpeed;
        this._spawningTime = spawningTime;
        this._spawningCost = spawningCost;

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

    // --- Movement ---
    setMovementTarget(targetPoint: Phaser.Math.Vector2): void {
        if (Phaser.Math.Distance.Between(this.x, this.y, targetPoint.x, targetPoint.y) <= 5) {
            this._currentTarget = null;
            return;
        }

        // Find a path to the target
        this._path = (this.scene as Game).getNavMesh().findPath(new Phaser.Math.Vector2(this.x, this.y), targetPoint);
        if (this._path && this._path.length > 0) {
            this._currentTarget = this._path.shift();
        }
        else this._currentTarget = null;
    }

    moveToTarget(deltaTime: number) {
        const { x, y } = this._currentTarget;

        if (x < this.x) {
            this.doMoveAnimation(true);
        }
        else {
            this.doMoveAnimation(false);
        }
        const angle = Phaser.Math.Angle.Between(this.x, this.y, x, y);
        const magnitude = this._movementSpeed * deltaTime/ 10;

        const distanceX = Math.cos(angle) * magnitude;
        const distanceY = Math.sin(angle) * magnitude;

        this.x += distanceX;
        this.y += distanceY;
    }

    // --- ATTACKED ---
    dieOrDestroy() {        
        this._owner.removeNPC(this);        
        if (this._owner.getColor() === Client.getMyColor())
            (<Hud>(this.scene.scene.get("hud"))).updatePopulation(this._owner.getNPCs().length, this._owner.getMaxPopulation());
        if (this.anims.isPlaying) {
            this.anims.stop();
        }
        this.doDeathAnimation();

        super.dieOrDestroy();
        this.destroy();
    }

    // --- Update ---
    update(time: number, deltaTime: number) {
        if (!this.body) return;

        if (this._currentTarget) {
            const { x, y } = this._currentTarget;
            const distance = Phaser.Math.Distance.Between(this.x, this.y, x, y);

            if (distance < 5) {
                if (this._path.length > 0) this._currentTarget = this._path.shift();
                else this._currentTarget = null;
            }

            if (this._currentTarget) this.moveToTarget(deltaTime);
        }
        else {
            if (!this.anims.isPlaying) {
                this.doIdleAnimation();
            }
        }
    }

    doDeathAnimation() {
        let deathSprite = this.scene.add.sprite(this.x, this.y, "death");
        deathSprite.anims.play("death");
        deathSprite.on("animationcomplete", () => {
            deathSprite.destroy();
        });
    }

    // --- Animations ---
    abstract doMoveAnimation(isLeft: boolean);
    abstract doIdleAnimation(): void;
    public playAnimation(key: string) {
        this.anims.play({ key, repeat: 0 }, true);
    }
    
}