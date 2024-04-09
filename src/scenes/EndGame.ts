import * as Phaser from 'phaser';
import Client from '../client';
import * as Sprites from "../../assets/sprites";
import { FontLoader } from '../utils';

const WIN_TITLE = "YOU WON !";
const LOSE_TITLE = "YOU LOST";

export default class EndGame extends Phaser.Scene {
  
    private defeat: Boolean;
    private color: String;
  
    constructor() {
    super({ key: 'endgame' });
  }

  init(data) {
    this.defeat = data.defeat;
    this.color = data.color;
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

    const midX = this.cameras.main.width / 2;
    const midY = this.cameras.main.height / 2;

    let endBackground = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7);
    endBackground.setOrigin(0);

    let endContainer = this.add.container(midX, midY);

    // Banner
    let endBanner = this.add.image(0, 0, "Carved_Big");
    endBanner.scale = 1.85;
    endContainer.add(endBanner);

    this.createEndBanner(endContainer);

    // Sound
    if (this.defeat) {
      this.sound.add('DefeatTheme', { volume: 0.3 }).play();
    }
    else {
      this.sound.add('VictoryTheme', { volume: 0.2 }).play();
    }
    
  }

  createEndBanner(endContainer: Phaser.GameObjects.Container) {
    let endTitle = this.defeat ? LOSE_TITLE : WIN_TITLE;
    let endText = this.buildText();

    // Lose
    if (this.defeat) {
        let dead = this.add.image(0, 10, "Death", 6);
        dead.scale = 1.4;
        endContainer.add(dead);
    }
    // Win
    else {
        let villager = this.add.image(-15, 34, `Villager_${this.color}`, 25);
        villager.scale = 0.65;
        let archer = this.add.image(45, 27, `Archer_${this.color}`, 30);
        archer.setScale(-0.65, 0.65);
        let soldier = this.add.image(-47, 37, `Soldier_${this.color}`, 13);   
        soldier.scale = 0.65;
        let goblin = this.add.image(15, 40, `Goblin_${this.color}`, 16);
        goblin.setScale(-0.65, 0.65);
        
        endContainer.add(villager);
        endContainer.add(archer);
        endContainer.add(soldier);
        endContainer.add(goblin);
    }

    // Load font
    FontLoader.loadFonts(this, (self) => {
        let title = self.add.text(0, -110, endTitle, { color: '#000000', fontFamily: "Quattrocento", fontStyle: "bold", fontSize: 30 }).setOrigin(0.5);
        let text = self.add.text(0, -55, endText, 
            { color: '#000000', fontFamily: "Quattrocento", fontStyle: "bold", wordWrap: { width: 280, useAdvancedWrap: true }, align: "center", fontSize: 16 })
            .setOrigin(0.5);

        // Return home button
        let exitButton = self.add.nineslice(0, 5, "Button_Yellow_Slides", undefined, 210, 60, 15, 15, 0, 5).setInteractive();
        exitButton.scale = 0.85;
        let exitText = self.add.text(-60, -10, "RETURN HOME", { color: '#000000', fontFamily: "Quattrocento", fontStyle: "bold", fontSize: 17 });
        let exitContainer = self.add.container(0, 110);
        exitContainer.add(exitButton);
        exitContainer.add(exitText);

        // Return home action
        exitButton.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown()) {
                exitButton.setTexture("Button_Yellow_Slides_Pressed");
                exitText.setPosition(-60, -7);
            }
        });
        exitButton.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonReleased())
                this.returnHome();
        });

        endContainer.add(title);
        endContainer.add(text);
        endContainer.add(exitContainer);
    });

  }

  buildText(): String {
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

  returnHome() {
    // Sound
    this.sound.removeAll();

    // Return to home menu
    Client.returnHome();
    this.scene.stop();
    this.scene.stop("game");
    this.scene.stop("hud");
    this.scene.stop("settings");
    this.scene.start('menu');
  }

}