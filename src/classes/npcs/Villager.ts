import Client from '../../client';
import Game from '../../scenes/Game';
import { HudInfo, Resources } from '../../utils';
import Player from '../Player';
import NPC from './NPC';
import NPCsData from "../../magic_numbers/npcs_data";

export default class Villager extends NPC {
    static readonly COST: Resources = NPCsData.Villager.SPAWNING_COST;
    static readonly SPAWN_TIME_MS: number = NPCsData.Villager.SPAWNING_TIME;

    constructor(scene: Game, x: number, y: number, owner: Player, frame?: string | number) {
        let iconInfo = { ...NPCsData.Villager.ICON_INFO };
        iconInfo.name += owner.getColor();
        super(scene, x, y, iconInfo.name, owner, NPCsData.Villager.HEALTH, NPCsData.Villager.HEALTH, NPCsData.Villager.SPAWNING_TIME, NPCsData.Villager.SPAWNING_COST, NPCsData.Villager.VISION_RANGE, NPCsData.Villager.SPEED, iconInfo, frame);
    }

    _hudInfo: HudInfo = {
        entity: this._iconInfo,
        info: {
            isMine: this._owner.getColor() === Client.getMyColor(),
            health: this._health,
            totalHealth: this._totalHealth,
        },
        actions: [{run: () => {}, actionFrame: `House_${this._owner.getColor()}`}, {run: () => {}, actionFrame: `Tower_${this._owner.getColor()}`}, {run: () => {}, actionFrame: `Hut_${this._owner.getColor()}`}] // TODO: set build functions
    };

    /**
     * @param buildingId id of the building (town hall, hut, etc...)
     * @param X x coordinate of the soon-to-be built building.
     * @param Y y coordinate of the soon-to-be built building.
     */
    buildOrder(buildingId: number,X: number, Y: number){

    }

    /**
     * @summary build order complete, spawn completed building
     * //TODO
     */
    build(){

    }
    
    gather(){

    }
    
}