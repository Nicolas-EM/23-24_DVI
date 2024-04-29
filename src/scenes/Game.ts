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
  private _npcGroup: Phaser.Physics.Arcade.Group;
  private _buildingGroup: Phaser.Physics.Arcade.Group;

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

    // Reset things to default values
    this.optionsMenuOpened = false;
    this._selectedEntity = undefined;
    this.pointerInMap = true;

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

    // Collisions
    this._npcGroup = this.physics.add.group();
    this._buildingGroup = this.physics.add.group();
    // Define overlap
    this.physics.add.collider(this._npcGroup, this._npcGroup, this.handleCollide);
    this.physics.add.collider(this._npcGroup, this._buildingGroup, this.handleCollide);

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
  }

  private handlGameObjectDown = (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, stopPropagation) => {
    if (this.optionsMenuOpened || !this.pointerInMap || !this._selectedEntity || !pointer.rightButtonDown())
      return;

    if (this._selectedEntity instanceof AttackUnit && gameObject instanceof PlayerEntity) {
      if (!(gameObject as PlayerEntity).belongsToMe())
        Client.attackOrder(this._selectedEntity.getId(), gameObject.getId());
    } else if (this._selectedEntity instanceof Villager && gameObject instanceof ResourceSpawner) {
      Client.gatherOrder(this._selectedEntity.getId(), gameObject.getId());
    }
  }

  private handlePointerDown = (pointer: Phaser.Input.Pointer) => {
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
      Client.setNpcTarget(this._selectedEntity.getId(), pointerPosition);
    }
  }

  private handlePointerUp = (pointer: Phaser.Input.Pointer) => {
    if (this.input.manager.defaultCursor.includes("/pointer_pressed")) {
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

    // If not NPC, position should not update
    if (this._selectedEntity && this._selectedEntity instanceof NPC) {
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

  getNPCGroup(): Phaser.Physics.Arcade.Group {
    return this._npcGroup;
  }

  getBuildingGroup(): Phaser.Physics.Arcade.Group {
    return this._buildingGroup;
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

  removeSelectedEntity(entity: PlayerEntity | ResourceSpawner) {
    if (this._selectedEntity === entity) {
      this.setSelectedEntity(undefined);
    }
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

  setVillagerGatherTarget(villagerId: string, resourceSpawnerId: string) {
    const villager = this.getEntityById(villagerId);
    const spawner = this.getResourceSpawnerById(resourceSpawnerId);
    if (villager && villager instanceof Villager && spawner) {
      villager.setGatherTarget(spawner);
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

  getResourceSpawnerById(id: string): ResourceSpawner {
    return this._map.getResourceSpawnerById(id);
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

  // Check if a collision must be handled
  checkCollision(npc: Phaser.Physics.Arcade.Sprite, collider: Phaser.Physics.Arcade.Sprite): boolean {
    return (
      npc instanceof NPC &&  // Always true
      !npc.getCollisionProcessed() &&  // If collision isn't already being processed
      (
        npc instanceof Villager ||  // A villager always collides with other PlayerEntities
        (
          npc instanceof AttackUnit &&
          collider instanceof PlayerEntity &&  // Always true
          (
            !(npc as AttackUnit).getAttackTarget() ||  // Attacker has no target
            (npc as AttackUnit).getAttackTarget() != (collider as PlayerEntity).getId()  // The target is not the one they're colliding with
          )
        )
      )
    );
  }

  // Calculate new target to avoid a PlayerEntity
  calculateNewTarget(npc: Phaser.Physics.Arcade.Sprite, collider: Phaser.Physics.Arcade.Sprite, oldTarget: Phaser.Math.Vector2) {
    let currentPosition = new Phaser.Math.Vector2(npc.x, npc.y);
    let oldDirection = new Phaser.Math.Vector2(oldTarget.x, oldTarget.y).subtract(currentPosition);
    let oldAngle = Phaser.Math.RadToDeg(oldDirection.angle());
    let newAngleRad = Phaser.Math.DegToRad(oldAngle + 90);
    let newX = currentPosition.x + Math.cos(newAngleRad) * (Math.max(collider.width, collider.height) + 32);
    let newY = currentPosition.y + Math.sin(newAngleRad) * (Math.max(collider.width, collider.height) + 32);


    return [newX, newY];
  }


  // Handle collision
  handleCollide = (npc: Phaser.Physics.Arcade.Sprite, collider: Phaser.Physics.Arcade.Sprite) => {
    if (npc instanceof NPC && this.checkCollision(npc, collider)) {

      // Collision is being processed
      (npc as NPC).setCollisionProcessed(true);

      // Save old movement target
      let oldTarget = undefined;
      if (npc instanceof NPC) {
        console.log("Soy NPC");
        oldTarget = (npc as NPC).getMovementTarget();
        if (!oldTarget) return; // If not moving do nothing
      }
      // Save old gather target if Villager
      let oldGatherTarget = undefined;
      if (npc instanceof Villager) {
        oldGatherTarget = (npc as Villager).getGatherTarget();
        // Remove attackTarget from unit
        if (oldGatherTarget) {
          (npc as Villager).setGatherTarget(undefined);
        }
      }
      // Save old attack target if AttackUnit
      let oldAttackTarget = undefined;
      if (npc instanceof AttackUnit) {
        oldAttackTarget = (npc as AttackUnit).getAttackTarget();
        // Remove attackTarget from unit
        if (oldAttackTarget) {
          (npc as AttackUnit).setAttackTarget(undefined);
        }
      }

      // Calculate new target
      let newTarget = this.calculateNewTarget(npc, collider, oldTarget);
      (npc as NPC).setMovementTarget(new Phaser.Math.Vector2(newTarget[0], newTarget[1]));


      // Wait and return to original target
      this.time.addEvent({
        delay: 900,
        callback: () => {
          (npc as NPC).setCollisionProcessed(false);
          if (npc instanceof NPC)
            (npc as NPC).setMovementTarget(new Phaser.Math.Vector2(oldTarget.x, oldTarget.y));
          if (npc instanceof AttackUnit)
            (npc as AttackUnit).setAttackTarget(oldAttackTarget);
          if (npc instanceof Villager)
            (npc as Villager).setGatherTarget(this.getResourceSpawnerById(oldGatherTarget));          
        },
        callbackScope: this
      });
    }
  }
}