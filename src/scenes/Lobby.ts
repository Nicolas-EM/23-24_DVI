import Phaser from 'phaser';
import Client from '../client';

const colors = ['Red', 'Blue', 'Purple', 'Yellow'];

export default class Lobby extends Phaser.Scene {
  lobbyText: Phaser.GameObjects.Text;
  playerListText: Phaser.GameObjects.Text;
  colorButtons: Phaser.GameObjects.Sprite[];
  readyButton: Phaser.GameObjects.Text;

  constructor() {
    super('lobby');
  }

  create() {
    Client.setScene(this);
    
    // Settings button
    this.scene.run('settings', { scene: "lobby" });

    // Background
    const background = this.add.image(0, 0, 'Texture').setOrigin(0);
    background.displayWidth = this.sys.canvas.width;
    background.displayHeight = this.sys.canvas.height;

    // Display lobby UI elements (e.g., player list, color selection, ready button)
    this.lobbyText = this.add.text(this.cameras.main.width / 2, 100, 'Lobby', { fontSize: '32px' }).setOrigin(0.5);

    this.playerListText = this.add.text(this.cameras.main.width / 2, 200, '', { fontSize: '24px' }).setOrigin(0.5);

    this.add.text(this.cameras.main.width / 2, 300, 'Choose Color:', { fontSize: '24px' }).setOrigin(0.5);

    this.colorButtons = [];
    let startX = this.cameras.main.width / 2 - 150;

    // Buttons start disabled
    colors.forEach((color, index) => {
      const button = this.add.sprite(startX + index * 100, 350, `Villager_${color}`).setInteractive();
      button.on('pointerdown', () => this.selectColor(color));
      button.disableInteractive();
      button.setTint(0x808080); // Set grey tint
      this.colorButtons.push(button);
    });

    // Example code to handle ready button
    this.readyButton = this.add.text(this.cameras.main.width / 2, 450, 'Ready', { fontSize: '24px' }).setOrigin(0.5).setInteractive();
    this.readyButton.on('pointerdown', () => this.readyUp());

    // Sound
    this.sound.add('TroopsTheme', { loop: true, volume: 0.5}).play();
  }

  update(time: number, delta: number) {
    if (Client.lobby?.code) {
      this.lobbyText.setText(`Lobby - ${Client.lobby.code}`);
      this.updatePlayers(Client.lobby.players);
      this.updateAvailableColors(Client.lobby.availableColors);

      if (Client.lobby.readyPlayers === Client.lobby.players.length && Client.lobby.players.length > 1)
        this.startGame();
    }
  }

  updatePlayers(players: { id: string, color: string }[]) {
    let playerList = 'Players:\n';
    players.forEach((player, index) => {
      playerList += `${player.id === Client.socket.id ? "You" : `Player ${index}`} - ${player.color}\n`;
    });
    this.playerListText.setText(playerList);
  }

  updateAvailableColors(availableColors: string[]) {
    this.colorButtons.forEach((button, index) => {
      // Check if the button's color is in the list of available colors
      const color = colors[index];
      const isEnabled = availableColors.includes(color);

      // Enable or disable the button accordingly
      if (isEnabled) {
        button.setInteractive();
        button.clearTint(); // Remove any tint
      } else {
        button.disableInteractive();
        button.setTint(0x808080); // Set grey tint
      }
    });
  }

  selectColor(color) {
    Client.chooseColor(color);
  }

  readyUp() {
    // Enable or disable the button accordingly
    if (this.readyButton.tint == 0x00ff00) {
      this.readyButton.clearTint(); // Remove any tint
      Client.readyUp();
    } else {
      this.readyButton.setTint(0x00ff00); // Set grey tint
      Client.readyUp();
    }
  }

  startGame() {
    this.scene.start('game', { mapId: 'desert' });
  }
}
