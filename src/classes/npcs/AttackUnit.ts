import NPC from './NPC';
import Player from '../Player';
import Game from '../../scenes/Game';
import { IconInfo, Resources } from '../../utils';
import Client from '../../client';
import PlayerEntity from '../PlayerEntity';

export default abstract class AttackUnit extends NPC {
    protected _attackRange: number;
    protected _damage: number;
    protected bonus_damage: number;
    protected _attackTargetId: string;
    protected _lastAttackTime: number;
    protected _attackCooldown: number;

    /**
     * @summary constructor for attacking class (must have offensive abilities)
     * @returns instance of attackUnit
     */
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
        if(this._attackTargetId) {
            const target = (this.scene as Game).getEntityById(this._attackTargetId);
            if(target && Phaser.Math.Distance.Between(targetPoint.x, targetPoint.y, target.x, target.y) > 64) { // TODO: magic number - tile size
                this._attackTargetId = undefined;
            }
        }

        super.setMovementTarget(targetPoint);
    }

    update(time: number, delta: number) {
        if (this._attackTargetId) {
            const target = (this.scene as Game).getEntityById(this._attackTargetId);

            if (target && !this.entityIsWithinRange(target)) {
                // Not within range - move towards target
                this.setMovementTarget(new Phaser.Math.Vector2(target.x, target.y));
                // Client.setNpcTarget(this._id, new Phaser.Math.Vector2(target.x, target.y));
            } else {
                // Within range - stop moving
                if(this._path || this._currentTarget) { 
                    this._path = [];
                    this._currentTarget = undefined;
                }
                // Client.setNpcTarget(this._id, new Phaser.Math.Vector2(this.x, this.y));

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
    
    abstract doAttackAnimation(position: Phaser.Math.Vector2, isLeft: boolean): void;

    abstract calculateDamage(target: PlayerEntity): number;
}