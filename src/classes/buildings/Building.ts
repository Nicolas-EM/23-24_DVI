import * as Phaser from "phaser"
import PlayerEntity from "../PlayerEntity";
import Player from "../Player";
import { Resources } from "../../utils";

export default abstract class Building extends PlayerEntity {

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, owner: Player, health: number, totalHealth: number, spawningTime: number, spawningCost: Resources, visionRange: number, frame?: string | number) {
        super(scene, x, y, texture, owner, health, totalHealth, spawningTime, spawningCost, visionRange, frame);

        this._id = `${owner.getColor()}_Building_${owner.getNextEntityId()}`;
        owner.addBuilding(this);
    }

    dieOrDestroy() {
        this._owner.removeBuilding(this);
        //before we delete this, we delay a call to add the destroyed building to the scene:
        this.replaceDestroyed();
        this.destroy();
    }

    abstract replaceDestroyed();
}