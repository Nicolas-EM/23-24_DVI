import Client from "../../client";
import { Resources } from "../../utils";
import Player from "../Player";
import Goblin from "../npcs/Goblin";
import SpawnerBuilding from "./SpawnerBuilding";
import BuildingsData from "../../magic_numbers/buildings_data";

export default class GoblinHut extends SpawnerBuilding {

    static readonly COST: Resources = BuildingsData.Hut.SPAWNING_COST;

    constructor(scene: Phaser.Scene, x: number, y: number, owner: Player, frame?: string | number) {
        let iconInfo = { ...BuildingsData.Hut.ICON_INFO };
        iconInfo.name += owner.getColor();
        super(scene, x, y, iconInfo.name, owner, BuildingsData.Hut.HEALTH, BuildingsData.Hut.HEALTH, BuildingsData.Hut.SPAWNING_TIME, BuildingsData.Hut.SPAWNING_COST, BuildingsData.Hut.VISION_RANGE, frame);
        
        // Build hud info
        this._hudInfo = {
            entity: iconInfo,
            info: {
                isMine: this._owner.getColor() === Client.getMyColor(),
                health: this._health,
                totalHealth: this._totalHealth,
                queueIcon: null,
                queueTime: null
            },
            actions: [{run: () => this.queueNPC(Goblin), actionFrame: `Goblin_${this._owner.getColor()}`}]
        };
    
    }

}