import Client from '../../client';
import Game from '../../scenes/Game';
import { Resources } from '../../utils';
import Player from '../Player';
import NPC from './NPC';
import NPCsData from "../../magic_numbers/npcs_data";
import ResourceSpawner from '../resources/ResourceSpawner';
import PlayerEntity from '../PlayerEntity';

export default class Villager extends NPC {

    static readonly COST: Resources = NPCsData.Villager.SPAWNING_COST;
    static readonly SPAWN_TIME_MS: number = NPCsData.Villager.SPAWNING_TIME;
    static readonly ICON: string = NPCsData.Villager.ICON_INFO.name;

    // Attributes
    private _gatherTargetId: string = undefined;
    private _lastGatherTime: number;
    private _gatherCooldown: number = NPCsData.Villager.GATHER_COOLDOWN;

    // Constructor
    constructor(scene: Game, x: number, y: number, owner: Player, frame?: string | number) {
        let iconInfo = { ...NPCsData.Villager.ICON_INFO };
        iconInfo.name += owner.getColor();
        super(scene, x, y, iconInfo.name, owner, NPCsData.Villager.HEALTH, NPCsData.Villager.HEALTH, NPCsData.Villager.SPAWNING_TIME, NPCsData.Villager.SPAWNING_COST, NPCsData.Villager.SPEED, frame);

        this._hudInfo = {
            entity: iconInfo,
            info: {
                isMine: this._owner.getColor() === Client.getMyColor(),
                health: this._health,
                totalHealth: this._totalHealth,
            },
            actions: []
        };
    }


    // --- Animations ---
    doIdleAnimation() {
        if (this.anims.isPlaying) {
            if (this.anims.currentAnim.key !== `villagerIdle${this._owner.getColor()}`) {
                this.anims.stop();
                this.playAnimation(`villagerIdle${this._owner.getColor()}`);
            }
        }
        else {
            this.playAnimation(`villagerIdle${this._owner.getColor()}`);
        }

    }

    doMoveAnimation(isLeft?: boolean) {
        if (isLeft) {
            this.flipX = true;
        }
        if (!isLeft && this.flipX) {
            this.flipX = false;
        }
        if (this.anims.isPlaying) {
            if (this.anims.currentAnim.key !== `villagerWalk${this._owner.getColor()}`) {
                this.anims.stop();
                this.playAnimation(`villagerWalk${this._owner.getColor()}`);
            }
        }
        else {
            this.playAnimation(`villagerWalk${this._owner.getColor()}`);
        }

    }

    private doGatherAnimation(isLeft?: boolean) {
        if (isLeft) {
            this.flipX = true;
        }
        if (!isLeft && this.flipX) {
            this.flipX = false;
        }
        if (this.anims.isPlaying) {
            if (this.anims.currentAnim.key !== `villagerAxe${this._owner.getColor()}`) {
                this.anims.stop();
                this.playAnimation(`villagerAxe${this._owner.getColor()}`);
            }
        }
        else {
            this.playAnimation(`villagerAxe${this._owner.getColor()}`);
        }
    }

    // --- Movement ---
    getGatherTarget(): string {
        return this._gatherTargetId;
    }

    setGatherTarget(resourceSpawner: ResourceSpawner) {
        if (resourceSpawner)
            this._gatherTargetId = resourceSpawner.getId();
        else
            this._gatherTargetId = undefined;
        if (this._gatherTargetId)
            this.setMovementTarget(new Phaser.Math.Vector2(resourceSpawner.x, resourceSpawner.y));
    }

    private isGatherTargetInRange(gatherTarget: ResourceSpawner): boolean {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, gatherTarget.x, gatherTarget.y);
        return distance <= 64;  // Within 1 tile
    }

    setMovementTarget(targetPoint: Phaser.Math.Vector2): void {
        if (this._gatherTargetId) {
            const target = (this.scene as Game).getResourceSpawnerById(this._gatherTargetId);
            if (target && Phaser.Math.Distance.Between(targetPoint.x, targetPoint.y, target.x, target.y) > 64) {
                this._gatherTargetId = undefined;
            }
        }

        super.setMovementTarget(targetPoint);
    }

    // --- Update ---
    update(time: number, delta: number) {
        if (this._gatherTargetId) {
            const gatherTarget = (this.scene as Game).getResourceSpawnerById(this._gatherTargetId);

            if (gatherTarget && this.isGatherTargetInRange(gatherTarget)) {
                // Within range - stop moving
                if (this._path || this._currentTarget) {
                    this._path = [];
                    this._currentTarget = undefined;
                }

                if (gatherTarget) {
                    // Check if enough time has passed since the last gathering or if have never gathered
                    const timeSinceLastAttack = (time - this._lastGatherTime) / 1000;   // in seconds
                    if (this._lastGatherTime === undefined || timeSinceLastAttack >= this._gatherCooldown) {
                        this.doGatherAnimation(this.x >= gatherTarget.x);
                        gatherTarget.gather(this._owner);
                        // Update last gather time
                        this._lastGatherTime = time;
                    }
                } else {
                    this._gatherTargetId = undefined;
                }
            }
        }

        super.update(time, delta);
    }

    // --- COLLISION ---
    protected handleCollision(entity: PlayerEntity) {
        // Save old movement target
        let oldTarget = this.getMovementTarget();
        if (!oldTarget) return; // If not moving do nothing

        // Save old gather target
        let oldGatherTarget = this.getGatherTarget();
        if (oldGatherTarget) {
            this.setGatherTarget(undefined);
        }

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
                    this.setGatherTarget((this.scene as Game).getResourceSpawnerById(oldGatherTarget));
                }
            },
            callbackScope: this
        });
    }
}