import * as Phaser from 'phaser'
import Map from "../classes/Map";
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
import { PhaserNavMesh } from "phaser-navMesh";
import SceneUtils from "./sceneUtils"
import GeneralData from "../magic_numbers/general_data";


export default class Game extends Phaser.Scene {

  // --- Attributes ---
  private p1: Player;
  private p2: Player;
  // Map
  private pointerInMap = true;
  private mapId: string;
  private _map: Map;
  // Selected entity
  private _selectedEntity: PlayerEntity | ResourceSpawner;
  private _topLeft: Phaser.GameObjects.Image;
  private _topRight: Phaser.GameObjects.Image;
  private _bottomLeft: Phaser.GameObjects.Image;
  private _bottomRight: Phaser.GameObjects.Image;
  // Keys available for input
  private cursors: any;
  // Settings
  private optionsMenuOpened = false;
  // Sound
  private gameTheme: Phaser.Sound.BaseSound;
  private warTheme: Phaser.Sound.BaseSound;
  private attackEventTimer: Phaser.Time.TimerEvent;

  // Constructor
  constructor() {
    super({ key: 'game' });
  }

  // Init
  init(data) {
    this.mapId = data.mapId;
  }

  // Create
  create() {

    // Init config
    Client.setScene(this);
    this.scene.run('settings', { scene: "game" });
    SceneUtils.settingsConfig(this);

    // Reset params to default values
    this.optionsMenuOpened = false;
    this._selectedEntity = undefined;
    this.pointerInMap = true;

    // Players
    this.p1 = new Player(Client.lobby.players[0].color, Client.lobby.players[0].color, this);
    this.p2 = new Player(Client.lobby.players[1].color, Client.lobby.players[1].color, this);

    // Hud
    this.scene.run('hud', { player: (this.p1.getColor() === Client.getMyColor() ? this.p1 : this.p2) });

    // Map
    this._map = new Map(this, this.mapId);

    // Mouse events
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => this.cameraZoom(deltaY));
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
    this.configSound();

    // Corners Selected Entity
    this._topLeft = this.add.image(0, 0, "Selected_Top_Left");
    this._topRight = this.add.image(0, 0, "Selected_Top_Right");
    this._bottomLeft = this.add.image(0, 0, "Selected_Bottom_Left");
    this._bottomRight = this.add.image(0, 0, "Selected_Bottom_Right");
    this.setCornersVisibility(false);

  }

  // Update
  update(time: number, delta: number): void {
    this.events.emit('update', time, delta);

    // Camera movement
    if (!this.optionsMenuOpened) {  // Disable movement if menu opened 
      this.cameraMovementMouse(delta);
      this.cameraMovementKeys(delta);
    }

    // Update corners of the selected entity (if NPC selected)
    if (this._selectedEntity && this._selectedEntity instanceof NPC)
      this.setCornersPosition();
  }

  // --- GETTERS ---
  getCursors(): any {
    return this.cursors;
  }

  isPointerInMap(): boolean {
    return this.pointerInMap;
  }

  isOptionsMenuOpened(): boolean {
    return this.optionsMenuOpened;
  }

  getNavMesh(): PhaserNavMesh {
    return this._map.getNavMesh();
  }

  getSelectedEntity(): PlayerEntity | ResourceSpawner {
    return this._selectedEntity;
  }

  getP1(): Player {
    return this.p1;
  }

  getP2(): Player {
    return this.p2;
  }

  getResourceSpawnerById(id: string): ResourceSpawner {
    return this._map.getResourceSpawnerById(id);
  }

  getEntityById(entityId: string): PlayerEntity {
    let entity = this.p1.getPlayerEntityById(entityId);
    if (entity)
      return entity;
    else
      return this.p2.getPlayerEntityById(entityId);
  }

  isSelectedEntityAttackUnit(): boolean {
    return this._selectedEntity instanceof AttackUnit;
  }

  // --- SETTERS ---
  setOptionsMenuOpened(opened: boolean) {
    this.optionsMenuOpened = opened;
  }

  setCornersVisibility(active: boolean) {
    this._topLeft.setVisible(active);
    this._topRight.setVisible(active);
    this._bottomLeft.setVisible(active);
    this._bottomRight.setVisible(active);
  }

  setCornersPosition() {
    const physicsBody = (this._selectedEntity.body as Phaser.Physics.Arcade.Body);
    if (!physicsBody)
      return;

    const width = physicsBody.width / 2;
    const height = physicsBody.height / 2;

    this._topLeft.setPosition(this._selectedEntity.x - (width), this._selectedEntity.y - (height));
    this._topRight.setPosition(this._selectedEntity.x + (width), this._selectedEntity.y - (height));
    this._bottomLeft.setPosition(this._selectedEntity.x - (width), this._selectedEntity.y + (height));
    this._bottomRight.setPosition(this._selectedEntity.x + (width), this._selectedEntity.y + (height));
  }

  setNPCTarget(npcId: string, position: Phaser.Math.Vector2) {
    this.p1.getNPCById(npcId)?.setMovementTarget(position);
    this.p2.getNPCById(npcId)?.setMovementTarget(position);
  }

  setNPCAttackTarget(npcId: string, targetId: string) {
    let npc = this.getEntityById(npcId);
    if (npc && npc instanceof AttackUnit) {
      npc.setAttackTarget(targetId);
      return;
    }
  }

  setVillagerGatherTarget(villagerId: string, resourceSpawnerId: string) {
    const villager = this.getEntityById(villagerId);
    const spawner = this.getResourceSpawnerById(resourceSpawnerId);
    if (villager && villager instanceof Villager && spawner) {
      villager.setGatherTarget(spawner);
    }
  }

  setSelectedEntity(entity: PlayerEntity | ResourceSpawner) {
    if (!this.optionsMenuOpened) {
      this._selectedEntity = entity;
      if (entity) {
        this.scene.get('hud').events.emit('entityClicked', this._selectedEntity);
        this.setCornersPosition();
        this.setCornersVisibility(true);
      }
      // Un-select
      else {
        this.scene.get('hud').events.emit('entityUnclicked');
        this.setCornersVisibility(false);
      }
    }
  }

  // --- POINTER ---
  handlGameObjectDown = (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, stopPropagation) => {
    if (this.optionsMenuOpened || !this.pointerInMap || !this._selectedEntity || !pointer.rightButtonDown())
      return;

    if (this._selectedEntity instanceof AttackUnit && gameObject instanceof PlayerEntity) {
      if (!(gameObject as PlayerEntity).belongsToMe())
        Client.attackOrder(this._selectedEntity.getId(), gameObject.getId());
    } else if (this._selectedEntity instanceof Villager && gameObject instanceof ResourceSpawner) {
      Client.gatherOrder(this._selectedEntity.getId(), gameObject.getId());
    }
  }

  handlePointerDown = (pointer: Phaser.Input.Pointer) => {
    // Cursor icon
    if (this.input.manager.defaultCursor.includes("/pointer")) {
      this.input.setDefaultCursor(`url(${Sprites.UI.Pointers.Pointer_Pressed}), pointer`);
    }

    if (this.optionsMenuOpened || !this.pointerInMap || !this._selectedEntity)
      return;
    if (pointer.leftButtonDown()) {
      this.setSelectedEntity(undefined);
    }
    if (this._selectedEntity instanceof NPC && this._selectedEntity.belongsToMe()) {
      const pointerPosition = new Phaser.Math.Vector2(pointer.worldX, pointer.worldY);
      Client.setNPCTarget(this._selectedEntity.getId(), pointerPosition);
    }
  }

  handlePointerUp = (pointer: Phaser.Input.Pointer) => {
    if (this.input.manager.defaultCursor.includes("/pointer_pressed")) {
      this.input.setDefaultCursor(`url(${Sprites.UI.Pointers.Pointer}), pointer`);
    }
  }

  // --- CAMERA CONTROL ---
  cameraMovementMouse(delta: number) {
    let { width, height } = this.sys.game.canvas;
    const pointer = this.input.activePointer.position;

    if (pointer.x === 0 && pointer.y === 0)
      return;

    if (!this.isPointerInMap())
      return;

    // Camera movement
    if (!this.isOptionsMenuOpened()) {  // Disable movement if menu opened
      if (pointer.x >= width - GeneralData.ConfigData.MOVEMENT_OFFSET && pointer.y >= GeneralData.ConfigData.MOVEMENT_OFFSET)
        this.cameras.main.scrollX = this.cameras.main.scrollX + delta / this.cameras.main.zoom;
      else if (pointer.x <= GeneralData.ConfigData.MOVEMENT_OFFSET)
        this.cameras.main.scrollX = this.cameras.main.scrollX - delta / this.cameras.main.zoom;

      if (pointer.y >= height - GeneralData.ConfigData.MOVEMENT_OFFSET)
        this.cameras.main.scrollY = this.cameras.main.scrollY + delta / this.cameras.main.zoom;
      else if (pointer.y <= GeneralData.ConfigData.MOVEMENT_OFFSET && pointer.x <= width - GeneralData.ConfigData.MOVEMENT_OFFSET * 2)
        this.cameras.main.scrollY = this.cameras.main.scrollY - delta / this.cameras.main.zoom;
    }
  }

  // Movement by WASD
  cameraMovementKeys(delta: number) {
    if (this.getCursors().up.isDown)
      this.cameras.main.scrollY = this.cameras.main.scrollY - delta / this.cameras.main.zoom;
    else if (this.getCursors().down.isDown)
      this.cameras.main.scrollY = this.cameras.main.scrollY + delta / this.cameras.main.zoom;

    if (this.getCursors().left.isDown)
      this.cameras.main.scrollX = this.cameras.main.scrollX - delta / this.cameras.main.zoom;
    else if (this.getCursors().right.isDown)
      this.cameras.main.scrollX = this.cameras.main.scrollX + delta / this.cameras.main.zoom;
  }

  // Zoom
  cameraZoom(deltaY: number) {
    if (!this.isOptionsMenuOpened())
      if (deltaY > 0)
        this.cameras.main.zoom = Phaser.Math.Clamp(this.cameras.main.zoom - GeneralData.ConfigData.ZOOM_AMOUNT, GeneralData.ConfigData.MIN_ZOOM, GeneralData.ConfigData.MAX_ZOOM);
      else if (deltaY < 0)
        this.cameras.main.zoom = Phaser.Math.Clamp(this.cameras.main.zoom + GeneralData.ConfigData.ZOOM_AMOUNT, GeneralData.ConfigData.MIN_ZOOM, GeneralData.ConfigData.MAX_ZOOM);
  }

  // --- SOUND ---
  configSound() {
    this.sound.removeAll();
    this.gameTheme = this.sound.add('Game', { volume: 0.3, loop: true });
    this.gameTheme.play();
    this.warTheme = null;
    this.attackEventTimer = null;

    this.events.on('attackEvent', () => {
      // Reset timer for every attack
      if (this.attackEventTimer)
        this.attackEventTimer.remove(false);
      this.attackEventTimer = this.time.delayedCall(15000, this.stopWarThemeAndResumeSong, [], this);

      this.gameTheme.stop();
      if (this.warTheme === null) {
        this.warTheme = this.sound.add('War', { volume: 0.3, loop: true });
        this.warTheme.play();
      }
    });
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

  // --- OTHER ---
  // Build NPC according to type
  npcConstructor(npcType: string) {
    const constructors = {
      "Archer_": Archer,
      "Goblin_": Goblin,
      "Soldier_": Soldier,
      "Villager_": Villager
    }
    return constructors[npcType];
  }

  // Spawn NPC
  spawnNPC(npcType: string, x: number, y: number, ownerColor: string) {
    if (this.p1.getColor() === ownerColor)
      new (this.npcConstructor(npcType))(this, x, y, this.p1);
    else
      new (this.npcConstructor(npcType))(this, x, y, this.p2);
  }

  removeResourceSpawner(spawner: ResourceSpawner) {
    this._map.removeResourceSpawner(spawner);
  }

  endGame(defeat: boolean) {
    this._selectedEntity = undefined;

    // Stop music
    this.sound.removeAll();

    // Change screen
    this.scene.pause();
    this.scene.pause("hud");
    this.scene.pause("settings");
    this.scene.run("endgame", { defeat: defeat, color: (defeat ? Client.getOthersColor() : Client.getMyColor()) });
  }

}