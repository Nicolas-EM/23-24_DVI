import * as Phaser from 'phaser';
import Client from '../client';
import * as Sprites from "../../assets/sprites";

export default class Menu extends Phaser.Scene {
  quickPlayButton: Phaser.GameObjects.Text;
  createLobbyButton: Phaser.GameObjects.Text;
  joinLobbyButton: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'menu' });
  }

  create() {
    Client.setScene(this);

    // Cursor
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.input.setDefaultCursor(`url(${Sprites.UI.Pointers.Pointer_Pressed}), pointer`);
    });
    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      this.input.setDefaultCursor(`url(${Sprites.UI.Pointers.Pointer}), pointer`);
    });

    this.quickPlayButton = this.add.text(this.cameras.main.width / 2, 100, 'Quick Play', { fontSize: '24px' }).setOrigin(0.5).setInteractive();
    this.quickPlayButton.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonReleased()) {
        this.quickPlay();
      }
    });

    this.createLobbyButton = this.add.text(this.cameras.main.width / 2, 200, 'Create Lobby', { fontSize: '24px' }).setOrigin(0.5).setInteractive();
    this.createLobbyButton.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonReleased()) {
        this.createLobby();
      }
    });

    this.joinLobbyButton = this.add.text(this.cameras.main.width / 2, 300, 'Join Lobby', { fontSize: '24px' }).setOrigin(0.5).setInteractive();
    this.joinLobbyButton.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonReleased()) {
        this.joinLobby();
      }
    });
  }

  startLobby() {
    this.scene.start('lobby');
  }

  quickPlay() {
    Client.quickPlay();
  }

  createLobby() {
    Client.createLobby();
  }

  joinLobby() {
    Client.joinLobby(globalThis.lobbyCode);
  }
}