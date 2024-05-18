import NPC from './NPC';
import Player from '../Player';
import Game from '../../scenes/Game';
import { IconInfo, Resources } from '../../utils';
import Client from '../../client';
import PlayerEntity from '../PlayerEntity';


export default abstract class AttackUnit extends NPC {

    // Attributes
    protected _attackRange: number;
    protected _damage: number;
    protected bonus_damage: number;
    protected _attackTargetId: string;
    protected _lastAttackTime: number;
    protected _attackCooldown: number;

    // Constructor
    constructor(scene: Game, x: number, y: number, texture: string | Phaser.Textures.Texture, owner: Player, health: number, totalHealth: number, spawningTime: number, spawningCost: Resources, movementSpeed: number, iconInfo: IconInfo, attackRange: number, damage: number, bonus_damage: number, attackCooldown: number, frame?: string | number) {
        super(scene, x, y, texture, owner, health, totalHealth, spawningTime, spawningCost, movementSpeed, frame);

        this._attackRange = attackRange;
        this._damage = damage;
        this.bonus_damage = bonus_damage;
        this._attackCooldown = attackCooldown;

        this._hudInfo = {
            entity: iconInfo,
            info: {
                isMine: this._owner.getColor() === Client.getMyColor(),
                health: this._health,
                totalHealth: this._totalHealth,
                damage: this._damage
            },
            actions: []
        }
    }

    // --- Attack ---
    abstract doAttackAnimation(position: Phaser.Math.Vector2, isLeft: boolean): void;
    abstract calculateDamage(target: PlayerEntity): number;
    
    getAttackTarget(): string {
        return this._attackTargetId;
    }

    setAttackTarget(entityId: string) {
        this._attackTargetId = entityId;
    }

    private entityIsWithinRange(entity: PlayerEntity): boolean {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, entity.x, entity.y);
        return distance <= this._attackRange * 64;
    }

    onAttackReceived(damage: number, attackUnit: AttackUnit): void {
        super.onAttackReceived(damage, attackUnit);

        if (!this._attackTargetId) {
            this.setAttackTarget(attackUnit.getId());
        }
    }

    setMovementTarget(targetPoint: Phaser.Math.Vector2): void {
        if (this._attackTargetId) {
            const target = (this.scene as Game).getEntityById(this._attackTargetId);
            if (target && Phaser.Math.Distance.Between(targetPoint.x, targetPoint.y, target.x, target.y) > 64) {
                this._attackTargetId = undefined;
            }
        }

        super.setMovementTarget(targetPoint);
    }

    // --- Update ---
    update(time: number, delta: number) {
        if (this._attackTargetId) {
            const target = (this.scene as Game).getEntityById(this._attackTargetId);
            
            if (target && !this.entityIsWithinRange(target)) {
                // Not within range - move towards target
                this.setMovementTarget(new Phaser.Math.Vector2(target.x, target.y));
            } 
            else {
                // Within range - stop moving
                if(this._path || this._currentTarget) { 
                    this._path = [];
                    this._currentTarget = undefined;
                }

                // If target still alive
                if (target) {
                    // Check if enough time has passed since the last attack or if have never attacked
                    const timeSinceLastAttack = (time - this._lastAttackTime) / 1000;   // in seconds
                    if (this._lastAttackTime === undefined || timeSinceLastAttack >= this._attackCooldown) {
                        this.scene.events.emit("attackEvent");
                        this.doAttackAnimation(new Phaser.Math.Vector2(target.x, target.y), (this.x >= target.x));
                        let damage = this.calculateDamage(target);
                        setTimeout(() => {
                            target.onAttackReceived(damage, this);
                        }, 500);
                        // Update last attack time
                        this._lastAttackTime = time;
                    }
                } else {
                    this._attackTargetId = undefined;
                }
            }
        }

        super.update(time, delta);
    }
    
    // --- COLLISION ---
    collide(entity: PlayerEntity) {
        // Do not attack if colliding with attack target
        if(entity.getId() !== this.getAttackTarget()) {
           super.collide(entity); 
        }
    }

    protected handleCollision(entity: PlayerEntity) {
        // Save old movement target
        let oldTarget = this.getMovementTarget();
        if (!oldTarget) return; // If not moving do nothing

        // Save old Attack Target
        let oldAttackTarget = this.getAttackTarget();
        if(oldAttackTarget)
            this.setAttackTarget(undefined);

        // Calculate new target
        let newTarget = this.calculateNewTarget(entity, this.getMovementTarget());
        const avoidTime = this.calculateAvoidTime(entity, newTarget);

        // Wait and return to original target
        this.scene.time.addEvent({
            delay: avoidTime,
            callback: () => {
                this.setProcessingCollision(false);
                
                // Don't reset if target has changed by more than 1 tile
                if(this.getMovementTarget() && Math.abs(newTarget.distance(this.getMovementTarget())) < 64) {
                    this.setMovementTarget(new Phaser.Math.Vector2(oldTarget.x, oldTarget.y));
                    this.setAttackTarget(oldAttackTarget);
                }
            },
            callbackScope: this
        });
    }
}