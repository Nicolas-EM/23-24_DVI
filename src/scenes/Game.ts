import * as Phaser from 'phaser'
import Map from "../classes/Map";
import { PhaserNavMeshPlugin } from "phaser-navMesh";
import PlayerEntity from '../classes/PlayerEntity';
import NPC from '../classes/npcs/NPC';
import ResourceSpawner from '../classes/resources/ResourceSpawner';
import Client from '../client';
import Player from '../classes/Player';
import * as Sprites from "../../assets/sprites";
import Archer from '../classes/npcs/Archer';
import Goblin from '../classes/npcs/Goblin';
import Soldier from '../classes/npcs/Soldier';
import Villager from '../classes/npcs/Villager';
import { animationFactory } from '../animationFactory';
// MAGIC NUMBER
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 1;
const ZOOM_AMOUNT = 0.05;
const MOVEMENT_OFFSET = 10;

const npcConstructors: { [key: string]: new (scene: Phaser.Scene, x: number, y: number, owner: Player) => NPC } = {
  "Archer": Archer,
  "Goblin": Goblin,
  "Soldier": Soldier,
  "Villager": Villager
};

export default class Game extends Phaser.Scene {
  public navMeshPlugin: PhaserNavMeshPlugin;

  private p1: Player;
  private p2: Player;
  private pointerInMap = true;
  private mapId: string;
  private _map: Map;
  private _selectedEntity: PlayerEntity | ResourceSpawner;
  private cursors: any;
  private optionsMenuOpened = false;

  constructor() {
    super({ key: 'game' });
  }

  // Para pasar atributos de una escena a otra
  // En este caso, pasamos el ID del mapa
  init(data) {
    this.mapId = data.mapId;
  }

  create() {
    // Cursor
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.input.setDefaultCursor(`url(${Sprites.UI.Pointers.Pointer_Pressed}), pointer`);
    });
    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      this.input.setDefaultCursor(`url(${Sprites.UI.Pointers.Pointer}), pointer`);
    });

    Client.setScene(this);

    // Players
    this.p1 = new Player(Client.lobby.players[0].color, Client.lobby.players[0].color, this);
    this.p2 = new Player(Client.lobby.players[1].color, Client.lobby.players[1].color, this);

    // Hud
    this.scene.run('hud', {player: (this.p1.getColor() === Client.getMyColor() ? this.p1 : this.p2)});
    this.events.on('menuOpened', () => {
      this.optionsMenuOpened = true;
    });
    this.events.on('menuClosed', () => {
      this.optionsMenuOpened = false;
    });
    
    // Map
    this._map = new Map(this, this.mapId);
    animationFactory.createAnimations(this);//PENDING TESTING


    // Event listener al hacer scroll
    this.input.on('wheel', this.cameraZoom, this);
    this.input.on('gameout', () => this.pointerInMap = false);
    this.input.on('gameover', () => this.pointerInMap = true);

    // Set limits for movement
    this.cameras.main.setBounds(0, 0, this._map.getWidthInPixel(), this._map.getHeightInPixel());

    // WASD for camera movement
    this.cursors = this.input.keyboard!.addKeys({
      'up': Phaser.Input.Keyboard.KeyCodes.W,
      'down': Phaser.Input.Keyboard.KeyCodes.S,
      'left': Phaser.Input.Keyboard.KeyCodes.A,
      'right': Phaser.Input.Keyboard.KeyCodes.D
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, gameObject) => {
      if (pointer.rightButtonDown() && this.pointerInMap && this._selectedEntity) {
        const pointerPosition = new Phaser.Math.Vector2(pointer.worldX, pointer.worldY);

        if (this._selectedEntity instanceof NPC && this._selectedEntity.belongsToMe()) {
          Client.setNpcTarget(this._selectedEntity.getId(), pointerPosition);
        }
      }
    });

    // Sound
    this.sound.removeAll();
  }
  update(time: number, delta: number): void {
    this.cameraPan(delta);
    this.events.emit('update', time, delta);;

    if (!this.optionsMenuOpened) { // Disable movement if menu opened 
      if (this.cursors.up.isDown) {
        this.cameraMoveUp(delta);
      }
      else if (this.cursors.down.isDown) {
        this.cameraMoveDown(delta);
      }

      if (this.cursors.left.isDown) {
        this.cameraMoveLeft(delta);
      }
      else if (this.cursors.right.isDown) {
        this.cameraMoveRight(delta);
      }
    }
  }

  cameraZoom(pointer, gameObjects, deltaX, deltaY, deltaZ) {
    if (!this.optionsMenuOpened) {
      if (deltaY > 0) {
        this.cameras.main.zoom = Phaser.Math.Clamp(this.cameras.main.zoom - ZOOM_AMOUNT, MIN_ZOOM, MAX_ZOOM);
      }
      if (deltaY < 0) {
        this.cameras.main.zoom = Phaser.Math.Clamp(this.cameras.main.zoom + ZOOM_AMOUNT, MIN_ZOOM, MAX_ZOOM);
      }
    }
  }

  cameraMoveUp(delta) {
    this.cameras.main.scrollY = this.cameras.main.scrollY - delta / this.cameras.main.zoom;
  }

  cameraMoveDown(delta) {
    this.cameras.main.scrollY = this.cameras.main.scrollY + delta / this.cameras.main.zoom;
  }

  cameraMoveLeft(delta) {
    this.cameras.main.scrollX = this.cameras.main.scrollX - delta / this.cameras.main.zoom;
  }

  cameraMoveRight(delta) {
    this.cameras.main.scrollX = this.cameras.main.scrollX + delta / this.cameras.main.zoom;
  }

  cameraPan(delta: number) {
    let { width, height } = this.sys.game.canvas;
    const pointer = this.input.activePointer.position;

    if (pointer.x === 0 && pointer.y === 0)
      return;

    if (!this.pointerInMap)
      return;

    if (!this.optionsMenuOpened) { // Disable movement if menu opened
      if (pointer.x >= width - MOVEMENT_OFFSET && pointer.y >= MOVEMENT_OFFSET)
        this.cameraMoveRight(delta);
      else if (pointer.x <= MOVEMENT_OFFSET)
        this.cameraMoveLeft(delta);

      if (pointer.y >= height - MOVEMENT_OFFSET)
        this.cameraMoveDown(delta);
      else if (pointer.y <= MOVEMENT_OFFSET && pointer.x <= width - MOVEMENT_OFFSET * 2)
        this.cameraMoveUp(delta);
    }
  }

  getP1(): Player {
    return this.p1;
  }

  getP2(): Player {
    return this.p2;
  }

  getPlayerByColor(color: string): Player {
    if(this.p1.getColor() === color)
      return this.p1;
    else
      return this.p2;
  }

  setSelectedEntity(entity: PlayerEntity | ResourceSpawner) {
    if (!this.optionsMenuOpened) {
      console.log("Game: Entity Selected");
      this._selectedEntity = entity;
      this.scene.get('hud').events.emit('entityClicked', this._selectedEntity.getHudInfo());
    }
  }

  setNpcTarget(npcId: string, position: Phaser.Math.Vector2) {
    this.p1.getNPCById(npcId)?.setTarget(position, this._map.navMesh);
    this.p2.getNPCById(npcId)?.setTarget(position, this._map.navMesh);
  }

  spawnNPC(npcType: string, x: number, y: number, ownerColor: string) {
    console.log(npcConstructors[npcType]);
    new npcConstructors[npcType](this, x, y, this.getPlayerByColor(ownerColor));
  }
}