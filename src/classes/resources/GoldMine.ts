import ResourceSpawner from "./ResourceSpawner";;
import ResourcesData from "../../magic_numbers/resources_data";
import Game from "../../scenes/Game";
import Player from "../Player";
import NPCsData from "../../magic_numbers/npcs_data";

export default class GoldMine extends ResourceSpawner {
    private activeTimer: Phaser.Time.TimerEvent = undefined;

    constructor(scene: Game, x: number, y: number, frame?: string | number) {
        super(scene, x, y, ResourcesData.Gold.ICON_INFO.name, ResourcesData.Gold.ICON_INFO, ResourcesData.Gold.ICON, ResourcesData.Gold.CAPACITY, ResourcesData.Gold.RATE, frame);
    
        this._id = `GoldMine_${ResourceSpawner.entityIdIndex++}`;
    }

    protected addResourceToPlayer(player: Player, amount: number) {
        player.addResources({gold: amount, wood: 0, food: 0});
    }

    gather(player: Player)  {
        this.setFrame(1);

        // Remove the previous timer if it exists
        if (this.activeTimer) {
            this.activeTimer.remove();
        }

        // Create a new timer to reset the frame after the cooldown period
        this.activeTimer = this.scene.time.addEvent({
            delay: NPCsData.Villager.GATHER_COOLDOWN * 1000 * 2,
            callback: this.resetFrame,
            callbackScope: this,
            loop: false
        });

        super.gather(player);
    }

    resetFrame() {
        console.log("frame reset");
        this.setFrame(0);
        this.activeTimer = undefined;
    }

    protected setDestroyedFrame() {
        const x = this.scene.add.sprite(this.x, this.y, this.texture.key, 2);
        x.setDepth(this.depth);
    }
}