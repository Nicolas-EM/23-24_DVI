import * as Phaser from "phaser"
import PlayerEntity from "../PlayerEntity";
import Player from "../Player";
import AttackUnit from "../npcs/AttackUnit";

export default abstract class Building extends PlayerEntity {

    // Attributes
    private fireSprites: Phaser.GameObjects.Sprite[];

    // Constructor
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, owner: Player, health: number, totalHealth: number, frame?: string | number) {
        super(scene, x, y, texture, owner, health, totalHealth, frame);
        this.fireSprites = [];
        this._id = `${owner.getColor()}_Building_${owner.getNextEntityId()}`;
        owner.addBuilding(this);
        (<Game>(this.scene)).getBuildingGroup().add(this);
    }

    dieOrDestroy() {
        // Remove fire sprites
        for (let i = 0; i < this.fireSprites.length; i++) {
            this.fireSprites[i].destroy();
        }

        this._owner.removeBuilding(this);
        
        this.scene.add.sprite(this.x, this.y, `${this._hudInfo.entity.name.split("_")[0]}_Destroyed`);

        super.dieOrDestroy();
        this.destroy();
    }

    createFire(x: number, y: number) {        
        let fire = this.scene.add.sprite(x, y, 'Flame');
        fire.anims.play('fire');
        this.fireSprites.push(fire);
    }

    onAttackReceived(damage: number, attackUnit: AttackUnit) {

        super.onAttackReceived(damage, attackUnit);

        // Fire animation
        if (this.fireSprites.length < 1 && this._health <= this._totalHealth * 0.75 && this._health > this._totalHealth * 0.5) {
            this.createFire(this.x + 1.5, this.y - this.height/3);
        }
        if (this.fireSprites.length < 2 &&this._health <= this._totalHealth * 0.5 && this._health > this._totalHealth * 0.25) {
            this.createFire(this.x - this.width/5, this.y - this.width/5.5);
        }
        if (this.fireSprites.length < 3 &&this._health <= this._totalHealth * 0.25 && this._health > 0){
            this.createFire(this.x + this.width/4.5, this.y - this.height/8);
        }

    }
}