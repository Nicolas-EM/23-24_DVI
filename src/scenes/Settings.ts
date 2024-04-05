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
        let menu = this.add.nineslice(0, 0, "Vertical", undefined, 385, 400, 75, 75, 75, 75);
        this.optionsContainer.add(menu);

        // Load font
        FontLoader.loadFonts(this, (self) => {
            if (self.sceneBase === "game") {
                // Surrender button
                let surrenderBtnImg = self.add.image(-125, 85, "Button_Red_Slide");
                surrenderBtnImg.scale = 0.7;
                surrenderBtnImg.setOrigin(0);
                let surrenderBtnText = self.add.text(-105, 93, "SURRENDER", { fontFamily: "Bellefair" });
                let surrenderBtnContainer = self.add.container(0, 0);
                surrenderBtnContainer.add(surrenderBtnImg);
                surrenderBtnContainer.add(surrenderBtnText);
                self.optionsContainer.add(surrenderBtnContainer);
            }

            // Silence button
            let silenceBtnImg = self.add.image(32, 80, "Button_Yellow");
            silenceBtnImg.scale = 0.8;
            silenceBtnImg.setOrigin(0);
            let silenceIcon = self.add.image(57, 104, "Sound_On");
            silenceIcon.setDisplaySize(45, 45);
            silenceIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            let silenceBtnContainer = self.add.container(0, 0);
            silenceBtnContainer.add(silenceBtnImg);
            silenceBtnContainer.add(silenceIcon);

            // Fullscreen button
            let fullscreenBtnImg = self.add.image(80, 80, "Button_Yellow");
            fullscreenBtnImg.scale = 0.8;
            fullscreenBtnImg.setOrigin(0);
            let fullscreenIcon = self.add.image(105, 100, "Selected");
            fullscreenIcon.setDisplaySize(22, 22);
            fullscreenIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            let fullscreenBtnContainer = self.add.container(0, 0);
            fullscreenBtnContainer.add(fullscreenBtnImg);
            fullscreenBtnContainer.add(fullscreenIcon);
            // Fullscreen function
            fullscreenBtnImg.setInteractive();
            fullscreenBtnImg.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
                if (pointer.leftButtonDown()) {
                    fullscreenIcon.setPosition(105, 102);
                    fullscreenBtnImg.setTexture("Button_Yellow_Pressed");
                }
            });
            fullscreenBtnImg.on("pointerup", (pointer: Phaser.Input.Pointer) => {
                if (pointer.leftButtonReleased()) {
                    fullscreenIcon.setPosition(105, 100);
                    fullscreenBtnImg.setTexture("Button_Yellow");
                    this.changeFullscreen();
                }
            });

            // Close button
            let closeBtnImg = self.add.image(80, -140, "Button_Red");
            closeBtnImg.scale = 0.8;
            closeBtnImg.setOrigin(0);
            let closeIcon = self.add.image(105, -115, "X");
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

}