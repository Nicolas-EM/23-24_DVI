import * as Phaser from "phaser"
import PlayerEntity from "../PlayerEntity";
import Player from "../Player";
import { Resources } from "../../utils";
import AttackUnit from "../npcs/AttackUnit";

export default abstract class Building extends PlayerEntity {
    private fireSprites: Phaser.GameObjects.Sprite[];
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, owner: Player, health: number, totalHealth: number, spawningTime: number, spawningCost: Resources, visionRange: number, frame?: string | number) {
        super(scene, x, y, texture, owner, health, totalHealth, spawningTime, spawningCost, visionRange, frame);
        this.fireSprites = [];
        this._id = `${owner.getColor()}_Building_${owner.getNextEntityId()}`;
        owner.addBuilding(this);
    }

    dieOrDestroy() {
        for (let i = 0; i < this.fireSprites.length; i++) {
            this.fireSprites[i].destroy();
        }
        this._owner.removeBuilding(this);
        
        this.scene.add.sprite(this.x, this.y, `${this._hudInfo.entity.name.split("_")[0]}_Destroyed`);

        this.destroy();
    }

    createFire() {        
        let fire = this.scene.add.sprite(this.x + Phaser.Math.FloatBetween(-1, 1) * this.width/2, this.y + Phaser.Math.FloatBetween(-1, 1) * this.height/2, 'Flame');
        fire.anims.play('fire');
        this.fireSprites.push(fire);
    }

    onAttackReceived(damage: number,attackUnit: AttackUnit) {
        super.onAttackReceived(damage,attackUnit);
        if (this.fireSprites.length < 1 && this._health <= this._totalHealth * 0.75 && this._health > this._totalHealth * 0.5) {
            this.createFire();
        }
        if (this.fireSprites.length < 2 &&this._health <= this._totalHealth * 0.5 && this._health > this._totalHealth * 0.25) {
            this.createFire();
        }
        if (this.fireSprites.length < 3 &&this._health <= this._totalHealth * 0.25 && this._health > 0){
            this.createFire();
        }

    }
}