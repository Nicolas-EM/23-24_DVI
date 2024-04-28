import * as WebFont from 'webfontloader';

// Lobby data
export default interface lobbyData {
    code: string;
    players: { id: string, color: string, ready: boolean }[],
    availableColors: ('Red' | 'Blue' | 'Purple' | 'Yellow')[],
    readyPlayers: 0
}

// Info of an icon in HUD
export interface IconInfo {
    name: string;
    width: number;
    height: number;
}

// Other HUD info
export interface HudInfo {
    entity: IconInfo,
    info: {
        isMine: boolean,
        health: number,
        totalHealth: number,
        damage?: number,
        queueIcon?: string,
        queueTime?: number
    } | {
        remainingResources: number,
        resource: string,
    },
    actions: {run: () => void, actionFrame: string}[]
}

// Resources
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
                families: ['Quattrocento', 'Times New Roman']
            },
            active: callback(scene)
        });
    }
}