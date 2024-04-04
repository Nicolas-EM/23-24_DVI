import ResourceSpawner from "./ResourceSpawner";;
import ResourcesData from "../../magic_numbers/resources_data";
import Game from "../../scenes/Game";
import Player from "../Player";

export default class GoldMine extends ResourceSpawner {

    constructor(scene: Game, x: number, y: number, frame?: string | number) {
        super(scene, x, y, ResourcesData.Gold.ICON_INFO.name, ResourcesData.Gold.ICON_INFO, ResourcesData.Gold.ICON, ResourcesData.Gold.CAPACITY, ResourcesData.Gold.RATE, frame);
    
        this._id = `GoldMine_${ResourceSpawner.entityIdIndex++}`;
    }

    protected addResourceToPlayer(player: Player, amount: number) {
        player.addResources({gold: amount, wood: 0, food: 0});
    }
}