import * as Phaser from "phaser";
import AttackUnit from "./AttackUnit";
import Player from "../Player";
import NPC from "./NPC";
import Game from "../../scenes/Game";
import { Resources } from "../../utils";
import NPCsData from "../../magic_numbers/npcs_data";
import PlayerEntity from "../PlayerEntity";
import Archer from "./Archer";

export default class Soldier extends AttackUnit {
    static readonly COST: Resources = NPCsData.Soldier.SPAWNING_COST;
    static readonly SPAWN_TIME_MS: number = NPCsData.Soldier.SPAWNING_TIME;
    static readonly ICON: string = NPCsData.Soldier.ICON_INFO.name;

    constructor(scene: Game, x: number, y: number, owner: Player, frame?: string | number) {
        let iconInfo = { ...NPCsData.Soldier.ICON_INFO };
        iconInfo.name += owner.getColor();
        super(scene, x, y, iconInfo.name, owner, NPCsData.Soldier.HEALTH, NPCsData.Soldier.HEALTH, NPCsData.Soldier.SPAWNING_TIME, NPCsData.Soldier.SPAWNING_COST, NPCsData.Soldier.VISION_RANGE, NPCsData.Soldier.SPEED, iconInfo, NPCsData.Soldier.ATTACK_RANGE, NPCsData.Soldier.DAMAGE,  NPCsData.Soldier.BONUS_DAMAGE, NPCsData.Soldier.ATTACK_COOLDOWN, frame);
    }

    protected attack(attackedEntity: NPC) {
        throw new Error("Method not implemented.");
    }

    protected hit(damage: number) {
        throw new Error("Method not implemented.");
    }

    doIdleAnimation() {
        this.playAnimation(`soldierIdleRight${this._owner.getColor()}`);
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

    doAttackAnimation(position: Phaser.Math.Vector2, isLeft: boolean) {
        if (isLeft) {
            this.flipX = true;
        } else {
            this.flipX = false;
        }

        let animationKey = "";

        let angle = Phaser.Math.Angle.Between(this.x, this.y, position.x, position.y);
        let angleDeg = Phaser.Math.RadToDeg(angle);

        if (angleDeg >= -45 && angleDeg < 45) {
            // Attack right
            animationKey = `soldierAttackRight${this._owner.getColor()}`;
            this.flipX = false;
        } else if (angleDeg >= 45 && angleDeg < 135) {
            // Attack down
            animationKey = `soldierAttackDown${this._owner.getColor()}`;
            this.flipX = false;
        } else if (angleDeg <= -45 && angleDeg > -135) {
            // Attack up
            animationKey = `soldierAttackUp${this._owner.getColor()}`;
            this.flipX = false;
        } else {
            // Attack left
            animationKey = `soldierAttackRight${this._owner.getColor()}`;
            this.flipX = true;
        }

        if (this.anims.isPlaying && this.anims.currentAnim.key !== animationKey) {
            this.anims.stop();
        }

        this.playAnimation(animationKey);
    }

    calculateDamage(target: PlayerEntity) {
        if(target instanceof Archer){
            return this._damage * 1.5;
        }
        return this._damage;
    }
}