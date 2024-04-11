import * as Phaser from 'phaser';
import * as Sprites from "../../assets/sprites";
import { FontLoader } from '../utils';
import Client from '../client';

const LOBBY_CODE_LENGTH = 6;

export default class Settings extends Phaser.Scene {

    private lobbyCode: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'join-lobby' });
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

        // Darken background
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.5).setOrigin(0);

        // Container
        const midX = this.cameras.main.width / 2;
        const midY = this.cameras.main.height / 2;
        let joinIcon = this.add.nineslice(0, 0, "Carved_Rectangle", undefined, 350, 175, 35, 35, 50, 50);
        let joinContainer = this.add.container(midX, midY - 10);
        joinContainer.add(joinIcon);

        FontLoader.loadFonts(this, (self) => {
            // Cancel button
            let cancelBtnImg = self.add.image(0, 0, "Button_Red_Slide");
            cancelBtnImg.scale = 0.75;
            let cancelText = self.add.text(0, -5, "CANCEL", { color: '#000000', fontFamily: "Quattrocento", fontSize: 18, fontStyle: "bold" }).setOrigin(0.5);
            let cancelBtnContainer = self.add.container(joinContainer.width - 75, joinContainer.height + 45);            
            cancelBtnContainer.add(cancelBtnImg);
            cancelBtnContainer.add(cancelText);
            // cancel function
            cancelBtnImg.setInteractive();
            cancelBtnImg.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
                if (pointer.leftButtonDown()) {
                    cancelBtnImg.setTexture("Button_Red_Slides_Pressed");
                    cancelText.setPosition(0, -2);
                }
            });
            cancelBtnImg.on("pointerup", (pointer: Phaser.Input.Pointer) => {
                if (pointer.leftButtonReleased()) {
                    this.scene.get("menu").scene.resume();
                    this.scene.stop();
                }
            });
            joinContainer.add(cancelBtnContainer);

            // Text area
            let textContainer = self.add.container(joinContainer.width, -35);
            let textIcon = self.add.nineslice(0, 0, "Horizontal", undefined, 360, 100, 3, 3, 5, 5);
            this.lobbyCode = self.add.text(0, 0, "", { color: '#000000', fontFamily: "Quattrocento", fontSize: 34 }).setOrigin(0.5);
            textContainer.add(textIcon);
            textContainer.add(this.lobbyCode);
            joinContainer.add(textContainer);

            // Join button
            let joinBtnContainer = self.add.container(joinContainer.width + 75, joinContainer.height + 45);
            let joinBtnIcon = self.add.image(0, 0, "Button_Blue_Slide");
            joinBtnIcon.scale = 0.75;
            let joinBtnText = self.add.text(0, -5, "JOIN", { color: '#000000', fontFamily: "Quattrocento", fontSize: 18, fontStyle: "bold" }).setOrigin(0.5);
            joinBtnContainer.add(joinBtnIcon);
            joinBtnContainer.add(joinBtnText);
            joinContainer.add(joinBtnContainer);
            
            // Join action
            joinBtnIcon.setInteractive();
            joinBtnIcon.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
                if (pointer.leftButtonDown()) {
                    joinBtnIcon.setTexture("Button_Blue_Slides_Pressed");
                    joinBtnText.setPosition(0, -2);
                }
            });
            joinBtnIcon.on("pointerup", (pointer: Phaser.Input.Pointer) => {
                if (pointer.leftButtonReleased()) {
                    joinBtnIcon.setTexture("Button_Blue_Slide");
                    joinBtnText.setPosition(0, -5);
                    if (this.lobbyCode.text.length == LOBBY_CODE_LENGTH) {                        
                        this.joinLobby();
                    }
                }
            });
        });

        // Handle input
        this.input.keyboard.on('keyup', event => {
            let key = event.key;
            if (/^[a-zA-Z0-9]$/i.test(key) && this.lobbyCode.text.length < LOBBY_CODE_LENGTH) {
                this.lobbyCode.text += key.toUpperCase();
            }
            else if (key == "Backspace" && this.lobbyCode.text.length > 0) {
                this.lobbyCode.text = this.lobbyCode.text.slice(0, -1);
            }
        });
    }

    joinLobby() {
        Client.joinLobby(this.lobbyCode.text);
    }

}