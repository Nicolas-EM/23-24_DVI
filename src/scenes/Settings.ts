import * as Phaser from 'phaser';
import { FontLoader } from '../utils';
import Client from '../client';
import SceneUtils from "./sceneUtils"


export default class Settings extends Phaser.Scene {

    // Logical attributes
    private sceneBase: string;

    // UI Attributes
    private optionsContainer: Phaser.GameObjects.Container;
    private optionsBackground: Phaser.GameObjects.Rectangle;
    private optionsButton: Phaser.GameObjects.Image;
    private surrenderButton: {img: Phaser.GameObjects.Image, txt: Phaser.GameObjects.Text};

    // Constructor
    constructor() {
        super({ key: 'settings' });
    }

    // Init
    init(sceneBase) {
        this.sceneBase = sceneBase.scene;
    }

    // Create
    create() {
        // Options button
        let optionsButton = SceneUtils.addButtonIcon(this, undefined, {x: this.cameras.main.width - 55, y: 45}, "Button_Yellow", "Settings", 0, false, false, 55, 55, 55, 55);
        this.optionsButton = optionsButton.img;
        SceneUtils.addListenerButtonTexture(optionsButton.img, "Button_Yellow", "Button_Yellow_Pressed", optionsButton.icon, "Settings", "Settings_Pressed", this.openOptionsMenu);

        this.createOptionsMenu();
    }

    createOptionsMenu() {
        // Darken background
        this.optionsBackground = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.6);
        this.optionsBackground.setOrigin(0);
        this.optionsBackground.setVisible(false);

        this.optionsContainer = this.add.container(SceneUtils.getMidX(this), SceneUtils.getMidY(this));
        this.optionsContainer.setVisible(false);

        // Menu
        this.optionsContainer.add(this.add.nineslice(0, 0, "Vertical", undefined, 385, 420, 75, 75, 75, 75));

        // Controls
        this.createControls();

        // Load font
        FontLoader.loadFonts(this, (self) => {
            
            // Surrender button
            this.surrenderButton = SceneUtils.addButtonText(self, self.optionsContainer, { x: -60, y: 115 }, "Button_Red_Slide", -5, "SURRENDER", undefined, undefined, "#FFFFFF", true, 0.7);
            SceneUtils.addListenerButtonPos( this.surrenderButton.img, "Button_Red_Slide", "Button_Red_Slides_Pressed",  this.surrenderButton.txt, -5, -2, () => {
                Client.surrenderOrLose(Client.getMyColor())
            });
            this.surrenderButton.img.setVisible(false);
            this.surrenderButton.txt.setVisible(false);
            

            // Silence button
            let soundImg = "Sound_On";
            let soundY = 0;
            if (this.sound.mute) {
                soundImg = "Sound_Off";
                soundY = -3;
            }
            let silenceButton = SceneUtils.addButtonIcon(self, self.optionsContainer, {x: 58, y: 115}, "Button_Yellow", soundImg, soundY, true, false, 0.78, 45, undefined, 45);
            silenceButton.img.setInteractive();
            silenceButton.img.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                if (pointer.leftButtonDown())
                    if (this.sound.mute)
                        silenceButton.icon.setPosition(0, 0);
                    else
                        silenceButton.icon.setPosition(0, 3);
                    silenceButton.img.setTexture("Button_Yellow_Pressed");
            });
            silenceButton.img.on("pointerup", (pointer: Phaser.Input.Pointer) => {
                if (pointer.leftButtonReleased()) {
                    if (this.sound.mute) {
                        silenceButton.icon.setTexture("Sound_On");
                        silenceButton.icon.setPosition(0, 0);
                    }
                    else {
                        silenceButton.icon.setTexture("Sound_Off");
                        silenceButton.icon.setPosition(0, -3);
                    }
                    silenceButton.img.setTexture("Button_Yellow");
                    this.muteUnmute();
                }
            });

            // Fullscreen button
            let fullscreenButton = SceneUtils.addButtonIcon(self, self.optionsContainer, {x: 105, y: 115}, "Button_Yellow", "Selected", -6, true, false, 0.78, 22, undefined, 22);
            SceneUtils.addListenerButtonPos(fullscreenButton.img, "Button_Yellow", "Button_Yellow_Pressed", fullscreenButton.icon, -6, -3, this.changeFullscreen);

            // Close button
            let closeButton = SceneUtils.addButtonIcon(self, self.optionsContainer, {x: 105, y: -122}, "Button_Red", "X", -1, true, false, 0.8, 40, undefined, 40);
            SceneUtils.addListenerButtonTexture(closeButton.img, "Button_Red", "Button_Red_Pressed", closeButton.icon, "X", "X_Pressed", this.closeOptionsMenu);         

        });
    }

    createControls() {        
        // Load font
        FontLoader.loadFonts(this, (self) => {

            // Title
            let titleContainer = self.add.container(-45, -125);
            titleContainer.add(SceneUtils.addImageScale(self, {x: 0, y: 0}, "Carved_Rectangle_Shadow", 0.75));
            titleContainer.add(self.add.text(0, 0, "CONTROLS", { color: '#000000', fontFamily: "Quattrocento", fontSize: 20, fontStyle: "bold" }).setOrigin(0.5));
            self.optionsContainer.add(titleContainer);

            // Move around the map
            self.optionsContainer.add(self.add.text(-115, -90, "Move around the map:", { color: '#000000', fontFamily: "Quattrocento", fontSize: 16 }));
            
            // WASD keys
            SceneUtils.addButtonText(self, self.optionsContainer, {x: -65, y: -45}, "Button_Disable", -1, "W", 14, "bold", undefined, true, 0.5);
            SceneUtils.addButtonText(self, self.optionsContainer, {x: -95, y: -15}, "Button_Disable", -1, "A", 15, "bold", undefined, true, 0.5);
            SceneUtils.addButtonText(self, self.optionsContainer, {x: -65, y: -15}, "Button_Disable", -1, "S", 15, "bold", undefined, true, 0.5);
            SceneUtils.addButtonText(self, self.optionsContainer, {x: -35, y: -15}, "Button_Disable", -1, "D", 15, "bold", undefined, true, 0.5);
            
            // Map arrows
            let mapContainer = self.add.container(45, -30);
            mapContainer.add(self.add.nineslice(0, 0, "Carved_Big", undefined, 115, 65, 5, 5, 5, 5));
            mapContainer.add(SceneUtils.addImageFilter(self, {x: 0, y: 0}, "Pointer", 10, 15));
            mapContainer.add(SceneUtils.addImageFilter(self, {x: 0, y: -18}, "Exit", 18, 16).setAngle(90));  // Up
            mapContainer.add(SceneUtils.addImageFilter(self, {x: 0, y: 18}, "Exit", 18, 16).setAngle(-90));  // Down
            mapContainer.add(SceneUtils.addImageFilter(self, {x: -30, y: 0}, "Exit", 18, 16));  // Left
            mapContainer.add(SceneUtils.addImageFilter(self, {x: 30, y: 0}, "Exit", -18, 16));  // Right
            self.optionsContainer.add(mapContainer);

            // Left click
            self.optionsContainer.add(SceneUtils.addImageFilter(self, {x: -105, y: 31}, "LMB", 20, 25));
            self.optionsContainer.add(self.add.text(-23, 30, "Select / Spawn NPC", { color: '#000000', fontFamily: "Quattrocento", fontSize: 15 }).setOrigin(0.5));
            // Right click
            self.optionsContainer.add(SceneUtils.addImageFilter(self, {x: -105, y: 61}, "RMB", 20, 25));
            self.optionsContainer.add(self.add.text(-13, 60, "Move / Attack / Gather", { color: '#000000', fontFamily: "Quattrocento", fontSize: 15 }).setOrigin(0.5));
        
        });
    }

    // --- Settings actions ---
    openOptionsMenu = () => {
        this.optionsButton.disableInteractive();
        this.optionsBackground.setVisible(true);
        this.optionsContainer.setVisible(true);
        this.scene.get(this.sceneBase).events.emit('menuOpened');
    }

    closeOptionsMenu = () => {
        this.optionsButton.setInteractive();
        this.optionsBackground.setVisible(false);
        this.optionsContainer.setVisible(false);
        this.scene.get(this.sceneBase).events.emit('menuClosed');
    }

    changeFullscreen = () => {
        // Fullscreen ON
        if (document.fullscreenElement) document.exitFullscreen();
        // Fullscreen OFF
        else document.getElementById("game")!.requestFullscreen();
    }

    muteUnmute() {
        if (!this.sound.mute)
            this.sound.mute = true;
        else
            this.sound.mute = false;
    }

    // --- SETTERS ---
    setSceneBase(sceneBase: string) {
        this.sceneBase = sceneBase;
        if (sceneBase === "game") {
            this.surrenderButton.img.setVisible(true);
            this.surrenderButton.txt.setVisible(true);
        }
    }

}