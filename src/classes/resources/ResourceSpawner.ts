import * as Phaser from "phaser";
import { HudInfo, IconInfo } from "../../utils";
import Game from "../../scenes/Game";

export default class ResourceSpawner extends Phaser.GameObjects.Sprite {
    // Attributes
    private _hudInfo: HudInfo;
    private _totalResources: number;
    private _remainingResources: number;
    private _resourceRate: number;

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
        this.on('pointerup', this.onClick, this);
    }

    onClick(pointer: Phaser.Input.Pointer): void {
        if (pointer.leftButtonReleased()) {
            (<Game>(this.scene)).setSelectedEntity(this);
        }
    }

    getHudInfo(): HudInfo {
        return this._hudInfo;
    }
}