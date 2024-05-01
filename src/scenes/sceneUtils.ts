import * as Sprites from "../../assets/sprites";
import { Pos } from '../utils';
import Game from "./Game";
import Hud from "./Hud";

export default class SceneUtils {

    // Set custom cursor
    static setCursor(scene: Phaser.Scene) {
        scene.input.on("pointerdown", () => {
            scene.input.setDefaultCursor(`url(${Sprites.UI.Pointers.Pointer_Pressed}), pointer`);
        });
        scene.input.on("pointerup", () => {
            scene.input.setDefaultCursor(`url(${Sprites.UI.Pointers.Pointer}), pointer`);
        });
    }

    // Get middle of screen
    static getMidX(scene: Phaser.Scene) {
        return scene.cameras.main.width / 2;
    }

    static getMidY(scene: Phaser.Scene) {
        return scene.cameras.main.height / 2;
    }

    // Config settings
    static settingsPauseConfig(scene: Phaser.Scene, sceneId: string) {
        scene.scene.run('settings', { scene: sceneId });
        scene.events.on('menuOpened', () => {
            scene.scene.pause();
        });
        scene.events.on('menuClosed', () => {
            scene.scene.resume();
        });
    }

    static settingsConfig(scene: Game | Hud) {
        scene.scene.get('settings').events.on('menuOpened', () => {
            scene.setOptionsMenuOpened(true);
        });
        scene.scene.get('settings').events.on('menuClosed', () => {
            scene.setOptionsMenuOpened(false);
        });
    }

    // --- Images ---
    static addImageScale(scene: Phaser.Scene, pos: Pos, texture: string, scaleWidth: number = 1, scaleHeight: number = scaleWidth, frame?: number) {
        let img = scene.add.image(pos.x, pos.y, texture, frame);
        img.setScale(scaleWidth, scaleHeight);
        return img;
    }

    static addImageFilter(scene: Phaser.Scene, pos: Pos, texture: string, width: number, height: number, frame?: number) {
        let img = scene.add.image(pos.x, pos.y, texture, frame);
        img.setDisplaySize(width, height);
        img.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        return img;
    }

    // --- Buttons ---
    static addButtonTextScale(scene: Phaser.Scene, container: Phaser.GameObjects.Container, pos: Pos, texture: string, text: string, fontSize: number = 16, fontStyle: string = "normal", scaleWidth?: number, scaleHeight?: number, frame?: number) {
        let buttonContainer = scene.add.container(pos.x, pos.y);
        let buttonImg = SceneUtils.addImageScale(scene, {x: 0, y: 0}, texture, scaleWidth, scaleHeight, frame);
        let buttonText = scene.add.text(0, -5, text, { color: '#000000', fontFamily: "Quattrocento", fontSize: fontSize, fontStyle: fontStyle }).setOrigin(0.5);
        
        buttonContainer.add(buttonImg);
        buttonContainer.add(buttonText);
        container.add(buttonContainer);

        return { 
            img: buttonImg,
            txt: buttonText
        };
    }

    static addListenerButtonText(button: Phaser.GameObjects.Image, texture: string, pressedTexture: string, text: Phaser.GameObjects.Text, pos: Pos, pressedPos: Pos, action: Function) {
        button.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown()) {
                button.setTexture(pressedTexture);
                text.setPosition(pressedPos.x, pressedPos.y);
            }
        });
        button.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonReleased()) {
                button.setTexture(texture);
                text.setPosition(pos.x, pos.y);
                action();
            }

        });
    }

}