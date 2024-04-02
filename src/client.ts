import { io, Socket } from 'socket.io-client';
import lobbyData from './utils';
import Game from './scenes/Game';
import Menu from './scenes/Menu';

export default class Client {
    static socket: Socket = io(process.env.NODE_ENV == "production" ? "https://troops-prod-yadfj.ondigitalocean.app/": "http://localhost:8081");
    static lobby: lobbyData;
    static scene: Phaser.Scene;

    static init() {
        Client.socket.on('lobbyCreated', (code) => {
            Client.joinLobby(code);
        });

        Client.socket.on('updateLobby', (data: {lobby: lobbyData}) => {
            Client.lobby = data.lobby;
        });

        Client.socket.on('npctarget', (npcId: string, position: Phaser.Math.Vector2) => {
            if (Client.scene.scene.isActive('game')) {
                (<Game>(Client.scene)).setNpcTarget(npcId, position);
            }
        });

        Client.socket.on('spawnNPC', (npcType: string, x: number, y: number, ownerColor: string) => {
            if (Client.scene.scene.isActive('game')) {
                (<Game>(Client.scene)).spawnNPC(npcType, x, y, ownerColor);
            }
        });

        Client.socket.on('attack', (npcId: string, targetId: string) => {
            if (Client.scene.scene.isActive('game')) {
                (<Game>(Client.scene)).setNPCAttackTarget(npcId, targetId);
            }
        });
    }

    static setScene(scene: Phaser.Scene) {
        Client.scene = scene;
    }

    static getMyColor(): string {
        return Client.lobby.players.find(player => player.id === Client.socket.id)?.color;
    }

    static sendTest(): void {
        console.log("test sent");
        Client.socket.emit('test');
    }

    // Menu functions
    static quickPlay(): void {
        Client.socket.emit('quickPlay');
    }

    static createLobby(): void {
        Client.socket.emit('createLobby');
    }

    // Lobby Functions
    static joinLobby(code: string): void {
        (<Menu>(Client.scene)).startLobby();
        Client.socket.emit('joinLobby', code);
    }

    static chooseColor(color: string): void {
        Client.socket.emit('chooseColor', Client.lobby.code, color);
    }

    static readyUp(): void {
        Client.socket.emit('ready', Client.lobby.code);
    }

    // Game Functions
    static setNpcTarget(npcId: string, position: Phaser.Math.Vector2):void {
        Client.socket.emit('npctarget', Client.lobby.code, npcId, position);
    }

    static spawnNpc(npcType: string, x: number, y: number, ownerColor: string) {
        Client.socket.emit('spawnNPC', Client.lobby.code, npcType, x, y, ownerColor);
    }

    static attackOrder(npcId: string, targetId: string) {
        Client.socket.emit('attack', Client.lobby.code, npcId, targetId);
    }
}

Client.init();