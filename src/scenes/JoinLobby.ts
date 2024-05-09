import * as Phaser from 'phaser';
import { FontLoader } from '../utils';
import Client from '../client';
import SceneUtils from "./sceneUtils"


const LOBBY_CODE_LENGTH = 6;


export default class Settings extends Phaser.Scene {

    // UI Attributes
    private lobbyCode: Phaser.GameObjects.Text;
    private cursor: Phaser.GameObjects.Text;

    // Constructor
    constructor() {
        super({ key: 'join-lobby' });
    }

    // Create
    create() {

        // Init config
        Client.setScene(this);
        SceneUtils.setCursor(this);
        
        // Darken background
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.5).setOrigin(0);

        // Container
        let joinIcon = this.add.nineslice(0, 0, "Carved_Rectangle", undefined, 350, 175, 35, 35, 50, 50);
        let joinContainer = this.add.container(SceneUtils.getMidX(this), SceneUtils.getMidY(this) - 10);
        joinContainer.add(joinIcon);

        FontLoader.loadFonts(this, (self: Settings) => {

            // Cancel button
            let cancelButton = SceneUtils.addButtonText(self, joinContainer, {x: joinContainer.width - 75, y: joinContainer.height + 45}, "Button_Red_Slide", -5, "CANCEL", 18, "bold", true, 0.75);
            SceneUtils.addListenerButtonPos(cancelButton.img, "Button_Red_Slides", "Button_Red_Slides_Pressed", cancelButton.txt, -5, -3, () => {
                this.scene.get("menu").scene.resume();
                this.scene.stop();
            });

            // Text area
            let textContainer = self.add.container(joinContainer.width, -35);
            textContainer.add(self.add.nineslice(0, 0, "Horizontal", undefined, 360, 100, 3, 3, 5, 5));
            self.lobbyCode = self.add.text(0, 0, "", { color: '#000000', fontFamily: "Quattrocento", fontSize: 34 }).setOrigin(0.5);
            textContainer.add(self.lobbyCode);
            joinContainer.add(textContainer);

            // Cursor
            self.cursor = self.add.text(self.lobbyCode.x + self.lobbyCode.width, 0, "_", { color: '#000000', fontFamily: "Quattrocento", fontSize: 34, fontStyle: "bold" }).setOrigin(0.5);
            self.tweens.add({ targets: self.cursor, alpha: 0, duration: 400, repeat: -1, yoyo: true });
            textContainer.add(self.cursor);

            // Join button
            let joinButton = SceneUtils.addButtonText(self, joinContainer, {x: joinContainer.width + 75, y: joinContainer.height + 45}, "Button_Blue_Slide", -5, "JOIN", 18, "bold", true, 0.75);
            SceneUtils.addListenerButtonPos(joinButton.img, "Button_Blue_Slide", "Button_Blue_Slides_Pressed", joinButton.txt, -5, -3, () => {
                if (this.lobbyCode.text.length == LOBBY_CODE_LENGTH)
                    Client.joinLobby(this.lobbyCode.text);
            });

        });

        // Handle input
        this.input.keyboard.on('keyup', event => {
            let key = event.key;
            if (/^[a-zA-Z0-9]$/i.test(key) && this.lobbyCode.text.length < LOBBY_CODE_LENGTH) {
                this.lobbyCode.text += key.toUpperCase();
                if (this.lobbyCode.text.length == LOBBY_CODE_LENGTH) {
                    this.cursor.setVisible(false);
                }
                this.cursor.setX(this.lobbyCode.x + this.lobbyCode.width / 2 + 10);
            }
            else if (key == "Backspace" && this.lobbyCode.text.length > 0) {
                this.lobbyCode.text = this.lobbyCode.text.slice(0, -1);
                if (this.lobbyCode.text.length == LOBBY_CODE_LENGTH - 1) {
                    this.cursor.setVisible(true);
                }
                this.cursor.setX(this.lobbyCode.x + this.lobbyCode.width / 2 + 10);
            }
        });

    }

}