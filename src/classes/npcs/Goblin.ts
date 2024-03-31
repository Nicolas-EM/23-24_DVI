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
        super(scene, x, y, iconInfo.name, owner, NPCsData.Goblin.HEALTH, NPCsData.Goblin.HEALTH, NPCsData.Goblin.SPAWNING_TIME, NPCsData.Goblin.SPAWNING_COST, NPCsData.Goblin.VISION_RANGE, NPCsData.Goblin.SPEED, iconInfo, NPCsData.Goblin.ATTACK_RANGE, NPCsData.Goblin.DAMAGE, NPCsData.Goblin.ATTACK_COOLDOWN,frame);
    }

    protected attack(attackedEntity: NPC) {
        throw new Error("Method not implemented.");
    }
    
    protected hit(damage: number) {
        throw new Error("Method not implemented.");
    }
}