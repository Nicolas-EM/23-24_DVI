import Client from "../../client";
import { Resources } from "../../utils";
import Player from "../Player";
import Archer from "../npcs/Archer";
import Soldier from "../npcs/Soldier";
import SpawnerBuilding from "./SpawnerBuilding";
import BuildingsData from "../../magic_numbers/buildings_data";

export default class TownHall extends SpawnerBuilding {

    static readonly COST: Resources = BuildingsData.Tower.SPAWNING_COST;

    constructor(scene: Phaser.Scene, x: number, y: number, owner: Player, frame?: string | number) {
        let iconInfo = { ...BuildingsData.Tower.ICON_INFO };
        iconInfo.name += owner.getColor();
        super(scene, x, y, iconInfo.name, owner, BuildingsData.Tower.HEALTH, BuildingsData.Tower.HEALTH, BuildingsData.Tower.SPAWNING_TIME, BuildingsData.Tower.SPAWNING_COST, BuildingsData.Tower.VISION_RANGE, frame);
    
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
            actions: [{run: () => this.queueNPC(Soldier), actionFrame: `Soldier_${this._owner.getColor()}`}, {run: () => this.queueNPC(Archer), actionFrame: `Archer_${this._owner.getColor()}`}]
        };

        (this.body as Phaser.Physics.Arcade.Body).setSize(90, 180, true);
    }

    replaceDestroyed() {
        const deletionX = this.x;
        const deletionY = this.y;
        const sceneReference = this.scene;
        setTimeout(() => {

            sceneReference.add.sprite(deletionX,deletionY, 'Tower_Destroyed');
        },0);//0 is just a trick to delay the call in the call-stack (deferred call)
    }
}