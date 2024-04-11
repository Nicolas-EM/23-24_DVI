import * as Phaser from 'phaser';

import TownHall from "../classes/buildings/Townhall";
import Tree from "./resources/Tree";
import Sheep from "./resources/Sheep";
import GoldMine from "./resources/GoldMine";
import Villager from "./npcs/Villager";
import Game from '../scenes/Game';

import { PhaserNavMesh } from "phaser-navmesh";
import Client from '../client';
import Soldier from './npcs/Soldier';
import Archer from './npcs/Archer';
import Goblin from './npcs/Goblin';
import ResourceSpawner from './resources/ResourceSpawner';

export default class Map {
    private _map: Phaser.Tilemaps.Tilemap;
    public navMesh: PhaserNavMesh;
    private spawners: ResourceSpawner[] = [];

    constructor(private scene: Game, private mapId: string) {
        // Crear mapa
        this._map = this.scene.make.tilemap({ key: this.mapId });

        // Fondo
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

        let groundTileset = this._map.addTilesetImage('Ground');
        const groundLayer = this._map.createLayer('Fondo/Ground', groundTileset!);
        const grassLayer = this._map.createLayer('Fondo/Grass', groundTileset!);

        // Resources
        const sheeps = this._map.createFromObjects('Resources/Food', { type: "Sheep", key: 'Sheep', classType: Sheep });
        const trees = this._map.createFromObjects('Resources/Wood', { type: "Tree", key: 'Tree', classType: Tree });
        const mines = this._map.createFromObjects('Resources/Gold', { type: "GoldMine", key: 'GoldMine', classType: GoldMine });

        sheeps.forEach( s => {
            ((<Sheep>s).body as Phaser.Physics.Arcade.Body).setSize(50, 50, true);
        });
        this.spawners.push();
        this.spawners = this.spawners.concat(<ResourceSpawner[]>sheeps);

        trees.forEach( t => {
            ((<Tree>t).body as Phaser.Physics.Arcade.Body).setSize(120, 150, true);
        });
        this.spawners = this.spawners.concat(<ResourceSpawner[]>trees);

        mines.forEach( m => {
            ((<GoldMine>m).body as Phaser.Physics.Arcade.Body).setSize(160, 80, true);
        });
        this.spawners = this.spawners.concat(<ResourceSpawner[]>mines);

        // Decoration
        let decoTileset = this._map.addTilesetImage('Decoration');
        this._map.createLayer('Decoration', [decoTileset!, groundTileset!]);

        this._map.getObjectLayer("Buildings")?.objects.forEach(obj => {
            if (obj.type === "Townhall_P1") {
                const p1 = (<Game>(this.scene)).getP1();

                if (Client.getMyColor() === p1.getColor()){
                    this.scene.cameras.main.centerOn(<number>obj.x, <number>obj.y);
                    this.scene.cameras.main.zoom = 0.7;
                }
                new TownHall(this.scene, <number>obj.x, <number>obj.y, p1);

                new Soldier(this.scene, <number>obj.x, <number>obj.y - 192, p1);
                new Archer(this.scene, <number>obj.x + 320, <number>obj.y + 64, p1);
                new Goblin(this.scene, <number>obj.x + 64, <number>obj.y + 320, p1);
                new Villager(this.scene, <number>obj.x + 128, <number>obj.y - 192, p1);
            } else if (obj.type === "Townhall_P2") {
                const p2 = (<Game>(this.scene)).getP2();

                if(Client.getMyColor() === p2.getColor()){
                    this.scene.cameras.main.centerOn(<number>obj.x, <number>obj.y);
                    this.scene.cameras.main.zoom = 0.7;
                }
                new TownHall(this.scene, <number>obj.x, <number>obj.y, p2);

                new Villager(this.scene, <number>obj.x, <number>obj.y - 192, p2);
                new Villager(this.scene, <number>obj.x - 320, <number>obj.y + 64, p2);
                new Villager(this.scene, <number>obj.x - 64, <number>obj.y + 320, p2);
            }
        });

        // (<Game>this.scene).setSelectedEntity(this.NPCs[0]);

        ////////////////////////////// NAVMESH PATHFINDER //////////////////////////////    
        const layers = [waterLayer, groundLayer, grassLayer];

        this.navMesh = (<Game>this.scene).navMeshPlugin.buildMeshFromTilemap("mesh", this._map, layers, (tile) => this.navMeshIsWalkable(tile));
        // this.navMesh.enableDebug(); // Creates a Phaser.Graphics overlay on top of the screen
        // this.navMesh.debugDrawClear(); // Clears the overlay
        // Visualize the underlying navmesh

        // -->  okay wtf ? 
        // this.navMesh.debugDrawMesh({
        //     drawCentroid: true,
        //     drawBounds: false,
        //     drawNeighbors: true,
        //     drawPortals: true
        // });

        // Prueba de colision con spawner
        // let testSpawner: Sheep = <Sheep>foodSpawners[0];
        // const path = this.navMesh.findPath({ x: 4050, y: 3500 }, { x: testSpawner.x, y: testSpawner.y });

        // // Visualize an individual path
        // this.navMesh.debugDrawPath(path, 0xffd900);
    }

    tileHasObject(tile: Phaser.Tilemaps.Tile): boolean {
        const allBuildings = (<Game>(this.scene)).getAllBuildings();
        for (let building of allBuildings) {
            if (tile.x >= building.x && tile.x + tile.width <= building.x && tile.y >= building.y && tile.y + tile.height <= building.y)
                return true;
        }

        return false;
    }

    navMeshIsWalkable(tile: Phaser.Tilemaps.Tile): boolean {
        if (tile.properties.collides || this.tileHasObject(tile)) {
            return false;
        }
        return true;
    }

    getWidthInPixel(): number {
        return this._map.widthInPixels;
    }

    getHeightInPixel(): number {
        return this._map.heightInPixels;
    }

    getResourceSpawnerById(id: string): ResourceSpawner {
        return this.spawners.find((spawner: ResourceSpawner) => spawner.getId() === id);
    }

    removeResourceSpawner(spawner: ResourceSpawner) {
        this.spawners = this.spawners.filter(s => s.getId() !== spawner.getId());
    }
}