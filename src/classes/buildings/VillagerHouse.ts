import Client from "../../client";
import Player from "../Player";
import Building from "./Building";
import BuildingsData from "../../magic_numbers/buildings_data";

export default class VillagerHouse extends Building {
    
    constructor(scene: Phaser.Scene, x: number, y: number, owner: Player, frame?: string | number) {
        let iconInfo = { ...BuildingsData.VillagerHouse.ICON_INFO };
        iconInfo.name += owner.getColor();
        super(scene, x, y, iconInfo.name, owner, BuildingsData.VillagerHouse.HEALTH, BuildingsData.VillagerHouse.HEALTH, BuildingsData.VillagerHouse.SPAWNING_TIME, BuildingsData.VillagerHouse.SPAWNING_COST, frame);
    
        this._hudInfo = {
            entity: iconInfo,
            info: {
                isMine: this._owner.getColor() === Client.getMyColor(),
                health: this._health,
                totalHealth: this._totalHealth
            },
            actions: []
        };
        
        (this.body as Phaser.Physics.Arcade.Body).setSize(90, 140, true);
    }
}