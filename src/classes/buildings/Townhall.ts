import Client from "../../client";
import Game from "../../scenes/Game";
import { Resources } from "../../utils";
import Villager from "../npcs/Villager";
import Player from "../Player";
import BuildingsData from "../../magic_numbers/buildings_data";
import SpawnerBuilding from "./SpawnerBuilding";


export default class Townhall extends SpawnerBuilding {
    
    static readonly COST: Resources = null;

    constructor(scene: Game, x: number, y: number, owner: Player, frame?: string | number) {
        let iconInfo = { ...BuildingsData.Townhall.ICON_INFO };
        iconInfo.name += owner.getColor();

        super(scene, x, y, iconInfo.name, owner, BuildingsData.Townhall.HEALTH, BuildingsData.Townhall.HEALTH, null, null, BuildingsData.Townhall.VISION_RANGE, frame);
    
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
            actions: [{run: () => this.queueNPC(Villager), actionFrame: `Villager_${this._owner.getColor()}`}]
        };
        
        (this.body as Phaser.Physics.Arcade.Body).setSize(280, 190, true);
    }

    dieOrDestroy() {
        this._owner.removeBuilding(this);
        // this.doDeathAnimation();
        this.scene.time.addEvent({
            delay: 3000,
            callback: () => Client.surrenderOrLose(this._owner.getColor()),
            callbackScope: this
        });      
    }

    replaceDestroyed() {
        const deletionX = this.x;
        const deletionY = this.y;
        const sceneReference = this.scene;
        setTimeout(() => {

            sceneReference.add.sprite(deletionX,deletionY, 'Townhall_Destroyed');
        },0);//0 is just a trick to delay the call in the call-stack (deferred call)
    }
}