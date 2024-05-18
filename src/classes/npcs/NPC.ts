import * as Phaser from 'phaser';
import Player from '../Player'
import PlayerEntity from '../PlayerEntity';
import Game from '../../scenes/Game';
import { Resources } from '../../utils';
import Hud from '../../scenes/Hud';
import Client from '../../client';
import Building from '../buildings/Building';

export default abstract class NPC extends PlayerEntity {

    // Attributes
    protected _path: Phaser.Math.Vector2[];
    protected _currentTarget: Phaser.Math.Vector2;
    protected _movementSpeed: number;
    protected _spawningTime: number;
    protected _spawningCost: Resources;
    protected _isProcessingCollision: boolean = false;

    // Constructor
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, owner: Player, health: number, totalHealth: number, spawningTime: number, spawningCost: Resources, movementSpeed: number, frame?: string | number) {
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

        (<Game>(this.scene)).getNPCGroup().add(this);
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
    getMovementSpeed(): number {
        return this._movementSpeed;
    }

    getMovementTarget(): Phaser.Math.Vector2 {
        return this._currentTarget;
    }

    setMovementTarget(targetPoint: Phaser.Math.Vector2): void {
        if (Phaser.Math.Distance.Between(this.x, this.y, targetPoint.x, targetPoint.y) <= 5) {
            this._currentTarget = undefined;
            return;
        }

        // Find a path to the target
        this._path = (this.scene as Game).getNavMesh().findPath(new Phaser.Math.Vector2(this.x, this.y), targetPoint);
        if (this._path && this._path.length > 0) {
            this._currentTarget = this._path.shift();
        }
        else this._currentTarget = undefined;
    }

    moveToTarget(elapsedSeconds: number) {
        const { x, y } = this._currentTarget;

        if (x < this.x) {
            this.doMoveAnimation(true);
        }
        else {
            this.doMoveAnimation(false);
        }

        const angle = Phaser.Math.Angle.Between(this.x, this.y, x, y);
        const magnitude = (this._movementSpeed / 64) / elapsedSeconds;

        const velocityX = Math.cos(angle) * magnitude;
        const velocityY = Math.sin(angle) * magnitude;

        this.x += velocityX;
        this.y += velocityY;
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

            if (this._currentTarget) this.moveToTarget(deltaTime / 1000);
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

    // --- COLLISION ---
    collide(entity: PlayerEntity) {
        if (!this._isProcessingCollision) {
            this.setProcessingCollision(true);
            this.handleCollision(entity);
        }
    }

    protected abstract handleCollision(entity: PlayerEntity);

    protected calculateAvoidTime(entity: PlayerEntity, newTarget: Phaser.Math.Vector2): number {
        // Start avoidance
        this.setMovementTarget(newTarget);

        // Calculate time to avoid entity
        let npcPosition = new Phaser.Math.Vector2(this.x, this.y);
        let dist = Math.abs(npcPosition.distance(newTarget));
        let avoidTime = (dist / (this.getMovementSpeed() * 64)) * 1000;

        return avoidTime;
    }

    // Calculate new target to avoid a PlayerEntity
    protected calculateNewTarget(collider: PlayerEntity, oldTarget: Phaser.Math.Vector2): Phaser.Math.Vector2 {
        const npcPhysicsBody = (this.body as Phaser.Physics.Arcade.Body);
        const colliderPhysicsBody = (collider.body as Phaser.Physics.Arcade.Body);

        // STEP 1: From which side did the NPC collide?
        let side = "";
        let diffX = Math.ceil(Math.abs(this.x - collider.x));
        let diffY = Math.ceil(Math.abs(this.y - collider.y));
        // Left or right
        if (diffX >= npcPhysicsBody.width / 2 + colliderPhysicsBody.width / 2) {
            if (this.x < collider.x) { side = "LEFT"; }
            else { side = "RIGHT"; }
        }
        // Up or down
        else {
            if (this.y < collider.y) { side = "UP"; }
            else { side = "DOWN"; }
        }

        // STEP 2: New direction?
        let alpha = undefined;
        if (side == "LEFT" || side == "RIGHT") {
            if (this.y > oldTarget.y) { alpha = -1; }  // Go up
            else { alpha = 1; }  // Go down
        }
        else {
            if (this.x > oldTarget.x) { alpha = -1; }  // Go left
            else { alpha = 1; }  // Go right
        }

        // STEP 3: How much distance?
        let newX = this.x;
        let newY = this.y;
        if (side == "LEFT" || side == "RIGHT") {
            if (this.y < collider.y) { newY += alpha * (colliderPhysicsBody.height / 2 + alpha * diffY + npcPhysicsBody.height + 10) }  // 10px extra just in case
            else { newY += alpha * (colliderPhysicsBody.height / 2 - alpha * diffY + npcPhysicsBody.height + 10) }  // 10px extra just in case
        }
        else {
            if (this.x < collider.x) { newX += alpha * (colliderPhysicsBody.width / 2 + alpha * diffX + npcPhysicsBody.width + 10) }  // 10px extra just in case
            else { newX += alpha * (colliderPhysicsBody.width / 2 - alpha * diffX + npcPhysicsBody.width + 10) }  // 10px extra just in case
        }

        return new Phaser.Math.Vector2(newX, newY);
    }

    getProcessingCollision(): boolean {
        return this._isProcessingCollision;
    }

    setProcessingCollision(collisionProcessed: boolean) {
        this._isProcessingCollision = collisionProcessed;
    }
}