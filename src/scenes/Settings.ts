import * as Phaser from 'phaser';
import * as Sprites from "../../assets/sprites";
import { FontLoader } from '../utils';


export default class Settings extends Phaser.Scene {

    private sceneBase: string;

    private optionsContainer: Phaser.GameObjects.Container;
    private optionsBackground: Phaser.GameObjects.Rectangle;
    private optionsButton: Phaser.GameObjects.Image;

    constructor() {
        super({ key: 'settings' });
    }

    init(sceneBase) {
        this.sceneBase = sceneBase.scene;
    }

    create() {
        // Cursor
        this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            this.input.setDefaultCursor(`url(${Sprites.UI.Pointers.Pointer_Pressed}), pointer`);
        });
        this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
            this.input.setDefaultCursor(`url(${Sprites.UI.Pointers.Pointer}), pointer`);
        });

        // Options button
        let optionsContainer = this.add.container(this.cameras.main.width - 55, 45);
        this.optionsButton = this.add.image(0, 0, 'Button_Yellow');
        this.optionsButton.setDisplaySize(55, 55);
        this.optionsButton.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        optionsContainer.add(this.optionsButton);
        let settingsIcon = this.add.image(0, 0, 'Settings');
        settingsIcon.setDisplaySize(55, 55);
        settingsIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        optionsContainer.add(settingsIcon);
        this.optionsButton.setInteractive();
        this.optionsButton.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown()) {
                this.optionsButton.setTexture("Button_Yellow_Pressed");
                settingsIcon.setTexture("Settings_Pressed");
            }
        });
        this.optionsButton.on("pointerup", (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonReleased()) {
                this.optionsButton.setTexture("Button_Yellow");
                settingsIcon.setTexture("Settings");
                this.openOptionsMenu();
            }
        });

        this.createOptionsMenu();
    }

    createOptionsMenu() {
        // Darken background
        this.optionsBackground = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.6);
        this.optionsBackground.setOrigin(0);
        this.optionsBackground.setVisible(false);

        const midX = this.cameras.main.width / 2;
        const midY = this.cameras.main.height / 2;

        this.optionsContainer = this.add.container(midX, midY);

        // Menu
        let menu = this.add.nineslice(0, 0, "Vertical", undefined, 385, 420, 75, 75, 75, 75);
        this.optionsContainer.add(menu);

        // Controls
        this.createControls();

        // Load font
        FontLoader.loadFonts(this, (self) => {
            if (self.sceneBase === "game") {
                // Surrender button
                let surrenderBtnImg = self.add.image(-125, 95, "Button_Red_Slide");
                surrenderBtnImg.scale = 0.7;
                surrenderBtnImg.setOrigin(0);
                let surrenderBtnText = self.add.text(-105, 103, "SURRENDER", { fontFamily: "Quattrocento" });
                let surrenderBtnContainer = self.add.container(0, 0);
                surrenderBtnContainer.add(surrenderBtnImg);
                surrenderBtnContainer.add(surrenderBtnText);
                self.optionsContainer.add(surrenderBtnContainer);
            }

            // Silence button
            let silenceBtnImg = self.add.image(32, 90, "Button_Yellow");
            silenceBtnImg.scale = 0.8;
            silenceBtnImg.setOrigin(0);
            let silenceIcon = self.add.image(57, 114, "Sound_On");
            if (this.sound.mute) {
                silenceIcon.setTexture("Sound_Off");
                silenceIcon.setPosition(57, 112);
            }            
            silenceIcon.setDisplaySize(45, 45);
            silenceIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            let silenceBtnContainer = self.add.container(0, 0);
            silenceBtnContainer.add(silenceBtnImg);
            silenceBtnContainer.add(silenceIcon);

            // Silence function
            silenceBtnImg.setInteractive();
            silenceBtnImg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                if (pointer.leftButtonDown()) {
                    if (this.sound.mute) {
                        silenceIcon.setPosition(57, 114);
                    }
                    else {
                        silenceIcon.setPosition(57, 119);
                    }
                    silenceBtnImg.setTexture("Button_Yellow_Pressed");
                }                
            });
            silenceBtnImg.on("pointerup", (pointer: Phaser.Input.Pointer) => {
                if (pointer.leftButtonReleased()) {
                    if (this.sound.mute) {
                        silenceIcon.setTexture("Sound_On");
                        silenceIcon.setPosition(57, 114);
                    }
                    else {
                        silenceIcon.setTexture("Sound_Off");
                        silenceIcon.setPosition(57, 112);
                    }
                    silenceBtnImg.setTexture("Button_Yellow");
                    this.muteUnmute();
                }
            });
            // Fullscreen button
            let fullscreenBtnImg = self.add.image(80, 90, "Button_Yellow");
            fullscreenBtnImg.scale = 0.8;
            fullscreenBtnImg.setOrigin(0);
            let fullscreenIcon = self.add.image(105, 110, "Selected");
            fullscreenIcon.setDisplaySize(22, 22);
            fullscreenIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            let fullscreenBtnContainer = self.add.container(0, 0);
            fullscreenBtnContainer.add(fullscreenBtnImg);
            fullscreenBtnContainer.add(fullscreenIcon);
            // Fullscreen function
            fullscreenBtnImg.setInteractive();
            fullscreenBtnImg.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
                if (pointer.leftButtonDown()) {
                    fullscreenIcon.setPosition(105, 112);
                    fullscreenBtnImg.setTexture("Button_Yellow_Pressed");
                }
            });
            fullscreenBtnImg.on("pointerup", (pointer: Phaser.Input.Pointer) => {
                if (pointer.leftButtonReleased()) {
                    fullscreenIcon.setPosition(105, 110);
                    fullscreenBtnImg.setTexture("Button_Yellow");
                    this.changeFullscreen();
                }
            });

            // Close button
            let closeBtnImg = self.add.image(80, -150, "Button_Red");
            closeBtnImg.scale = 0.8;
            closeBtnImg.setOrigin(0);
            let closeIcon = self.add.image(105, -125, "X");
            closeIcon.setDisplaySize(40, 40);
            closeIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            let closeBtnContainer = self.add.container(0, 0);
            closeBtnContainer.add(closeBtnImg);
            closeBtnContainer.add(closeIcon);
            // Close function
            closeBtnImg.setInteractive();
            closeBtnImg.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
                if (pointer.leftButtonDown()) {
                    closeBtnImg.setTexture("Button_Red_Pressed");
                    closeIcon.setTexture("X_Pressed");
                }
            });
            closeBtnImg.on("pointerup", (pointer: Phaser.Input.Pointer) => {
                if (pointer.leftButtonReleased()) {
                    closeBtnImg.setTexture("Button_Red");
                    closeIcon.setTexture("X");
                    this.closeOptionsMenu();
                }
            });

            self.optionsContainer.add(silenceBtnContainer);
            self.optionsContainer.add(fullscreenBtnContainer);
            self.optionsContainer.add(closeBtnContainer);
            self.optionsContainer.setVisible(false);
        });
    }

    createControls() {
        FontLoader.loadFonts(this, (self) => {
            // Title
            let titleIcon = self.add.image(0, 0, "Carved_Rectangle_Shadow");
            titleIcon.scale = 0.75;
            let titleText = self.add.text(0, 0, "CONTROLS", { color: '#000000', fontFamily: "Quattrocento", fontSize: 20, fontStyle: "bold" }).setOrigin(0.5);
            let titleContainer = self.add.container(-45, -125);
            titleContainer.add(titleIcon);
            titleContainer.add(titleText);
            self.optionsContainer.add(titleContainer);

            // Move around the map
            self.optionsContainer.add(self.add.text(-115, -90, "Move around the map:", { color: '#000000', fontFamily: "Quattrocento", fontSize: 16 }));
            // Move controls
            self.optionsContainer.add(self.add.rectangle(-115, -65, 220, 70).setOrigin(0));
            // WASD keys
            self.createKey(-65, -45, "W");
            self.createKey(-95, -15, "A");
            self.createKey(-65, -15, "S");
            self.createKey(-35, -15, "D");
            // Map arrows
            let mapContainer = self.add.container(45, -30);
            let mapIcon = self.add.nineslice(0, 0, "Carved_Big", undefined, 115, 65, 5, 5, 5, 5);
            let pointer = self.add.image(0, 0, "Pointer");
            pointer.setDisplaySize(10, 15);
            pointer.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            let arrowUp = (self.add.image(0, -18, "Exit").setAngle(90)).setDisplaySize(18, 16);
            arrowUp.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            let arrowDown = (self.add.image(0, 18, "Exit").setAngle(-90)).setDisplaySize(18, 16);
            arrowDown.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            let arrowLeft = (self.add.image(-30, 0, "Exit")).setDisplaySize(18, 16);
            arrowLeft.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            let arrowRight = (self.add.image(30, 0, "Exit")).setDisplaySize(-18, 16);
            arrowRight.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            mapContainer.add(mapIcon);
            mapContainer.add(pointer);
            mapContainer.add(arrowUp);
            mapContainer.add(arrowDown);
            mapContainer.add(arrowLeft);
            mapContainer.add(arrowRight);
            self.optionsContainer.add(mapContainer);

            // Left click
            let leftClick = self.add.image(-105, 31, "LMB");
            leftClick.setDisplaySize(20, 25);
            leftClick.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            self.optionsContainer.add(leftClick);
            self.optionsContainer.add(self.add.text(-23, 30, "Select / Spawn NPC", { color: '#000000', fontFamily: "Quattrocento", fontSize: 15 }).setOrigin(0.5));
            // Right click
            let rightClick = self.add.image(-105, 61, "RMB");
            rightClick.setDisplaySize(20, 25);
            rightClick.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            self.optionsContainer.add(rightClick);
            self.optionsContainer.add(self.add.text(-13, 60, "Move / Attack / Gather", { color: '#000000', fontFamily: "Quattrocento", fontSize: 15 }).setOrigin(0.5));
        });
    }

    createKey(posX, posY, key) {
        let keyIcon = this.add.image(0, 0, "Button_Disable");
        keyIcon.scale = 0.5;
        let keyText = this.add.text(0, -2, key, { color: '#000000', fontFamily: "Quattrocento", fontSize: 15, fontStyle: "bold" }).setOrigin(0.5);
        let keyContainer = this.add.container(posX, posY);
        keyContainer.add(keyIcon);
        keyContainer.add(keyText);
        this.optionsContainer.add(keyContainer);
    }

    openOptionsMenu() {
        this.optionsButton.disableInteractive();
        this.optionsBackground.setVisible(true);
        this.optionsContainer.setVisible(true);
        this.scene.get(this.sceneBase).events.emit('menuOpened');
    }

    closeOptionsMenu() {
        this.optionsButton.setInteractive();
        this.optionsBackground.setVisible(false);
        this.optionsContainer.setVisible(false);
        this.scene.get(this.sceneBase).events.emit('menuClosed');
    }

    changeFullscreen() {
        if (document.fullscreenElement) {
            // exitFullscreen is only available on the Document object.
            document.exitFullscreen();
        } else {
            const el = document.getElementById("game")!;
            el.requestFullscreen();
        }
    }

    muteUnmute() {
        if (!this.sound.mute) {
            this.sound.mute = true;
        }
        else {
            this.sound.mute = false;
        }
    }

}