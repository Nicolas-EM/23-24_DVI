import * as Phaser from "phaser";
import NPC from "./NPC";
import AttackUnit from "./AttackUnit";
import Player from "../Player";
import Game from "../../scenes/Game";
import { Resources } from "../../utils";
import NPCsData from "../../magic_numbers/npcs_data";

export default class Archer extends AttackUnit {
    static readonly COST: Resources = NPCsData.Archer.SPAWNING_COST;
    static readonly SPAWN_TIME_MS: number = NPCsData.Archer.SPAWNING_TIME;
    static readonly ICON: string = NPCsData.Archer.ICON_INFO.name;

    constructor(scene: Game, x: number, y: number, owner: Player, frame?: string | number) {
        let iconInfo = { ...NPCsData.Archer.ICON_INFO };
        iconInfo.name += owner.getColor();
        super(scene, x, y, iconInfo.name, owner, NPCsData.Archer.HEALTH, NPCsData.Archer.HEALTH, NPCsData.Archer.SPAWNING_TIME, NPCsData.Archer.SPAWNING_COST, NPCsData.Archer.VISION_RANGE, NPCsData.Archer.SPEED, iconInfo, NPCsData.Archer.ATTACK_RANGE, NPCsData.Archer.DAMAGE, NPCsData.Archer.ATTACK_COOLDOWN ,frame);
    }

    protected attack(attackedEntity: NPC) {
        throw new Error("Method not implemented.");
    }
    
    protected hit(damage: number) {
        throw new Error("Method not implemented.");
    }

    doIdleAnimation(){
        if(this.anims.isPlaying){
            if(this.anims.currentAnim.key !== `archerIdleRight${this._owner.getColor()}`){
                this.anims.stop();
            }
        }
        //DO NOT handle flipX here
        this.playAnimation(`archerIdleRight${this._owner.getColor()}`);
    }
    doMoveAnimation(isLeft?: boolean) {
        if(this.anims.isPlaying){
            if(this.anims.currentAnim.key !== `archerWalkRight${this._owner.getColor()}`){
                this.anims.stop();
            }
        }
        if(isLeft){
            this.flipX = true;
        }
        if(!isLeft && this.flipX){
            this.flipX = false;
        }
        this.playAnimation(`archerWalkRight${this._owner.getColor()}`);
    }

    //me vine muy arriba con esta, cuidado
    doAttackAnimation(isLeft?: boolean, pointer?: Phaser.Input.Pointer) {
        let color = this._owner.getColor();
        let animationKey = "";

        if (pointer) {
            let angle = Phaser.Math.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);
            let angleDeg = Phaser.Math.RadToDeg(angle);

            if (angleDeg >= -22.5 && angleDeg < 22.5) {
                animationKey = `archerShootRight${color}`;
                this.flipX = false;
            } else if (angleDeg >= 22.5 && angleDeg < 67.5) {
                animationKey = `archerShootDiagonalDownRight${color}`;
                this.flipX = false;
            } else if (angleDeg >= 67.5 && angleDeg < 112.5) {
                animationKey = `archerShootDown${color}`;
                this.flipX = false;
            } else if (angleDeg >= 112.5 && angleDeg < 157.5) {
                animationKey = `archerShootDiagonalUpRight${color}`;
                this.flipX = false;
            } else if (angleDeg >= 157.5 || angleDeg < -157.5) {
                animationKey = `archerShootUp${color}`;
                this.flipX = false;
            } else if (angleDeg >= -157.5 && angleDeg < -112.5) {
                animationKey = `archerShootDiagonalUpRight${color}`;
                this.flipX = true;
            } else if (angleDeg >= -112.5 && angleDeg < -67.5) {
                animationKey = `archerShootRight${color}`;
                this.flipX = true;
            } else if (angleDeg >= -67.5 && angleDeg < -22.5) {
                animationKey = `archerShootDiagonalDownRight${color}`;
                this.flipX = true;
            }
        } else {
            animationKey = `archerShootUp${color}`;
            this.flipX = false;
        }

        if (this.anims.isPlaying && this.anims.currentAnim.key !== animationKey) {
            this.anims.stop();
        }

        this.playAnimation(animationKey);
    }

}