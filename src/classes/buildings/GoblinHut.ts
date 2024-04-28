import Client from "../../client";
import Player from "../Player";
import Goblin from "../npcs/Goblin";
import SpawnerBuilding from "./SpawnerBuilding";
import BuildingsData from "../../magic_numbers/buildings_data";

export default class GoblinHut extends SpawnerBuilding {

    // Constructor
    constructor(scene: Phaser.Scene, x: number, y: number, owner: Player, frame?: string | number) {
        let iconInfo = { ...BuildingsData.Hut.ICON_INFO };
        iconInfo.name += owner.getColor();
        super(scene, x, y, iconInfo.name, owner, BuildingsData.Hut.HEALTH, BuildingsData.Hut.HEALTH, frame);
        
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
        
        (this.body as Phaser.Physics.Arcade.Body).setSize(90, 130, true);
    }
}