import * as Phaser from "phaser";
import AttackUnit from "./AttackUnit";
import Player from "../Player";
import Game from "../../scenes/Game";
import { Resources } from "../../utils";
import NPCsData from "../../magic_numbers/npcs_data";
import PlayerEntity from "../PlayerEntity";
import Goblin from "./Goblin";


export default class Archer extends AttackUnit {

    static readonly COST: Resources = NPCsData.Archer.SPAWNING_COST;
    static readonly SPAWN_TIME_MS: number = NPCsData.Archer.SPAWNING_TIME;
    static readonly ICON: string = NPCsData.Archer.ICON_INFO.name;

    // Constructor
    constructor(scene: Game, x: number, y: number, owner: Player, frame?: string | number) {
        let iconInfo = { ...NPCsData.Archer.ICON_INFO };
        iconInfo.name += owner.getColor();
        super(scene, x, y, iconInfo.name, owner, NPCsData.Archer.HEALTH, NPCsData.Archer.HEALTH, NPCsData.Archer.SPAWNING_TIME, NPCsData.Archer.SPAWNING_COST, NPCsData.Archer.SPEED, iconInfo, NPCsData.Archer.ATTACK_RANGE, NPCsData.Archer.DAMAGE, NPCsData.Archer.BONUS_DAMAGE, NPCsData.Archer.ATTACK_COOLDOWN ,frame);
    }

    calculateDamage(target: PlayerEntity) {
        if(target instanceof Goblin){
            return this._damage * 1.5;
        }
        return this._damage;
    }

    // --- Animations ---
    doIdleAnimation(){
        this.playAnimation(`archerIdleRight${this._owner.getColor()}`);
    }

    doMoveAnimation(isLeft: boolean) {
        this.flipX = isLeft;

        if (this.anims.isPlaying) {
            if (this.anims.currentAnim.key !== `archerWalkRight${this._owner.getColor()}`) {
                this.anims.stop();
                this.playAnimation(`archerWalkRight${this._owner.getColor()}`);
            }
        }
        else {
            this.playAnimation(`archerWalkRight${this._owner.getColor()}`);
        }
    }

    doAttackAnimation(position: Phaser.Math.Vector2, isLeft: boolean) {
        let color = this._owner.getColor();
        let animationKey = "";

        let angle = Phaser.Math.Angle.Between(this.x, this.y, position.x, position.y);
        let angleDeg = Phaser.Math.RadToDeg(angle);

        if (angleDeg > -25 && angleDeg < 25) {
            // Shoot right
            animationKey = `archerShootRight${color}`;
            this.flipX = false;
        } else if (angleDeg >= 25 && angleDeg < 75) {
            // Shoot down right
            animationKey = `archerShootDiagonalDownRight${color}`;
            this.flipX = false;
        } else if (angleDeg <= -25 && angleDeg > -75) {
            // Shoot up right
            animationKey = `archerShootDiagonalUpRight${color}`;
            this.flipX = false;
        } else if (angleDeg >= 75 && angleDeg < 115) {
            // Shoot down
            animationKey = `archerShootDown${color}`;
            this.flipX = false;
        } else if (angleDeg <= -75 && angleDeg > -115) {
            // Shoot up
            animationKey = `archerShootUp${color}`;
            this.flipX = false;
        }  else if (angleDeg >= 115 && angleDeg < 165) {
            // Shoot down left
            animationKey = `archerShootDiagonalDownRight${color}`;
            this.flipX = true;
        }else if (angleDeg <= -115 && angleDeg > -165) {
            // Shoot up left
            animationKey = `archerShootDiagonalUpRight${color}`;
            this.flipX = true;
        } else {
            // Shoot left
            animationKey = `archerShootRight${color}`;
            this.flipX = true;
        }

        this.anims.pause(this.anims.currentAnim.frames[5]);
        // Create arrow and do animation:
        let arrow = this.scene.add.sprite(this.x, this.y, "Arrow", 0);
        arrow.angle = angleDeg;
        this.scene.tweens.add({
            targets: arrow,
            x: position.x,
            y: position.y,
            delay: 150,
            duration: 240,
            onComplete: () => {
                arrow.destroy();
                
            }
        });
        this.anims.resume();

        if (this.anims.isPlaying && this.anims.currentAnim.key !== animationKey) {
            this.anims.stop();
        }

        this.playAnimation(animationKey);
    }

}