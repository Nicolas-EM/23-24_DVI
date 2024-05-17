import * as Phaser from 'phaser';
import Client from '../client';
import { FontLoader } from '../utils';
import SceneUtils from "./sceneUtils";

const WIN_TITLE = "YOU WON !";
const LOSE_TITLE = "YOU LOST";

export default class EndGame extends Phaser.Scene {

  // Logical attributes
  private defeat: Boolean;
  private color: String;

  // Constructor
  constructor() {
    super({ key: 'endgame' });
  }

  // Init
  init(data) {
    this.defeat = data.defeat;
    this.color = data.color;
  }

  // Create
  create() {

    // Init config
    Client.setScene(this);
    SceneUtils.setCursor(this);
    SceneUtils.stopScene(this, "settings");

    // Darken background
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7).setOrigin(0);

    // End banner
    let endContainer = this.add.container(SceneUtils.getMidX(this), SceneUtils.getMidY(this));
    endContainer.add(SceneUtils.addImageScale(this, {x: 0, y: 0}, "Carved_Big", 1.85));
    this.createEndBanner(endContainer);

    // Sound
    if (this.defeat) {
      this.sound.add('DefeatTheme', { volume: 0.3 }).play();
    }
    else {
      this.sound.add('VictoryTheme', { volume: 0.2 }).play();
    }

  }

  // --- Aux functions ---
  createEndBanner(endContainer: Phaser.GameObjects.Container) {
    let endTitle = this.defeat ? LOSE_TITLE : WIN_TITLE;
    let endText = this.buildEndText();

    // Lose
    if (this.defeat)
      endContainer.add(SceneUtils.addImageScale(this, {x: 0, y: 10}, "Death", 1.4, undefined, 6));
    
    // Win
    else {
      endContainer.add(SceneUtils.addImageScale(this, {x: -15, y: 34}, `Villager_${this.color}`, 0.65, undefined, 25));
      endContainer.add(SceneUtils.addImageScale(this, {x: 45, y: 27}, `Archer_${this.color}`, -0.65, 0.65, 30));
      endContainer.add(SceneUtils.addImageScale(this, {x: -47, y: 37}, `Soldier_${this.color}`, 0.65, undefined, 13));
      endContainer.add(SceneUtils.addImageScale(this, {x: 15, y: 40}, `Goblin_${this.color}`, -0.65, 0.65, 16));
    }

    // Load font
    FontLoader.loadFonts(this, (self) => {

      // End title & text
      endContainer.add(self.add.text(0, -110, endTitle, { color: '#000000', fontFamily: "Quattrocento", fontStyle: "bold", fontSize: 30 }).setOrigin(0.5));
      endContainer.add(self.add.text(0, -55, endText,
        { color: '#000000', fontFamily: "Quattrocento", wordWrap: { width: 280, useAdvancedWrap: true }, align: "center", fontSize: 16 })
        .setOrigin(0.5));

      // Return home button
      let exitButton = self.add.nineslice(0, 5, "Button_Yellow_Slides", undefined, 210, 60, 15, 15, 0, 5).setScale(0.85, 0.85);
      let exitText = self.add.text(0, 0, "RETURN HOME", { color: '#000000', fontFamily: "Quattrocento", fontStyle: "bold", fontSize: 17 }).setOrigin(0.5);
      let exitContainer = self.add.container(0, 110);
      SceneUtils.addListenerButtonPos(exitButton, "Button_Yellow_Slides", "Button_Yellow_Slides_Pressed", exitText, 0, 2, this.returnHome);
      
      exitContainer.add(exitButton);
      exitContainer.add(exitText);
      endContainer.add(exitContainer);
    });

  }

  buildEndText(): String {
    let pron1 = this.color == "Yellow" ? "She" : "He";
    let pron2 = this.color == "Yellow" ? "her" : "him";

    let kingName;
    if (this.color == "Blue")
      kingName = "Charles Bluebird";
    else if (this.color == "Red")
      kingName = "Vincent Redwood";
    else if (this.color == "Yellow")
      kingName = "Margaret Yellowstone";
    else
      kingName = "Jabari Purpleheart";

    if (this.defeat)
      return `${kingName} won the war. Now you will have to bow before ${pron2}. Better luck next time...`;
    else
      return `${kingName} has oficially conquered Eliora thanks to your help! ${pron1} will forever be in debt to you.`;
  }

  returnHome = () => {
    // Sound
    this.sound.removeAll();

    // Return to home menu
    Client.returnHome();
    SceneUtils.stopScene(this, "game");
    SceneUtils.stopScene(this, "hud");
    this.scene.start('menu');
  }

}