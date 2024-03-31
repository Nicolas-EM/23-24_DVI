import * as Phaser from "phaser";
import NPC from "./NPC";
import AttackUnit from "./AttackUnit";
import Player from "../Player";
import Game from "../../scenes/Game";
import { Resources } from "../../utils";
import NPCsData from "../../magic_numbers/npcs_data";

export default class Goblin extends AttackUnit {
    static readonly COST: Resources = NPCsData.Goblin.SPAWNING_COST;
    static readonly SPAWN_TIME_MS: number = NPCsData.Goblin.SPAWNING_TIME;
    static readonly ICON: string = NPCsData.Goblin.ICON_INFO.name;

    constructor(scene: Game, x: number, y: number, owner: Player, frame?: string | number) {
        let iconInfo = { ...NPCsData.Goblin.ICON_INFO };
        iconInfo.name += owner.getColor();
        super(scene, x, y, iconInfo.name, owner, NPCsData.Goblin.HEALTH, NPCsData.Goblin.HEALTH, NPCsData.Goblin.SPAWNING_TIME, NPCsData.Goblin.SPAWNING_COST, NPCsData.Goblin.VISION_RANGE, NPCsData.Goblin.SPEED, iconInfo, NPCsData.Goblin.ATTACK_RANGE, NPCsData.Goblin.DAMAGE, NPCsData.Goblin.ATTACK_COOLDOWN, frame);
    }

    protected attack(attackedEntity: NPC) {
        throw new Error("Method not implemented.");
    }

    protected hit(damage: number) {
        throw new Error("Method not implemented.");
    }


    doIdleAnimation() {
        if (this.anims.isPlaying) {
            if (this.anims.currentAnim.key !== `goblinIdleRight${this._owner.getColor()}`) {
                this.anims.stop();

                this.playAnimation(`goblinIdleRight${this._owner.getColor()}`);
            }
        }
        else {
            this.playAnimation(`goblinIdleRight${this._owner.getColor()}`);
        }
        //DO NOT handle flipX here
    }


    //no se me ocurrio otra manera de separar las diagonales... tal vez me venga la inspiracion 
    /**
     * me refiero, si le clicas en diagonal, coge la animacion mas cercana a la direccion de la diagonal (por ejemplo, si clicas en diagonal arriba-izquierda, coge la animacion de arriba)
     * no es super eficiente, pero por ahora sirve.
     * @param isLeft 
     * @param pointer
     */
    doAttackAnimation(isLeft?: boolean, pointer?: Phaser.Input.Pointer) {
        let color = this._owner.getColor();
        let animationKey = "";

        if (pointer) {
            let angle = Phaser.Math.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);
            let angleDeg = Phaser.Math.RadToDeg(angle);

            if (angleDeg >= -22.5 && angleDeg < 22.5) {
                animationKey = `goblinAttackRight${color}`;
                this.flipX = false;
            } else if (angleDeg >= 22.5 && angleDeg < 67.5) {
                animationKey = `goblinAttackDown${color}`;
                this.flipX = false;
            } else if (angleDeg >= 67.5 && angleDeg < 112.5) {
                animationKey = `goblinAttackDown${color}`;
                this.flipX = false;
            } else if (angleDeg >= 112.5 && angleDeg < 157.5) {
                animationKey = `goblinAttackUp${color}`;
                this.flipX = false;
            } else if (angleDeg >= 157.5 || angleDeg < -157.5) {
                animationKey = `goblinAttackUp${color}`;
                this.flipX = false;
            } else if (angleDeg >= -157.5 && angleDeg < -112.5) {
                animationKey = `goblinAttackUp${color}`;
                this.flipX = true;
            } else if (angleDeg >= -112.5 && angleDeg < -67.5) {
                animationKey = `goblinAttackRight${color}`;
                this.flipX = true;
            } else if (angleDeg >= -67.5 && angleDeg < -22.5) {
                animationKey = `goblinAttackRight${color}`;
                this.flipX = true;
            }
        } else {
            animationKey = `goblinAttackUp${color}`;
            this.flipX = false;
        }

        if (this.anims.isPlaying && this.anims.currentAnim.key !== animationKey) {
            this.anims.stop();
        }

        this.playAnimation(animationKey);
    }

    doMoveAnimation(isLeft?: boolean) {
        if (isLeft) {
            this.flipX = true;
        }
        if (!isLeft && this.flipX) {
            this.flipX = false;
        }
        if (this.anims.isPlaying) {
            if (this.anims.currentAnim.key !== `goblinWalkRight${this._owner.getColor()}`) {
                this.anims.stop();
                this.playAnimation(`goblinWalkRight${this._owner.getColor()}`);
            }
        }
        else {
            this.playAnimation(`goblinWalkRight${this._owner.getColor()}`);
        }


    }
}