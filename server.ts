const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
import { Socket } from 'socket.io';

const PORT = 8081;
const MAX_PLAYERS = 2;

app.use(cors());

interface Lobby {
    code: string,
    isPrivate: boolean,
    players: {
        id: any,
        ready: boolean,
        color: ('Red' | 'Blue' | 'Purple' | 'Yellow')
    }[],
    availableColors: ('Red' | 'Blue' | 'Purple' | 'Yellow')[],
    readyPlayers: number,
    hasStarted: boolean
}

// Default empty lobby
function createDefaultLobby(): Lobby {
    return {
        code: "",
        isPrivate: false,
        players: [],
        availableColors: ['Red', 'Blue', 'Purple', 'Yellow'],
        readyPlayers: 0,
        hasStarted: false
    };
}

const lobbies: { [code: string]: Lobby } = {};

function assignColor(lobby: Lobby) {
    const randomIndex = Math.floor(Math.random() * lobby.availableColors.length);
    const selectedColor = lobby.availableColors[randomIndex];
    lobby.availableColors.splice(randomIndex, 1); // Remove the selected color
    return selectedColor;
}

function generateLobbyCode(): string {
    let code: string;
    do {
        code = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (lobbies[code] !== undefined);

    return code;
}

function joinLobby(socket: Socket, lobbyCode: string) {
    const lobby = lobbies[lobbyCode];

    const color = assignColor(lobby);

    // Add player data to lobby
    lobby.players.push({
        id: socket.id,
        color: color,
        ready: false
    });

    // Register player to lobby socket
    socket.join(lobbyCode);

    // Update all player's lobbies
    io.to(lobbyCode).emit('updateLobby', { lobby: lobby });
}

function removePlayerFromLobby(socket: Socket) {
    // Find lobbies where the player is present
    for (const lobbyCode in lobbies) {
        const lobby = lobbies[lobbyCode];
        const playerIndex = lobby.players.findIndex(player => player.id === socket.id);

        // If player is found in the lobby
        if (playerIndex !== -1) {
            // Remove player from the lobby
            const removedPlayer = lobby.players.splice(playerIndex, 1)[0];

            // Update readyPlayers count if the player was ready
            if (removedPlayer.ready) {
                lobby.readyPlayers--;
            }

            // Add player's color back to available colors
            if (removedPlayer.color) {
                lobby.availableColors.push(removedPlayer.color);
            }

            socket.leave(lobbyCode);

            if (lobby.readyPlayers === 1)
                // End game for remaining player
                io.to(lobbyCode).emit('end-game', removedPlayer.color);
            else
                // Update all players in the lobby
                io.to(lobbyCode).emit('updateLobby', { lobby: lobby });

            // If lobby becomes empty after the player leaves, remove the lobby
            if (lobby.players.length === 0) {
                delete lobbies[lobbyCode];
            }
        }
    }
}

io.on('connection', socket => {

    // ---- QUICK PLAY ----
    socket.on('quickPlay', () => {
        let availableLobby: Lobby | undefined = undefined;

        // Find a lobby with fewer than MAX_PLAYERS
        for (const lobbyCode in lobbies) {
            const lobby = lobbies[lobbyCode];
            if (lobby.players.length < MAX_PLAYERS && !lobby.isPrivate && !lobby.hasStarted) {
                availableLobby = lobby;
                break;
            }
        }

        if (availableLobby) {
            // Join available lobby
            joinLobby(socket, availableLobby.code);
            socket.emit('lobbyJoined', true);
        } else {
            // No available lobbies, create a new one
            const lobbyCode = generateLobbyCode(); // Function to generate a unique lobby code
            lobbies[lobbyCode] = createDefaultLobby();
            lobbies[lobbyCode].code = lobbyCode;
            // Join lobby
            joinLobby(socket, lobbyCode);
            socket.emit('lobbyJoined', true);
        }
    });

    // ---- CREATE GAME ----
    socket.on('createLobby', () => {
        const lobbyCode = generateLobbyCode(); // Function to generate a unique lobby code
        lobbies[lobbyCode] = createDefaultLobby();
        lobbies[lobbyCode].code = lobbyCode;
        // Make lobby private
        lobbies[lobbyCode].isPrivate = true;

        // Join lobby
        joinLobby(socket, lobbyCode);
        socket.emit('lobbyJoined', false);
    });

    // ---- JOIN GAME ----
    socket.on('joinLobby', (lobbyCode: string) => {
        const lobby = lobbies[lobbyCode];

        // If lobby full or doesn't exits, do nothing
        if (lobby && lobby.players.length < MAX_PLAYERS) {
            // Join lobby
            joinLobby(socket, lobbyCode);
            socket.emit('lobbyJoined', false);
        }
    });

    // ---- LEAVE LOBBY ----
    socket.on('leaveLobby', () => {
        removePlayerFromLobby(socket);
    });

    // ---- CHOOSE COLOR ----
    socket.on('chooseColor', (lobbyCode: string, color: ('Red' | 'Blue' | 'Purple' | 'Yellow')) => {
        const lobby = lobbies[lobbyCode];
        const playerIndex = lobby.players.findIndex(player => player.id === socket.id);
        if (playerIndex !== -1) {
            // Add original color to available colors
            lobby.availableColors.push(lobby.players[playerIndex].color);

            lobby.players[playerIndex].color = color;

            // Remove new color from available colors
            lobby.availableColors = lobby.availableColors.filter(availableColor => availableColor !== color);

            io.to(lobbyCode).emit('updateLobby', { lobby: lobby });
        }
    });

    // ---- READY ----
    socket.on('ready', (lobbyCode) => {
        const lobby = lobbies[lobbyCode];
        const playerIndex = lobby.players.findIndex(player => player.id === socket.id);
        if (playerIndex !== -1) {
            if (lobby.players[playerIndex].ready) {
                // Unready
                lobby.players[playerIndex].ready = false;
                lobby.readyPlayers--;
            } else {
                lobby.players[playerIndex].ready = true;
                lobby.readyPlayers++;
            }

            if (lobby.readyPlayers >= MAX_PLAYERS) {
                lobby.hasStarted = true;
            }

            io.to(lobbyCode).emit('updateLobby', { lobby: lobby });
        }
    });

    // ---- DISCONNECT ----
    socket.on('disconnect', () => {
        removePlayerFromLobby(socket);
    });

    // ---- SET NPC TARGET ----
    socket.on('npctarget', (lobbyCode, npc, position) => {
        io.to(lobbyCode).emit('npctarget', npc, position);
    });

    // ---- SPAWN ----
    socket.on('spawnNPC', (lobbyCode, npcType: any, x: number, y: number, ownerColor: string) => {
        io.to(lobbyCode).emit('spawnNPC', npcType, x, y, ownerColor);
    });

    // ---- ATTACK ----
    socket.on('attack', (lobbyCode: string, npcId: string, targetId: string) => {
        io.to(lobbyCode).emit('attack', npcId, targetId);
    });

    // ---- GATHER ----
    socket.on('gather', (lobbyCode: string, villagerId: string, resourceSpawnerId: string) => {
        io.to(lobbyCode).emit('gather', villagerId, resourceSpawnerId);
    });

    // ---- END GAME ----
    socket.on('end-game', (lobbyCode: string, playerColor: string) => {
        io.to(lobbyCode).emit('end-game', playerColor);
    });

    // ---- RETURN HOME ----
    socket.on('returnHome', (lobbyCode: string, playerColor: string) => {
        // Find lobbies where the player is present
        for (const lobbyCode in lobbies) {
            const lobby = lobbies[lobbyCode];
            const playerIndex = lobby.players.findIndex(player => player.id === socket.id);

            // If player is found in the lobby
            if (playerIndex !== -1) {
                delete lobbies[lobbyCode];
            }
        }
    });
});

// Handle environment
const environment = process.env.NODE_ENV || 'prod';
// --- DEV ---
if (environment === 'dev') {
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/dist/index.html');
    });

    // Serve other files using wildcard route
    app.get('/:file', (req, res) => {
        const fileName = req.params.file;
        res.sendFile(__dirname + '/dist/' + fileName);
    });
}
// --- PROD ---
else {
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/docs/index.html');
    });

    // Serve other files using wildcard route
    app.get('/:file', (req, res) => {
        const fileName = req.params.file;
        res.sendFile(__dirname + '/docs/' + fileName);
    });
}


// Listen
http.listen(PORT, () => {
    console.log('Server listening on port ', PORT);
});