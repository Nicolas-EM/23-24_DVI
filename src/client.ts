import { io, Socket } from 'socket.io-client';
import lobbyData from './utils';
import Game from './scenes/Game';
import Menu from './scenes/Menu';

export default class Client {
    static socket: Socket = io(process.env.NODE_ENV !== "dev" ? "https://troops-prod-yadfj.ondigitalocean.app/": "http://localhost:8081");
    static lobby: lobbyData;
    static scene: Phaser.Scene;

    static init() {
        Client.socket.on('lobbyCreated', (code, quickPlay) => {
            (<Menu>(Client.scene)).startLobby(quickPlay);
            Client.joinLobby(code);
        });

        Client.socket.on('updateLobby', (data: {lobby: lobbyData}) => {
            if (Client.scene.scene.isActive('join-lobby')) {
                (Client.scene).scene.stop();
            }
            if (!Client.scene.scene.isActive('lobby')) {
                (Client.scene).scene.start("lobby");
            }
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

        Client.socket.on('gather', (villagerId: string, resourceSpawnerId: string) => {
            if (Client.scene.scene.isActive('game')) {
                (<Game>(Client.scene)).setVillagerGatherTarget(villagerId, resourceSpawnerId);
            }
        });

        Client.socket.on('end-game', (playerColor: string) => {
            if (Client.scene.scene.isActive('game')) {
                (<Game>(Client.scene)).endGame(playerColor === Client.getMyColor());
            }
        });

        Client.socket.on('setDestroyed', (entityId: string) => {
            if (Client.scene.scene.isActive('game')) {
                (<Game>(Client.scene)).destroyEntity(entityId);
            }
        });
    }

    static setScene(scene: Phaser.Scene) {
        Client.scene = scene;
    }

    static getMyColor(): string {
        return Client.lobby.players.find(player => player.id === Client.socket.id)?.color;
    }

    static getOthersColor(): string {
        return Client.lobby.players.find(player => player.id !== Client.socket.id)?.color;
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
        Client.socket.emit('joinLobby', code);
    }

    static leaveLobby() {
        Client.socket.emit('leaveLobby');
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

    static surrenderOrLose(playerColor: string) {
        Client.socket.emit('end-game', Client.lobby.code, playerColor);
    }

    static returnHome() {
        Client.socket.emit('returnHome');
    }

    static gatherOrder(villagerId: string, resourceSpawnerId: string) {
        Client.socket.emit('gather', Client.lobby.code, villagerId, resourceSpawnerId);
    }

    static setDestroyed(entityId: string) {
        Client.socket.emit('setDestroyed', Client.lobby.code, entityId);
    }
}

Client.init();