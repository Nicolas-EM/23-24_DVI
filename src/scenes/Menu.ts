import * as Phaser from 'phaser';
import Client from '../client';
import { FontLoader } from '../utils';
import SceneUtils from "./sceneUtils"
import Lobby from './Lobby';


export default class Menu extends Phaser.Scene {
  
  // Constructor
  constructor() {
    super({ key: 'menu' });
  }

  // Create
  create() {

    // Init config
    Client.setScene(this);
    SceneUtils.setCursor(this);
    SceneUtils.stopScene(this, "lobby");
    SceneUtils.stopScene(this, "endgame");
    this.scene.run('settings', { scene: "menu" });
    SceneUtils.settingsPauseConfig(this, "menu");

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
    this.addButton("QUICK PLAY", this.cameras.main.height / 2 - 90, () => { Client.quickPlay(); });
    this.addButton("CREATE GAME", this.cameras.main.height / 2, () => { Client.createLobby(); });
    this.addButton("JOIN GAME", this.cameras.main.height / 2 + 90, () => {
      this.scene.pause();
      this.scene.run("join-lobby");
    });

    // On resume
    this.events.on("resume", () => {
      Client.setScene(this);
    });

    // Sound
    if (!this.sound.get('TroopsTheme') || !this.sound.get('TroopsTheme').isPlaying)
      this.sound.add('TroopsTheme', { loop: true, volume: 0.3 }).play();
  }

  // --- Aux functions ---
  startLobby(quickPlay: boolean) {
    // Stop join-lobby if necessary
    if (this.scene.isActive("join-lobby"))
      SceneUtils.stopScene(this, "join-lobby");
    // Start lobby
    this.scene.start('lobby', { quickPlay: quickPlay });
  }

  addCloud(texture: number, posX: number, posY: number, scale: number): void {
    let cloud = this.add.image(posX, posY, "Clouds", texture);
    cloud.scale = scale;
    cloud.alpha = 0.75;
  }

  addButton(textButton: string, posY: number, actionButton: Function): void {
    FontLoader.loadFonts(this, (self) => {
      let menuButton = SceneUtils.addButtonText(self, undefined, { x: SceneUtils.getMidX(self), y: posY }, "Button_Blue_Slide", -10, textButton, 24, undefined, undefined, true, 1.25);
      SceneUtils.addListenerButtonPos(menuButton.img, "Button_Blue_Slide", "Button_Blue_Slides_Pressed", menuButton.txt, -10, -5, actionButton);
    });
  }

}