import Building from './buildings/Building';
import NPC from './npcs/NPC';
import { Resources } from "../utils";
import VillagerHouse from './buildings/VillagerHouse';
import PlayerEntity from './PlayerEntity';

export default class Player {
  private buildings: Building[] = [];
  private npcs: NPC[] = [];
  private entityMap: Map<string, PlayerEntity> = new Map();
  // TODO: Default starting resources
  private resources: Resources = {
    wood: 100,
    food: 100,
    gold: 100
  };
  // TODO: magic number - starting population
  private maxPopulation: number = 10;
  
  /**
   * Creates a new player instance.
   * @param {string} id - The unique identifier for the player.
   * @param {number} color - The color associated with the player.
   * @param {Building[]} buildings - An array of buildings owned by the player.
   * @param {NPC[]} npcs - An array of player0s units (troops, villagers...)
   * @param {Resources} resources - Player's resources
   * @param {NPC[]} selectedGameObjects - selected entitites (as dragged, clicked, etc...)
   * @param {Scene  } scene - The scene where the player is created.
   */
  constructor(private id: string, private color: string, private scene: Phaser.Scene) {
    console.log(`Player color ${color}`);
  }

  getColor(): string {
    return this.color;
  }

  getPlayerEntityById(id: string): PlayerEntity | undefined {
    return this.entityMap[id];
  }

  addNPC(npc: NPC) {
    this.npcs.push(npc);
    this.entityMap[npc.getId()] = npc;
  }

  getNPCs(): NPC[] {
    return this.npcs;
  }

  removeNPC(npcToRemove: NPC) {
    this.entityMap[npcToRemove.getId()] = undefined;
    this.npcs = this.npcs.filter(npc => npc.getId() !== npcToRemove.getId());
  }

  getNPCById(id: string): NPC | undefined {
    return this.entityMap[id];
  }

  getBuildingById(id: string): Building | undefined {
    return this.entityMap[id];
  }

  removeBuilding(buildingToRemove: Building) {
    this.entityMap[buildingToRemove.getId()] = undefined;
    this.buildings = this.buildings.filter(building => building.getId() !== buildingToRemove.getId());
  }

  addBuilding(building: Building) {
    this.buildings.push(building);
    this.entityMap[building.getId()] = building;

    if(typeof building === typeof VillagerHouse) {
      this.maxPopulation += 5;
    }
  }

  getBuildings(): Building[] {
    return this.buildings;
  }

  getGold(): number {
    return this.resources.gold;
  }

  getWood(): number {
    return this.resources.wood;
  }

  getFood(): number {
    return this.resources.food;
  }

  hasResource(resources: Resources): boolean {
    if(this.resources.gold >= resources.gold && this.resources.wood >= resources.wood && this.resources.food >= resources.food)
      return true;
    
    return false;
  }

  pay(resources: Resources) {
    this.resources.gold -= resources.gold;
    this.resources.wood -= resources.wood;
    this.resources.food -= resources.food;
  }

  getMaxPopulation(): number {
    return this.maxPopulation;
  }
}
