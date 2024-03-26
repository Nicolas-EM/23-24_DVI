import * as Phaser from "phaser";
import AttackUnit from "./AttackUnit";
import Player from "../Player";
import NPC from "./NPC";
import Game from "../../scenes/Game";
import { Resources } from "../../utils";

// TODO: move to magic numbers
const damage = 10;
const attackRange = 5;
const visionRange = 10;
const SOLDIER_HEALTH = 100;
const SOLDIER_WIDTH = 150;
const SOLDIER_HEIGHT = 150;

export default class Soldier extends AttackUnit {
    // TODO: magic number
    static readonly COST: Resources = { wood: 10, food: 10, gold: 10 };
    static readonly SPAWN_TIME_MS: number = 10000;

    constructor(scene: Game, x: number, y: number, owner: Player, frame?: string | number) {
        super(scene, x, y, `Soldier_${owner.getColor()}`, owner, SOLDIER_HEALTH, SOLDIER_HEALTH, visionRange, { name: `Soldier_${owner.getColor()}`, width: SOLDIER_WIDTH, height: SOLDIER_HEIGHT }, attackRange, damage, frame);
    }

    protected attack(attackedEntity: NPC) {
        throw new Error("Method not implemented.");
    }
    protected hit(damage: number) {
        throw new Error("Method not implemented.");
    }
}