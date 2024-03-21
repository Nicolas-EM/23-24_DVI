import * as Phaser from "phaser"
import PlayerEntity from "../PlayerEntity";
import Player from "../Player";
import { IconInfo } from "../../utils";

export default abstract class Building extends PlayerEntity {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, owner: Player, health: number, totalHealth: number, visionRange: number, iconInfo: IconInfo, frame?: string | number) {
        super(scene, x, y, texture, owner, health, totalHealth, visionRange, iconInfo, frame);

        this._id = `${owner.getColor()}_Building_${owner.getNPCs().length}`;
        owner.addBuilding(this);
    }
}