import * as WebFont from 'webfontloader';

// Información de un lobby
export default interface lobbyData {
    code: string;
    players: { id: string, color: string, ready: boolean }[],
    availableColors: ('Red' | 'Blue' | 'Purple' | 'Yellow')[],
    readyPlayers: 0
}

// Información que tiene un icono en el HUD
export interface IconInfo {
    name: string;
    width: number;
    height: number;
}

// Otra información del HUD
export interface HudInfo {
    entity: IconInfo,
    info: {
        isMine: boolean,
        health: number,
        totalHealth: number,
        damage?: number
    } | {
        remainingResources: number,
        resource: string,
    },
    actions: {run: () => void, actionFrame: string}[]
}

// Array de recursos de un jugador
export interface Resources {
    wood: number;
    food: number;
    gold: number;
}

// Font loader
export class FontLoader {
    static loadFonts(scene: Phaser.Scene, callback: (self) => void): void {
        WebFont.load({
            google: {
                families: ['Bellefair', 'Quattrocento', 'Times New Roman']
            },
            active: callback(scene)
        });
    }
}