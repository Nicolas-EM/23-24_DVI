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
import AttackUnit from '../classes/npcs/AttackUnit';
import Building from '../classes/buildings/Building';
import { animationFactory } from '../animationFactory';
import { PhaserNavMesh } from "phaser-navMesh";

// MAGIC NUMBER
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1;
const ZOOM_AMOUNT = 0.05;
const MOVEMENT_OFFSET = 10;

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
  private _topLeft: Phaser.GameObjects.Image;
  private _topRight: Phaser.GameObjects.Image;
  private _bottomLeft: Phaser.GameObjects.Image;
  private _bottomRight: Phaser.GameObjects.Image;

  private gameTheme: Phaser.Sound.BaseSound;// Canción WarTheme.mp3
  private warTheme: Phaser.Sound.BaseSound; // Canción WarTheme.mp3
  private attackEventTimer: Phaser.Time.TimerEvent; // Temporizador para el evento de ataque


  constructor() {
    super({ key: 'game' });
  }

  // Para pasar atributos de una escena a otra
  // En este caso, pasamos el ID del mapa
  init(data) {
    this.mapId = data.mapId;
  }

  create() {
    Client.setScene(this);

    // Players
    this.p1 = new Player(Client.lobby.players[0].color, Client.lobby.players[0].color, this);
    this.p2 = new Player(Client.lobby.players[1].color, Client.lobby.players[1].color, this);

    // Hud
    this.scene.run('hud', { player: (this.p1.getColor() === Client.getMyColor() ? this.p1 : this.p2) });
    this.scene.run('settings', { scene: "game" });
    this.events.on('menuOpened', () => {
      this.optionsMenuOpened = true;
    });
    this.events.on('menuClosed', () => {
      this.optionsMenuOpened = false;
    });

    animationFactory.createAnimations(this);

    // Map
    this._map = new Map(this, this.mapId);

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

    // Cursor
    this.input.on('gameobjectdown', this.handlGameObjectDown);
    this.input.on('pointerdown', this.handlePointerDown);
    this.input.on("pointerup", this.handlePointerUp);

    // Sound
    this.sound.removeAll();
    this.gameTheme = this.sound.add('Game', { volume: 0.2, loop: true });
    this.gameTheme.play();

    this.warTheme = null;
    this.attackEventTimer = null;

    this.events.on('attackEvent', () => {
      // Reiniciar el temporizador en cada evento de ataque
      if (this.attackEventTimer) {
        this.attackEventTimer.remove(false);
      }
      this.attackEventTimer = this.time.delayedCall(15000, this.stopWarThemeAndResumeSong, [], this);

      this.gameTheme.stop();
      if (this.warTheme === null) {
        this.warTheme = this.sound.add('War', { volume: 0.3, loop: true });
        this.warTheme.play();
      }
    });

    // Corners Selected Entity
    this._topLeft = this.add.image(0, 0, "Selected_Top_Left");
    this._topRight = this.add.image(0, 0, "Selected_Top_Right");
    this._bottomLeft = this.add.image(0, 0, "Selected_Bottom_Left");
    this._bottomRight = this.add.image(0, 0, "Selected_Bottom_Right");

    this.setCornersVisibility(false);

    this.events.on("death", (entity) => {
      if (this._selectedEntity === entity) {
        this._selectedEntity = null;
        this.setCornersVisibility(false);
      }
    });
  }

  private handlGameObjectDown = (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, stopPropagation) => {
    if (this.optionsMenuOpened || !this.pointerInMap || !this._selectedEntity || !pointer.rightButtonDown())
      return;

    if (this._selectedEntity instanceof AttackUnit && gameObject instanceof PlayerEntity) {
      if (!(gameObject as PlayerEntity).belongsToMe())
        Client.attackOrder(this._selectedEntity.getId(), gameObject.getId());
    }
  }

  private handlePointerDown = (pointer: Phaser.Input.Pointer) => {
    // Cursor icon
    if(this.input.manager.defaultCursor.includes("/pointer")) {
      this.input.setDefaultCursor(`url(${Sprites.UI.Pointers.Pointer_Pressed}), pointer`);
    }

    if (this.optionsMenuOpened || !this.pointerInMap || !this._selectedEntity)
      return;
    if (pointer.leftButtonDown()) {
      this.setSelectedEntity(undefined);
    }
    if (this._selectedEntity instanceof NPC && this._selectedEntity.belongsToMe()) {
      const pointerPosition = new Phaser.Math.Vector2(pointer.worldX, pointer.worldY);
      Client.setNpcTarget(this._selectedEntity.getId(), pointerPosition);
    }
  }

  private handlePointerUp = (pointer: Phaser.Input.Pointer) => {
    if(this.input.manager.defaultCursor.includes("/pointer_pressed")) {
      this.input.setDefaultCursor(`url(${Sprites.UI.Pointers.Pointer}), pointer`);
    }
  }

  update(time: number, delta: number): void {
    this.cameraPan(delta);
    this.events.emit('update', time, delta);

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

    if (this._selectedEntity) {
      this.setCornersPosition();
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
    if (this.p1.getColor() === color)
      return this.p1;
    else
      return this.p2;
  }

  isSelectedEntityAttackUnit(): boolean {
    return this._selectedEntity instanceof AttackUnit;
  }

  getSelectedEntity(): PlayerEntity | ResourceSpawner {
    return this._selectedEntity;
  }

  setSelectedEntity(entity: PlayerEntity | ResourceSpawner) {
    if (!this.optionsMenuOpened) {
      this._selectedEntity = entity;
      if (entity) {
        this.scene.get('hud').events.emit('entityClicked', this._selectedEntity);
        this.setCornersPosition();
        this.setCornersVisibility(true);
      }
      // Des-seleccionar
      else {
        this.scene.get('hud').events.emit('entityUnclicked');
        this.setCornersVisibility(false);
      }
    }
  }

  setCornersVisibility(active: boolean) {
    this._topLeft.setVisible(active);
    this._topRight.setVisible(active);
    this._bottomLeft.setVisible(active);
    this._bottomRight.setVisible(active);
  }

  setCornersPosition() {
    this._topLeft.setPosition(this._selectedEntity.x - ((this._selectedEntity.body as Phaser.Physics.Arcade.Body).width / 2), this._selectedEntity.y - ((this._selectedEntity.body as Phaser.Physics.Arcade.Body).height / 2));
    this._topRight.setPosition(this._selectedEntity.x + ((this._selectedEntity.body as Phaser.Physics.Arcade.Body).width / 2), this._selectedEntity.y - ((this._selectedEntity.body as Phaser.Physics.Arcade.Body).height / 2));
    this._bottomLeft.setPosition(this._selectedEntity.x - ((this._selectedEntity.body as Phaser.Physics.Arcade.Body).width / 2), this._selectedEntity.y + ((this._selectedEntity.body as Phaser.Physics.Arcade.Body).height / 2));
    this._bottomRight.setPosition(this._selectedEntity.x + ((this._selectedEntity.body as Phaser.Physics.Arcade.Body).width / 2), this._selectedEntity.y + ((this._selectedEntity.body as Phaser.Physics.Arcade.Body).height / 2));
  }

  setNpcTarget(npcId: string, position: Phaser.Math.Vector2) {
    this.p1.getNPCById(npcId)?.setMovementTarget(position);
    this.p2.getNPCById(npcId)?.setMovementTarget(position);
  }

  setNPCAttackTarget(npcId: string, targetId: string) {
    let npc = this.p1.getNPCById(npcId);
    if (npc && npc instanceof AttackUnit) {
      npc.setAttackTarget(targetId);
      return;
    }
    npc = this.p2.getNPCById(npcId);
    if (npc && npc instanceof AttackUnit) {
      npc.setAttackTarget(targetId);
      return;
    }
  }

  npcConstructor(npcType: string) {
    const constructors = {
      "Archer_": Archer,
      "Goblin_": Goblin,
      "Soldier_": Soldier,
      "Villager_": Villager
    }

    return constructors[npcType];
  }

  spawnNPC(npcType: string, x: number, y: number, ownerColor: string) {
    new (this.npcConstructor(npcType))(this, x, y, this.getPlayerByColor(ownerColor));
  }

  getAllBuildings(): Building[] {
    return this.p1.getBuildings().concat(this.p2.getBuildings());
  }

  getEntityById(entityId: string): PlayerEntity {
    let entity = this.p1.getPlayerEntityById(entityId);
    if (entity)
      return entity;
    else
      return this.p2.getPlayerEntityById(entityId);
  }

  getNavmesh(): PhaserNavMesh {
    return this._map.navMesh;
  }

  stopWarThemeAndResumeSong() {
    if (this.warTheme.isPlaying) {
      this.tweens.add({
        targets: this.warTheme,
        volume: 0,
        duration: 5000,
        onComplete: () => {
          this.warTheme.stop();
          this.warTheme = null;
          this.gameTheme.play();
        }
      });
    }
  }
}