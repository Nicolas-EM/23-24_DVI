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

    constructor(scene: Game, x: number, y: number, owner: Player, frame?: string | number) {
        let iconInfo = { ...NPCsData.Archer.ICON_INFO };
        iconInfo.name += owner.getColor();
        super(scene, x, y, iconInfo.name, owner, NPCsData.Archer.HEALTH, NPCsData.Archer.HEALTH, NPCsData.Archer.SPAWNING_TIME, NPCsData.Archer.SPAWNING_COST, NPCsData.Archer.VISION_RANGE, NPCsData.Archer.SPEED, iconInfo, NPCsData.Archer.ATTACK_RANGE, NPCsData.Archer.DAMAGE, frame);
    }

    protected attack(attackedEntity: NPC) {
        throw new Error("Method not implemented.");
    }
    
    protected hit(damage: number) {
        throw new Error("Method not implemented.");
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

}