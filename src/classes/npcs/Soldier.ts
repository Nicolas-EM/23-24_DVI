import * as Phaser from "phaser";
import AttackUnit from "./AttackUnit";
import Player from "../Player";
import NPC from "./NPC";
import Game from "../../scenes/Game";
import { Resources } from "../../utils";
import NPCsData from "../../magic_numbers/npcs_data";

export default class Soldier extends AttackUnit {
    static readonly COST: Resources = NPCsData.Soldier.SPAWNING_COST;
    static readonly SPAWN_TIME_MS: number = NPCsData.Soldier.SPAWNING_TIME;
    static readonly ICON: string = NPCsData.Soldier.ICON_INFO.name;

    constructor(scene: Game, x: number, y: number, owner: Player, frame?: string | number) {
        let iconInfo = { ...NPCsData.Soldier.ICON_INFO };
        iconInfo.name += owner.getColor();
        super(scene, x, y, iconInfo.name, owner, NPCsData.Soldier.HEALTH, NPCsData.Soldier.HEALTH, NPCsData.Soldier.SPAWNING_TIME, NPCsData.Soldier.SPAWNING_COST, NPCsData.Soldier.VISION_RANGE, NPCsData.Soldier.SPEED, iconInfo, NPCsData.Soldier.ATTACK_RANGE, NPCsData.Soldier.DAMAGE, NPCsData.Soldier.ATTACK_COOLDOWN, frame);
    }

    protected attack(attackedEntity: NPC) {
        throw new Error("Method not implemented.");
    }

    protected hit(damage: number) {
        throw new Error("Method not implemented.");
    }

    doIdleAnimation() {
        if (this.anims.isPlaying) {
            if (this.anims.currentAnim.key !== `soldierIdleRight${this._owner.getColor()}`) {
                this.anims.stop();
                this.playAnimation(`soldierIdleRight${this._owner.getColor()}`);
            }
        }
        else {
            this.playAnimation(`soldierIdleRight${this._owner.getColor()}`);
        }
        //DO NOT handle flipX here

    }

    doMoveAnimation(isLeft?: boolean) {
        if (isLeft) {
            this.flipX = true;
        }
        if (!isLeft && this.flipX) {
            this.flipX = false;
        }
        if (this.anims.isPlaying) {
            if (this.anims.currentAnim.key !== `soldierWalkRight${this._owner.getColor()}`) {
                this.anims.stop();
                this.playAnimation(`soldierWalkRight${this._owner.getColor()}`);
            }
        }
        else {

            this.playAnimation(`soldierWalkRight${this._owner.getColor()}`);
        }
    }

    doAttackAnimation(isLeft?: boolean, pointer?: Phaser.Input.Pointer) {
        if (isLeft) {
            this.flipX = true;
        } else {
            this.flipX = false;
        }

        if (pointer) {
            const { worldX, worldY } = pointer;
            const { x, y } = this;

            if (worldX < x) {
                this.playAnimation(`soldierAttackRight${this._owner.getColor()}`);
            } else if (worldX > x) {
                this.playAnimation(`soldierAttackRight${this._owner.getColor()}`);
            } else if (worldY < y) {
                this.playAnimation(`soldierAttackUp${this._owner.getColor()}`);
            } else if (worldY > y) {
                this.playAnimation(`soldierAttackDown${this._owner.getColor()}`);
            }
        }
    }
}