import * as Phaser from 'phaser';
import Boot from './scenes/Boot';
import Menu from './scenes/Menu';
import Lobby from './scenes/Lobby';
import JoinLobby from './scenes/JoinLobby';
import Game from './scenes/Game';
import { PhaserNavMeshPlugin } from "phaser-navmesh";
import Hud from './scenes/Hud';
import Settings from './scenes/Settings';
import EndGame from './scenes/EndGame';

let config: Phaser.Types.Core.GameConfig = {
  title: 'Troops',
  parent: "game",  // ID div (canvas)
  type: Phaser.AUTO,
  width: 1000,
  height: 563,
  disableContextMenu: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
  },
  pixelArt: true,
  plugins: {
    scene: [
      {
        key: "PhaserNavMeshPlugin",
        plugin: PhaserNavMeshPlugin,
        mapping: "navMeshPlugin",
        start: true,
      },
    ],
  },
  scene: [Boot, Menu, Lobby, JoinLobby, Game, Hud, Settings, EndGame],  // Scenes
  physics: {
    default: 'arcade',
    arcade: {
      debug: process.env.NODE_ENV === "dev"
    }
  }
};

new Phaser.Game(config);