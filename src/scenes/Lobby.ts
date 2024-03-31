import Phaser from 'phaser';
import Client from '../client';
import { FontLoader } from '../utils';

const colors = ['Red', 'Blue', 'Purple', 'Yellow'];

export default class Lobby extends Phaser.Scene {
  lobbyText: Phaser.GameObjects.Text;
  playerListText: Phaser.GameObjects.Text;
  colorButtons: Phaser.GameObjects.Sprite[];

  readyButton: Phaser.GameObjects.Image;
  isReady: boolean = false;

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

    // Lore button
    let loreContainer = this.add.container(65, 60);
    let loreButton = this.add.image(0, 0, 'Button_Yellow');
    loreButton.setDisplaySize(80, 80);
    loreButton.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    loreContainer.add(loreButton);
    let loreIcon = this.add.image(0, -10, 'Book');
    loreIcon.setDisplaySize(40, 40);
    loreIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    loreContainer.add(loreIcon);
    this.events.on('menuOpened', () => {
      loreButton.disableInteractive();
    });
    this.events.on('menuClosed', () => {
      loreButton.setInteractive();
    });

    // Leave lobby button
    let leaveContainer = this.add.container(this.cameras.main.width - 120, 45);
    let leaveButton = this.add.image(0, 0, 'Button_Red');
    leaveButton.setDisplaySize(55, 55);
    leaveButton.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    leaveContainer.add(leaveButton);
    let leaveIcon = this.add.image(0, -5, 'Exit');
    leaveIcon.setDisplaySize(30, 30);
    leaveIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    leaveContainer.add(leaveIcon);
    this.events.on('menuOpened', () => {
      leaveButton.disableInteractive();
    });
    this.events.on('menuClosed', () => {
      leaveButton.setInteractive();
    });

    // Load font
    FontLoader.loadFonts(this, (self) => {
      // Display lobby UI elements (e.g., player list, color selection, ready button)
      let banner = this.add.nineslice(0, 0, 'Horizontal', undefined, 275, 99, 35, 35, 0, 10);
      let lobbyContainer = this.add.container(self.cameras.main.width / 2, 80);
      self.lobbyText = self.add.text(0, 0, 'Lobby', { fontSize: 30, color: "#000000", fontFamily: "Quattrocento" }).setOrigin(0.5);
      lobbyContainer.add(banner);
      lobbyContainer.add(self.lobbyText);

      self.playerListText = self.add.text(self.cameras.main.width / 2, 200, '', { fontSize: 25, color: "#000000", fontFamily: "Quattrocento" }).setOrigin(0.5);

      self.add.text(self.cameras.main.width / 2, 270, 'Choose Color:', { fontSize: 25, color: "#000000", fontFamily: "Quattrocento" }).setOrigin(0.5);

      self.colorButtons = [];
      let startX = self.cameras.main.width / 2 - 150;

      // Buttons start disabled
      colors.forEach((color, index) => {
        const button = this.add.sprite(startX + index * 100, 350, `Soldier_${color}`).setInteractive();
        button.on('pointerdown', () => this.selectColor(color));
        button.disableInteractive();
        button.setTint(0x808080); // Set grey tint
        this.colorButtons.push(button);
      });

      // Ready button
      let readyContainer = self.add.container(self.cameras.main.width / 2, 450);
      self.readyButton = self.add.image(0, 0, "Button_Yellow_Slides").setInteractive();
      self.readyButton.scale = 0.85;
      let readyText = self.add.text(-35, -20, 'READY', { color: "#000000", fontFamily: "Quattrocento", fontSize: 22, fontWeigth: "bold" })
      self.readyButton.on('pointerdown', (pointer: Phaser.Input.Pointer) => { 
        if (pointer.leftButtonDown()) {
          if (!this.isReady)
            self.readyButton.setTexture("Button_Yellow_Slides_Pressed");
          else
            self.readyButton.setTexture("Button_Green_Slides_Pressed");
          readyText.setPosition(-35, -15);
        }
      });
      self.readyButton.on('pointerup', (pointer: Phaser.Input.Pointer) => { 
        if (pointer.leftButtonReleased()) {
          if (this.isReady)
            self.readyButton.setTexture("Button_Yellow_Slides");
          else
            self.readyButton.setTexture("Button_Green_Slides");
          readyText.setPosition(-35, -20);
          self.readyUp();
        }
      });
      readyContainer.add(self.readyButton);
      readyContainer.add(readyText);
    });

  }

  update(time: number, delta: number) {
    if (Client.lobby?.code) {
      this.lobbyText.setText(`${Client.lobby.code}`);
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
    this.isReady = !this.isReady;
    Client.readyUp();
  }

  startGame() {
    this.scene.start('game', { mapId: 'desert' });
  }
}
