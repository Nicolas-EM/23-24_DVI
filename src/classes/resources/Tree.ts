import ResourceSpawner from "./ResourceSpawner";
import ResourcesData from "../../magic_numbers/resources_data";
import Game from "../../scenes/Game";
import Player from "../Player";

export default class Tree extends ResourceSpawner {

    constructor(scene: Game, x: number, y: number, frame?: string | number) {
        super(scene, x, y, ResourcesData.Wood.ICON_INFO.name, ResourcesData.Wood.ICON_INFO, ResourcesData.Wood.ICON, ResourcesData.Wood.CAPACITY, ResourcesData.Wood.RATE, frame);
    
        this.anims.play("treeIdle");

        this._id = `Tree_${ResourceSpawner.entityIdIndex++}`;
    }

    protected addResourceToPlayer(player: Player, amount: number) {
        player.addResources({gold: 0, wood: amount, food: 0});
    }
}