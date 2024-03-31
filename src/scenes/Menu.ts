import * as Phaser from 'phaser';
import Client from '../client';
import * as Sprites from "../../assets/sprites";
import { FontLoader } from '../utils';


export default class Menu extends Phaser.Scene {
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

    // Settings button
    this.scene.run('settings', { scene: "menu" });

    // Background
    this.cameras.main.setBackgroundColor("#47aba9");

    // Clouds
    this.addCloud(0, 150, 90, 0.4);
    this.addCloud(3, 20, 180, 0.5);
    this.addCloud(1, 230, 410, 0.6);
    this.addCloud(2, -40, 540, 0.6);
    this.addCloud(2, 950, 100, 0.7);
    this.addCloud(0, 800, 300, 0.4);
    this.addCloud(1, 1050, 420, 0.5);
    this.addCloud(3, 810, 510, 0.6);

    // Create buttons
    this.addButton("QUICK PLAY", this.cameras.main.height / 2 - 90, this.quickPlay);
    this.addButton("CREATE GAME", this.cameras.main.height / 2, this.createLobby);
    this.addButton("JOIN GAME", this.cameras.main.height / 2 + 90, this.joinLobby);

    // Sound
    this.sound.add('TroopsTheme', { loop: true, volume: 0.5}).play();
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

  addCloud(texture: number, posX: number, posY: number, scale: number): void {
    let cloud = this.add.image(posX, posY, "Clouds", texture);
    cloud.scale = scale;
    cloud.alpha = 0.75;
  }

  addButton(textButton: string, posY: number, actionButton: Function): void {
    let menuButton = this.add.image(0, 0, "Button_Blue_Slide").setInteractive();
    menuButton.scale = 1.25;

    // Add text with font
    FontLoader.loadFonts(this, (self) => {
      let menuText = self.add.text(0, 0,
        textButton, { fontFamily: "Quattrocento", color: "#000000", fontSize: 25, fontWeigth: "bold" })
        .setOrigin(0.5, 0.9);

      let menuContainer = self.add.container(self.cameras.main.width / 2, posY)
      menuContainer.add(menuButton);
      menuContainer.add(menuText);
      menuButton.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer.leftButtonDown()) {
          menuButton.setTexture("Button_Blue_Slides_Pressed");
          menuText.setPosition(0, 5);
        }
      });
      menuButton.on('pointerup', (pointer: Phaser.Input.Pointer) => {
        if (pointer.leftButtonReleased()) {
          menuButton.setTexture("Button_Blue_Slide");
          menuText.setPosition(0, 0);
          actionButton();
        }
      });
    });   
  }

}