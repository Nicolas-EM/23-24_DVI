import * as Phaser from 'phaser';

import TownHall from "../classes/buildings/Townhall";
import Tree from "./resources/Tree";
import Sheep from "./resources/Sheep";
import GoldMine from "./resources/GoldMine";
import Villager from "./npcs/Villager";
import Game from '../scenes/Game';
import { PhaserNavMeshPlugin, PhaserNavMesh } from "phaser-navMesh";
import Client from '../client';
import ResourceSpawner from './resources/ResourceSpawner';
import Tower from './buildings/Tower';
import GoblinHut from './buildings/GoblinHut';
import VillagerHouse from './buildings/VillagerHouse';
import Player from './Player';


export default class Map {

    // Attributes
    private _map: Phaser.Tilemaps.Tilemap;
    private _navMeshPlugin: PhaserNavMeshPlugin;
    private _navMesh: PhaserNavMesh;
    private spawners: ResourceSpawner[] = [];

    // Constructor
    constructor(private scene: Game, private mapId: string) {
        // Create map
        this._map = this.scene.make.tilemap({ key: this.mapId });

        // --- Background ---
        // Water
        let waterTileset = this._map.addTilesetImage("Water");
        const waterLayer = this._map.createLayer("Fondo/Water", waterTileset!);
        waterLayer?.setCollisionByProperty({ collides: true });
        // Foam
        this._map.createFromObjects('Fondo/Foam', { type: 'Foam', key: 'Foam' }).forEach(obj => (obj as Phaser.GameObjects.Sprite).anims.play("Foam"));
        // Rocks
        this._map.createFromObjects('Fondo/Rocks', { type: 'Rock1', key: 'Rocks', frame: 0 }).forEach(obj => (obj as Phaser.GameObjects.Sprite).anims.play("Rock1"));
        this._map.createFromObjects('Fondo/Rocks', { type: 'Rock2', key: 'Rocks', frame: 8 }).forEach(obj => (obj as Phaser.GameObjects.Sprite).anims.play("Rock2"));
        this._map.createFromObjects('Fondo/Rocks', { type: 'Rock3', key: 'Rocks', frame: 16 }).forEach(obj => (obj as Phaser.GameObjects.Sprite).anims.play("Rock3"));
        this._map.createFromObjects('Fondo/Rocks', { type: 'Rock4', key: 'Rocks', frame: 24 }).forEach(obj => (obj as Phaser.GameObjects.Sprite).anims.play("Rock4"));
        // Sand & Grass
        let groundTileset = this._map.addTilesetImage('Ground');
        const groundLayer = this._map.createLayer('Fondo/Ground', groundTileset!);
        const grassLayer = this._map.createLayer('Fondo/Grass', groundTileset!);

        // --- Resource Spawners ---
        const sheeps = this._map.createFromObjects('Resources/Food', { type: "Sheep", key: 'Sheep', classType: Sheep });
        const trees = this._map.createFromObjects('Resources/Wood', { type: "Tree", key: 'Tree', classType: Tree });
        const mines = this._map.createFromObjects('Resources/Gold', { type: "GoldMine", key: 'GoldMine', classType: GoldMine });

        // Adjust size of sprites and add them to spawners[]
        sheeps.forEach( s => {
            ((<Sheep>s).body as Phaser.Physics.Arcade.Body).setSize(50, 50, true);
        });
        this.spawners = this.spawners.concat(<ResourceSpawner[]>sheeps);

        trees.forEach( t => {
            ((<Tree>t).body as Phaser.Physics.Arcade.Body).setSize(120, 150, true);
        });
        this.spawners = this.spawners.concat(<ResourceSpawner[]>trees);

        mines.forEach( m => {
            ((<GoldMine>m).body as Phaser.Physics.Arcade.Body).setSize(160, 80, true);
        });
        this.spawners = this.spawners.concat(<ResourceSpawner[]>mines);

        // --- Decoration ---
        let decoTileset = this._map.addTilesetImage('Decoration');
        this._map.createLayer('Decoration', [decoTileset!, groundTileset!]);

        // Add PlayerEntities
        this._map.getObjectLayer("Buildings")?.objects.forEach(obj => {
            // Player 1
            if (obj.type === "Townhall_P1") {
                const p1 = (<Game>(this.scene)).getP1();

                if (Client.getMyColor() === p1.getColor()){
                    this.scene.cameras.main.centerOn(<number>obj.x, <number>obj.y);
                    this.scene.cameras.main.zoom = 0.7;
                }
                this.addStartingEntities(obj, 1, p1);
            } 
            
            // Player 2
            else if (obj.type === "Townhall_P2") {
                const p2 = (<Game>(this.scene)).getP2();

                if(Client.getMyColor() === p2.getColor()){
                    this.scene.cameras.main.centerOn(<number>obj.x, <number>obj.y);
                    this.scene.cameras.main.zoom = 0.7;
                }
                this.addStartingEntities(obj, -1, p2);
            }
        });

        const layers = [waterLayer, groundLayer, grassLayer];
        this._navMesh = this._navMeshPlugin.buildMeshFromTilemap("mesh", this._map, layers, (tile) => this.navMeshIsWalkable(tile));

    }

    addStartingEntities(obj: any, side: number, player: Player) {
        new TownHall(this.scene, <number>obj.x, <number>obj.y, player);

        new Tower(this.scene, <number>obj.x + side * 576, <number>obj.y + 192, player);
        new Tower(this.scene, <number>obj.x + side * 576, <number>obj.y - 192, player);
        new Tower(this.scene, <number>obj.x + side * 1024, <number>obj.y + 960, player);
        new Tower(this.scene, <number>obj.x + side * 1024, <number>obj.y - 960, player);
        new GoblinHut(this.scene, <number>obj.x + side * 192, <number>obj.y + 512, player);
        new GoblinHut(this.scene, <number>obj.x + side * 192, <number>obj.y - 512, player);

        new VillagerHouse(this.scene, <number>obj.x + side * 960, <number>obj.y + 384, player);
        new VillagerHouse(this.scene, <number>obj.x + side * 1024, <number>obj.y - 320, player);
        new VillagerHouse(this.scene, <number>obj.x - side * 256, <number>obj.y + 448, player);
        new VillagerHouse(this.scene, <number>obj.x - side * 192, <number>obj.y - 448, player);
        new VillagerHouse(this.scene, <number>obj.x, <number>obj.y + 960, player);
        new VillagerHouse(this.scene, <number>obj.x + side * 64, <number>obj.y - 960, player);

        new Villager(this.scene, <number>obj.x, <number>obj.y - 192, player);
        new Villager(this.scene, <number>obj.x + side * 320, <number>obj.y + 64, player);
        new Villager(this.scene, <number>obj.x + side * 64, <number>obj.y + 320, player);
    }

    // Get navmesh
    getNavMesh(): PhaserNavMesh {
        return this._navMesh;
    }

    // Check if a tile is walkable (water is not)
    navMeshIsWalkable(tile: Phaser.Tilemaps.Tile): boolean {
        if (tile.properties.collides) {
            return false;
        }
        return true;
    }

    // --- MAP BOUNDS ---
    getWidthInPixel(): number {
        return this._map.widthInPixels;
    }

    getHeightInPixel(): number {
        return this._map.heightInPixels;
    }
    // ------------------


    // --- Manage Resource Spawners ---
    getResourceSpawnerById(id: string): ResourceSpawner {
        return this.spawners.find((spawner: ResourceSpawner) => spawner.getId() === id);
    }

    removeResourceSpawner(spawner: ResourceSpawner) {
        this.spawners = this.spawners.filter(s => s.getId() !== spawner.getId());
    }
    // --------------------------------

}