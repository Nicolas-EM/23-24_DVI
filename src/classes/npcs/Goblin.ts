import * as Phaser from "phaser";
import NPC from "./NPC";
import AttackUnit from "./AttackUnit";
import Player from "../Player";
import Game from "../../scenes/Game";
import { Resources } from "../../utils";
import NPCsData from "../../magic_numbers/npcs_data";
import PlayerEntity from "../PlayerEntity";
import Soldier from "./Soldier";

export default class Goblin extends AttackUnit {
    static readonly COST: Resources = NPCsData.Goblin.SPAWNING_COST;
    static readonly SPAWN_TIME_MS: number = NPCsData.Goblin.SPAWNING_TIME;
    static readonly ICON: string = NPCsData.Goblin.ICON_INFO.name;

    constructor(scene: Game, x: number, y: number, owner: Player, frame?: string | number) {
        let iconInfo = { ...NPCsData.Goblin.ICON_INFO };
        iconInfo.name += owner.getColor();
        super(scene, x, y, iconInfo.name, owner, NPCsData.Goblin.HEALTH, NPCsData.Goblin.HEALTH, NPCsData.Goblin.SPAWNING_TIME, NPCsData.Goblin.SPAWNING_COST, NPCsData.Goblin.SPEED, iconInfo, NPCsData.Goblin.ATTACK_RANGE, NPCsData.Goblin.DAMAGE, NPCsData.Goblin.BONUS_DAMAGE, NPCsData.Goblin.ATTACK_COOLDOWN, frame);
    }

    protected attack(attackedEntity: NPC) {
        throw new Error("Method not implemented.");
    }

    protected hit(damage: number) {
        throw new Error("Method not implemented.");
    }


    doIdleAnimation() {
        this.playAnimation(`goblinIdleRight${this._owner.getColor()}`);
    }


    //no se me ocurrio otra manera de separar las diagonales... tal vez me venga la inspiracion 
    /**
     * me refiero, si le clicas en diagonal, coge la animacion mas cercana 
     * a la direccion de la diagonal 
     * (por ejemplo, si clicas en diagonal arriba-izquierda, coge la animacion de arriba)
     * no es super eficiente, pero por ahora sirve.
     * @param isLeft 
     * @param pointer
     */
    doAttackAnimation(position: Phaser.Math.Vector2, isLeft: boolean) {
        let color = this._owner.getColor();
        let animationKey = "";

        let angle = Phaser.Math.Angle.Between(this.x, this.y, position.x, position.y);
        let angleDeg = Phaser.Math.RadToDeg(angle);

        if (angleDeg >= -45 && angleDeg < 45) {
            // Attack right
            animationKey = `goblinAttackRight${color}`;
            this.flipX = false;
        } else if (angleDeg >= 45 && angleDeg < 135) {
            // Attack down
            animationKey = `goblinAttackDown${color}`;
            this.flipX = false;
        } else if (angleDeg <= -45 && angleDeg > -135) {
            // Attack up
            animationKey = `goblinAttackUp${color}`;
            this.flipX = false;
        } else {
            // Attack left
            animationKey = `goblinAttackRight${color}`;
            this.flipX = true;
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

    calculateDamage(target: PlayerEntity) {
        if(target instanceof Soldier){
            return this._damage * 1.5;
        }
        return this._damage;
    }
}