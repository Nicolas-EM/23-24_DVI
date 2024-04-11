import * as Phaser from "phaser";
import { HudInfo, IconInfo } from "../../utils";
import * as Sprites from "../../../assets/sprites";
import Game from "../../scenes/Game";
import Villager from "../npcs/Villager";
import Player from "../Player";

export default abstract class ResourceSpawner extends Phaser.GameObjects.Sprite {
    // Attributes
    private _hudInfo: HudInfo;
    private _totalResources: number;
    private _remainingResources: number;
    private _resourceRate: number;

    static entityIdIndex = 0;
    protected _id: string;

    // Constructor
    constructor(scene: Game, x: number, y: number, texture: string | Phaser.Textures.Texture, iconInfo: IconInfo, resourceIcon: string, totalResources: number, resourceRate: number, frame?: string | number) {
        super(scene, x, y, texture, frame)

        this._totalResources = totalResources;
        this._remainingResources = totalResources;
        this._resourceRate = resourceRate;

        // Build hud info
        this._hudInfo = {
            entity: iconInfo,
            info: {
                remainingResources: this._remainingResources,
                resource: resourceIcon
            },
            actions: []
        }
        
        this.setInteractive( {pixelPerfect: true} );
        this.scene.physics.add.existing(this);
        
        this.on('pointerup', this.onClick, this);
        this.on('pointerdown', this.onDown, this);
        this.on('pointerover', this.onHover, this);
        this.on('pointerout', this.onOut, this);
    }

    private setAxeCursor(icon: any) {
        let entity = (<Game>(this.scene)).getSelectedEntity();

        if (entity && entity instanceof Villager && entity.belongsToMe()) {
            this.scene.input.setDefaultCursor(`url(${icon}), pointer`);
        }
    }

    onClick(pointer: Phaser.Input.Pointer): void {
        if(pointer.rightButtonReleased()) {
            this.setAxeCursor(Sprites.UI.Pointers.Axe);
        }

        if (pointer.leftButtonReleased()) {
            (<Game>(this.scene)).setSelectedEntity(this);
        }
    }

    onDown(pointer: Phaser.Input.Pointer): void { // TODO Se sobre pone el de game
        if (pointer.rightButtonDown()) {
            this.setAxeCursor(Sprites.UI.Pointers.Axe_Pressed);
        }
    }

    onHover(): void {
        let entity = (<Game>(this.scene)).getSelectedEntity();

        if(entity && entity instanceof Villager && entity.belongsToMe()) {
            this.scene.input.setDefaultCursor(`url(${Sprites.UI.Pointers.Axe}), pointer`);
        }
    }

    onOut(): void {
        this.scene.input.setDefaultCursor(`url(${Sprites.UI.Pointers.Pointer}), pointer`); 
    }

    getHudInfo(): HudInfo {
        return this._hudInfo;
    }

    getId(): string {
        return this._id;
    }

    protected abstract addResourceToPlayer(player: Player, amount: number);

    gather(player: Player)  {
        let amountGathered = 0;
        if(this._remainingResources - this._resourceRate <= 0) {
            amountGathered = this._remainingResources;
            this._remainingResources = 0;
        } else {
            amountGathered = this._resourceRate;
            this._remainingResources -= this._resourceRate;
        }
        
        // Update HUD
        (this._hudInfo.info as { remainingResources: number; resource: string; }).remainingResources = this._remainingResources;

        this.addResourceToPlayer(player, amountGathered);

        if(this._remainingResources <= 0)
            this.setDestroyed();
    }

    protected abstract setDestroyedFrame();

    setDestroyed(): void {
        if(this.body) {
            (this.scene as Game).removeResourceSpawner(this);
            this.setDestroyedFrame();
            this.destroy();
        }
    }
}