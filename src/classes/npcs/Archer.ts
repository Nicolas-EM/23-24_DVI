import * as Phaser from "phaser";
import NPC from "./NPC";
import AttackUnit from "./AttackUnit";
import Player from "../Player";

// TODO: move to magic numbers
const damage = 10;
const attackRange = 5;
const visionRange = 10;
// 

export default class Archer extends AttackUnit {

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, owner: Player, health: number, frame?: string | number) {
        super(scene, x, y, texture, owner, health, visionRange, attackRange, damage, frame);
    }

    protected attack(attackedEntity: NPC) {
        throw new Error("Method not implemented.");
    }
    protected hit(damage: number) {
        throw new Error("Method not implemented.");
    }
}