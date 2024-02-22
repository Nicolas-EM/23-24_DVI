import * as Phaser from 'phaser';
import Player from '../player.ts'
import Entity from '../Entity.ts';

export default abstract class NPC extends Entity {
    // protected attributes:
    protected _id: string;
    protected _owner: Player;
    protected _health: number;
    protected _visionRange: number;

    /**
     * @constructor
     * @param owner is the player who created the entity, not optional.
     * @returns NPC instance
     */
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, owner: Player, health: number, id: string, visionRange: number, frame?: string | number) {
        super(scene, x, y, texture, owner, health, id, visionRange, frame);
    }

    /**
     * @summary executes move order on X Y cordinates
     * @param x is X coordinate to move on board
     * @param y is Y coordinate to move on board
     */
    move(X: number, Y: number): void{
        
    }
}