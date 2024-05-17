import Phaser from 'phaser';
import Client from '../client';
import { FontLoader } from '../utils';
import SceneUtils from "./sceneUtils"
import Menu from './Menu';


const colors = ['Red', 'Blue', 'Purple', 'Yellow'];


export default class Lobby extends Phaser.Scene {

  // Logical Attributes
  private isReady: boolean = false;
  private quickPlay: boolean;

  // UI Attributes
  lobbyText: Phaser.GameObjects.Text;
  playerListText: Phaser.GameObjects.Text;
  colorButtons: Phaser.GameObjects.Sprite[];
  
  // Constructor
  constructor() {
    super('lobby');
  }

  // Init
  init(data) {
    this.quickPlay = data.quickPlay;
    this.isReady = false;
  }

  // Create
  create() {
    
    // Init config
    Client.setScene(this);
    SceneUtils.setCursor(this);
    SceneUtils.stopScene(this, "menu");
    SceneUtils.settingsPauseConfig(this, "lobby");

    // Background
    const background = this.add.image(0, 0, 'Texture').setOrigin(0);
    background.displayWidth = this.sys.canvas.width;
    background.displayHeight = this.sys.canvas.height;

    // Leave lobby button
    let leaveButton = SceneUtils.addButtonIcon(this, undefined, {x: this.cameras.main.width - 120, y: 45}, "Button_Red", "Exit", -5, false, false, 55, 30, 55, 30);
    SceneUtils.addListenerButtonPos(leaveButton.img, "Button_Red", "Button_Red_Pressed", leaveButton.icon, -5, -2, this.leaveLobby);

    // Load font
    FontLoader.loadFonts(this, (self) => {

      // Lobby banner
      let lobbyContainer = this.add.container(SceneUtils.getMidX(self), 80);
      lobbyContainer.add(this.add.nineslice(0, 0, 'Horizontal', undefined, 275, 99, 35, 35, 0, 10));
      
      if (!this.quickPlay) {
        self.lobbyText = self.add.text(0, -2, `${Client.lobby.code}`, { fontSize: 30, color: "#000000", fontFamily: "Quattrocento" }).setOrigin(0.5);
        lobbyContainer.add(self.lobbyText);
      }
      else
        lobbyContainer.add(self.add.text(0, -2, 'QUICK PLAY', { fontSize: 24, color: "#000000", fontFamily: "Quattrocento" }).setOrigin(0.5));

      // List of players
      self.playerListText = self.add.text(self.cameras.main.width / 2, 200, 'Players:', { fontSize: 25, color: "#000000", fontFamily: "Quattrocento" }).setOrigin(0.5);

      // Choose color
      self.add.text(self.cameras.main.width / 2, 270, 'Choose Color:', { fontSize: 25, color: "#000000", fontFamily: "Quattrocento" }).setOrigin(0.5);

      self.colorButtons = [];
      let startX = SceneUtils.getMidX(self) - 150;

      // Buttons start disabled
      colors.forEach((color, index) => {
        const button = this.add.sprite(startX + index * 100, 350, `Soldier_${color}`).setInteractive({pixelPerfect: true});
        button.anims.play({ key: `soldierIdleRight${color}`, repeat: -1 , frameRate: 15 }, true);
        button.on('pointerup', (pointer: Phaser.Input.Pointer) => {
          if (pointer.leftButtonReleased()) {
            this.selectColor(color);
          }
        });   
        button.disableInteractive();
        button.setTint(0x808080); // Set grey tint
        this.colorButtons.push(button);
      });

      // Ready button
      let readyButton = SceneUtils.addButtonText(self, undefined, { x: SceneUtils.getMidX(self), y: 450 }, "Button_Yellow_Slides", -7, "READY", 22, "bold", undefined, true, 0.85);
      readyButton.img.setInteractive();
      readyButton.img.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer.leftButtonDown()) {
          if (!this.isReady)
            readyButton.img.setTexture("Button_Yellow_Slides_Pressed");
          else
            readyButton.img.setTexture("Button_Green_Slides_Pressed");
          readyButton.txt.setPosition(0, -4);
        }
      });
      readyButton.img.on('pointerup', (pointer: Phaser.Input.Pointer) => {
        if (pointer.leftButtonReleased()) {
          if (this.isReady)
            readyButton.img.setTexture("Button_Yellow_Slides");
          else
            readyButton.img.setTexture("Button_Green_Slides");
          readyButton.txt.setPosition(0, -7);
          self.readyUp();
        }
      });
    });
  }

  // --- UPDATE LOBBY ---
  updateLobby() {
    if (Client.lobby?.code) {
      if (!this.quickPlay)
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
      playerList += `${player.id === Client.socket.id ? "You" : `Player ${index + 1}`} - ${player.color}\n`;
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
        button.setInteractive({pixelPerfect: true});
        button.setTint(0x808080); // Set grey tint        
      } else {
        button.disableInteractive();
        button.clearTint(); // Remove any tint
      }
    });
  }

  // --- Other ---
  selectColor(color) {
    Client.chooseColor(color);
  }

  readyUp() {
    this.isReady = !this.isReady;
    Client.readyUp();
  }

  startGame() {  
    this.isReady = false;
    this.scene.start('game', { mapId: 'desert' });
  }

  leaveLobby = () => {   
    Client.leaveLobby();
    this.scene.start('menu');
  }

}