import ResourceSpawner from "./ResourceSpawner";;
import ResourcesData from "../../magic_numbers/resources_data";
import Game from "../../scenes/Game";
import Player from "../Player";
import NPCsData from "../../magic_numbers/npcs_data";

export default class GoldMine extends ResourceSpawner {
    private timeSinceLastGather = 0;

    constructor(scene: Game, x: number, y: number, frame?: string | number) {
        super(scene, x, y, ResourcesData.Gold.ICON_INFO.name, ResourcesData.Gold.ICON_INFO, ResourcesData.Gold.ICON, ResourcesData.Gold.CAPACITY, ResourcesData.Gold.RATE, frame);
    
        this._id = `GoldMine_${ResourceSpawner.entityIdIndex++}`;
    }

    protected addResourceToPlayer(player: Player, amount: number) {
        player.addResources({gold: amount, wood: 0, food: 0});
    }

    gather(player: Player)  {
        this.timeSinceLastGather = 0;
        this.setFrame(1);
        super.gather(player);
    }

    protected setDestroyedFrame() {
        const x = this.scene.add.sprite(this.x, this.y, this.texture.key, 2);
        x.setDepth(this.depth);
    }

    update(time: number, delta: number) {
        this.timeSinceLastGather += delta / 2100;
        if(this.timeSinceLastGather >= NPCsData.Villager.GATHER_COOLDOWN) {
            this.setFrame(0);
        }

        super.update(time, delta);
    }
}