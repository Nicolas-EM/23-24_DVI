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
        super(scene, x, y, iconInfo.name, owner, NPCsData.Soldier.HEALTH, NPCsData.Soldier.HEALTH, NPCsData.Soldier.SPAWNING_TIME, NPCsData.Soldier.SPAWNING_COST, NPCsData.Soldier.VISION_RANGE, NPCsData.Soldier.SPEED, iconInfo, NPCsData.Soldier.ATTACK_RANGE, NPCsData.Soldier.DAMAGE, NPCsData.Soldier.ATTACK_COOLDOWN,frame);
    }

    protected attack(attackedEntity: NPC) {
        throw new Error("Method not implemented.");
    }
    
    protected hit(damage: number) {
        throw new Error("Method not implemented.");
    }

}