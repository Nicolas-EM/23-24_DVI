import Building from './buildings/Building';
import NPC from './npcs/NPC';
import { Resources } from "../utils";
import PlayerEntity from './PlayerEntity';
import Hud from '../scenes/Hud';
import GeneralData from "../magic_numbers/general_data";
import Client from '../client';


export default class Player {

  // Attributes
  private _buildings: Building[] = [];
  private _npcs: NPC[] = [];
  private _entityMap: Map<string, PlayerEntity> = new Map();
  private _resources: Resources;
  private _maxPopulation: number;
  private _entityId = 0; // Number of the last entity owned by player

  // Constructor
  constructor(private _id: string, private _color: string, private _scene: Phaser.Scene) {
    this._resources = GeneralData.InitData.INIT_RESOURCES;
    this._maxPopulation = GeneralData.InitData.MAX_POPULATION;
  }

  // --- Getters ---
  getColor(): string {
    return this._color;
  }

  getPlayerEntityById(id: string): PlayerEntity | undefined {
    return this._entityMap[id];
  }

  getNPCs(): NPC[] {
    return this._npcs;
  }

  getNPCById(id: string): NPC | undefined {
    return this._entityMap[id];
  }

  getBuildings(): Building[] {
    return this._buildings;
  }

  getBuildingById(id: string): Building | undefined {
    return this._entityMap[id];
  }

  getGold(): number {
    return this._resources.gold;
  }

  getWood(): number {
    return this._resources.wood;
  }

  getFood(): number {
    return this._resources.food;
  }

  getMaxPopulation(): number {
    return this._maxPopulation;
  }

  getNextEntityId(): number {
    return this._entityId++;
  }

  // --- Add/remove ---
  addNPC(npc: NPC) {
    this._npcs.push(npc);
    this._entityMap[npc.getId()] = npc;
  }  

  removeNPC(npcToRemove: NPC) {
    this._entityMap[npcToRemove.getId()] = undefined;
    this._npcs = this._npcs.filter(npc => npc.getId() !== npcToRemove.getId());
  }

  addBuilding(building: Building) {
    this._buildings.push(building);
    this._entityMap[building.getId()] = building;
  }
  
  removeBuilding(buildingToRemove: Building) {
    this._entityMap[buildingToRemove.getId()] = undefined;
    this._buildings = this._buildings.filter(building => building.getId() !== buildingToRemove.getId());
  }

  // --- Resources ---
  hasResource(resources: Resources): boolean {
    if(this._resources.gold >= resources.gold && this._resources.wood >= resources.wood && this._resources.food >= resources.food)
      return true;
    
    return false;
  }

  addResources(resource: Resources) {
    this._resources.gold += resource.gold;
    this._resources.wood += resource.wood;
    this._resources.food += resource.food;

    if (this.getColor() === Client.getMyColor())
      (<Hud>(this._scene.scene.get("hud"))).updateResources({ wood: this._resources.wood, food: this._resources.food, gold: this._resources.gold });
  }

  pay(resources: Resources) {
    this._resources.gold -= resources.gold;
    this._resources.wood -= resources.wood;
    this._resources.food -= resources.food;

    if(this.getColor() === Client.getMyColor())
      (<Hud>(this._scene.scene.get("hud"))).updateResources({ wood: this._resources.wood, food: this._resources.food, gold: this._resources.gold });
  }

}
