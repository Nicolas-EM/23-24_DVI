import * as Phaser from "phaser"
import PlayerEntity from "../PlayerEntity";
import Player from "../Player";
import { Resources } from "../../utils";

export default abstract class Building extends PlayerEntity {

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, owner: Player, health: number, totalHealth: number, spawningTime: number, spawningCost: Resources, visionRange: number, frame?: string | number) {
        super(scene, x, y, texture, `${owner.getColor()}_Building_${owner.getNextEntityId()}`, owner, health, totalHealth, spawningTime, spawningCost, visionRange, frame);

        owner.addBuilding(this);
    }

    dieOrDestroy() {
        this._owner.removeBuilding(this);
        this.destroy();
    }
}