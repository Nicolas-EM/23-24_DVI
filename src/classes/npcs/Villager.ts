import Client from '../../client';
import Game from '../../scenes/Game';
import { Resources } from '../../utils';
import Player from '../Player';
import NPC from './NPC';
import NPCsData from "../../magic_numbers/npcs_data";
import ResourceSpawner from '../resources/ResourceSpawner';

export default class Villager extends NPC {
    static readonly COST: Resources = NPCsData.Villager.SPAWNING_COST;
    static readonly SPAWN_TIME_MS: number = NPCsData.Villager.SPAWNING_TIME;
    private _currentAnimation: string = "idle"; static readonly ICON: string = NPCsData.Villager.ICON_INFO.name;
    private _gatherTargetId: string = undefined;
    private _lastGatherTime: number;
    private _gatherCooldown: number = NPCsData.Villager.GATHER_COOLDOWN;

    constructor(scene: Game, x: number, y: number, owner: Player, frame?: string | number) {
        let iconInfo = { ...NPCsData.Villager.ICON_INFO };
        iconInfo.name += owner.getColor();
        super(scene, x, y, iconInfo.name, owner, NPCsData.Villager.HEALTH, NPCsData.Villager.HEALTH, NPCsData.Villager.SPAWNING_TIME, NPCsData.Villager.SPAWNING_COST, NPCsData.Villager.VISION_RANGE, NPCsData.Villager.SPEED, frame);

        // Build hud info
        this._hudInfo = {
            entity: iconInfo,
            info: {
                isMine: this._owner.getColor() === Client.getMyColor(),
                health: this._health,
                totalHealth: this._totalHealth,
            },
            actions: [{ run: () => { }, actionFrame: `House_${this._owner.getColor()}` }, { run: () => { }, actionFrame: `Tower_${this._owner.getColor()}` }, { run: () => { }, actionFrame: `Hut_${this._owner.getColor()}` }] // TODO: set build functions
        };
    }

    /**
     * @param buildingId id of the building (town hall, hut, etc...)
     * @param X x coordinate of the soon-to-be built building.
     * @param Y y coordinate of the soon-to-be built building.
     */
    buildOrder(buildingId: number, X: number, Y: number) {

    }

    /**
     * @summary build order complete, spawn completed building
     * //TODO
     */
    build() {

    }

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

    doBuildAnimation(isLeft?: boolean) {
        if (isLeft) {
            this.flipX = true;
        }
        if (!isLeft && this.flipX) {
            this.flipX = false;
        }
        if (this.anims.isPlaying) {
            if (this.anims.currentAnim.key !== `villagerHammer${this._owner.getColor()}`) {
                this.anims.stop();

                this.playAnimation(`villagerHammer${this._owner.getColor()}`);
            }
        }
        else {
            this.playAnimation(`villagerHammer${this._owner.getColor()}`);

        }

    }

    // doLiftAnimation(){
    //     if(this.anims.isPlaying){
    //         if(this.anims.currentAnim.key !== `villagerLift${this._owner.getColor()}`){
    //             this.anims.stop();
    //         }
    //     }
    //     this.playAnimation(`villagerLift${this._owner.getColor()}`);
    // }

    setGatherTarget(resourceSpawner: ResourceSpawner) {
        this._gatherTargetId = resourceSpawner.getId();
        if(this._gatherTargetId){
            this.setMovementTarget(new Phaser.Math.Vector2(resourceSpawner.x, resourceSpawner.y));
        }
    }

    private isGatherTargetInRange(gatherTarget: ResourceSpawner): boolean {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, gatherTarget.x, gatherTarget.y);
        return distance <= 64;  // Within 1 tile
    }

    setMovementTarget(targetPoint: Phaser.Math.Vector2): void {
        if(this._gatherTargetId) {
            const target = (this.scene as Game).getResourceSpawnerById(this._gatherTargetId);
            if(target && Phaser.Math.Distance.Between(targetPoint.x, targetPoint.y, target.x, target.y) > 64) { // TODO: magic number - tile size
                this._gatherTargetId = undefined;
            }
        }

        super.setMovementTarget(targetPoint);
    }

    update(time: number, delta: number) {
        if(this._gatherTargetId) {
            const gatherTarget = (this.scene as Game).getResourceSpawnerById(this._gatherTargetId);

            if (gatherTarget && this.isGatherTargetInRange(gatherTarget)) {
                // Within range - stop moving
                if(this._path || this._currentTarget) { 
                    this._path = [];
                    this._currentTarget = undefined;
                }
    
                // TODO: Check if resource still has resource
                if(gatherTarget) {
                    // Check if enough time has passed since the last attack or if have never attacked
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
}