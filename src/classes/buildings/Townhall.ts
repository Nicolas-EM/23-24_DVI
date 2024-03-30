import Client from "../../client";
import Game from "../../scenes/Game";
import { HudInfo, Resources } from "../../utils";
import Villager from "../npcs/Villager";
import Player from "../Player";
import NPCSpawner from "./SpawnerBuilding";
import BuildingsData from "../../magic_numbers/buildings_data";


export default class Townhall extends NPCSpawner {
    
    static readonly COST: Resources = null;

    constructor(scene: Game, x: number, y: number, owner: Player, frame?: string | number) {
        let iconInfo = { ...BuildingsData.Townhall.ICON_INFO };
        iconInfo.name += owner.getColor();
        super(scene, x, y, iconInfo.name, owner, BuildingsData.Townhall.HEALTH, BuildingsData.Townhall.HEALTH, null, null, BuildingsData.Townhall.VISION_RANGE, iconInfo, frame);
    }

    _hudInfo: HudInfo = {
        entity: this._iconInfo,
        info: {
            isMine: this._owner.getColor() === Client.getMyColor(),
            health: this._health,
            totalHealth: this._totalHealth
        },
        actions: [{run: () => this.queueNPC(Villager), actionFrame: `Villager_${this._owner.getColor()}`}]
    };
    
}