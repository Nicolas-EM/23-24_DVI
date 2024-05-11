import * as Sprites from "../../assets/sprites";
import { Pos } from '../utils';
import Game from "./Game";
import Hud from "./Hud";
import GeneralData from "../magic_numbers/general_data";

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

    static addImageFilter(scene: Phaser.Scene, pos: Pos, texture: string, width: number, height: number, frame?: number | string) {
        let img = scene.add.image(pos.x, pos.y, texture, frame);
        img.setDisplaySize(width, height);
        img.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        return img;
    }

    // --- Buttons ---
    // Button with text
    static addButtonText(scene: Phaser.Scene, container: Phaser.GameObjects.Container, pos: Pos, texture: string, yText: number, text: string, fontSize: number = 16, fontStyle: string = "normal", fontColor: string = "#000000", scale: boolean = true, width?: number, height?: number, frame?: number) {
        let buttonContainer = scene.add.container(pos.x, pos.y);
        let buttonImg;
        if (scale) buttonImg = SceneUtils.addImageScale(scene, { x: 0, y: 0 }, texture, width, height, frame);
        else buttonImg = SceneUtils.addImageFilter(scene, { x: 0, y: 0 }, texture, width, height, frame);
        let buttonText = scene.add.text(0, yText, text, { color: fontColor, fontFamily: "Quattrocento", fontSize: fontSize, fontStyle: fontStyle }).setOrigin(0.5);

        buttonContainer.add(buttonImg);
        buttonContainer.add(buttonText);
        if (container)
            container.add(buttonContainer);

        return {
            img: buttonImg,
            txt: buttonText
        };
    }

    // Button with icon
    static addButtonIcon(scene: Phaser.Scene, container: Phaser.GameObjects.Container, pos: Pos, textureImg: string, textureIcon: string, yIcon: number, scaleImg: boolean = true, scaleIcon: boolean = true, widthImg?: number, widthIcon?: number, heightImg?: number, heightIcon?: number, frameImg?: number, frameIcon?: number) {
        let buttonContainer = scene.add.container(pos.x, pos.y);
        let buttonImg;
        if (scaleImg) buttonImg = SceneUtils.addImageScale(scene, { x: 0, y: 0 }, textureImg, widthImg, heightImg, frameImg);
        else buttonImg = SceneUtils.addImageFilter(scene, { x: 0, y: 0 }, textureImg, widthImg, heightImg, frameImg);

        let buttonIcon;
        if (scaleIcon) buttonIcon = SceneUtils.addImageScale(scene, { x: 0, y: yIcon }, textureIcon, widthIcon, heightIcon, frameIcon);
        else buttonIcon = SceneUtils.addImageFilter(scene, { x: 0, y: yIcon }, textureIcon, widthIcon, heightIcon, frameIcon);

        buttonContainer.add(buttonImg);
        buttonContainer.add(buttonIcon);
        if (container)
            container.add(buttonContainer);

        return {
            img: buttonImg,
            icon: buttonIcon
        }
    }

    // Button that changes content position when pressed
    static addListenerButtonPos(button: Phaser.GameObjects.Image, texture: string, pressedTexture: string, text: Phaser.GameObjects.Text | Phaser.GameObjects.Image, yPos: number, yTextPressed: number, action: Function) {
        button.setInteractive();
        button.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown()) {
                button.setTexture(pressedTexture);
                text.setPosition(0, yTextPressed);
            }
        });
        button.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonReleased()) {
                button.setTexture(texture);
                text.setPosition(0, yPos);
                action();
            }

        });
    }

    // Button that changes content texture when pressed
    static addListenerButtonTexture(button: Phaser.GameObjects.Image, texture: string, pressedTexture: string, icon: Phaser.GameObjects.Image, iconTexture: string, iconTexturePressed: string, action: Function) {
        button.setInteractive();
        button.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown()) {
                button.setTexture(pressedTexture);
                icon.setTexture(iconTexturePressed);
            }
        });
        button.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonReleased()) {
                button.setTexture(texture);
                icon.setTexture(iconTexture);
                action();
            }

        });
    }

    // --- Camera control ---
    // Movement by mouse
    static cameraMovementMouse(scene: Game, delta: number) {
        let { width, height } = scene.sys.game.canvas;
        const pointer = scene.input.activePointer.position;

        if (pointer.x === 0 && pointer.y === 0)
            return;

        if (!scene.isPointerInMap())
            return;

        // Camera movement
        if (!scene.isOptionsMenuOpened()) {  // Disable movement if menu opened
            if (pointer.x >= width - GeneralData.ConfigData.MOVEMENT_OFFSET && pointer.y >= GeneralData.ConfigData.MOVEMENT_OFFSET)
                scene.cameras.main.scrollX = scene.cameras.main.scrollX + delta / scene.cameras.main.zoom;
            else if (pointer.x <= GeneralData.ConfigData.MOVEMENT_OFFSET)
                scene.cameras.main.scrollX = scene.cameras.main.scrollX - delta / scene.cameras.main.zoom;

            if (pointer.y >= height - GeneralData.ConfigData.MOVEMENT_OFFSET)
                scene.cameras.main.scrollY = scene.cameras.main.scrollY + delta / scene.cameras.main.zoom;
            else if (pointer.y <= GeneralData.ConfigData.MOVEMENT_OFFSET && pointer.x <= width - GeneralData.ConfigData.MOVEMENT_OFFSET * 2)
                scene.cameras.main.scrollY = scene.cameras.main.scrollY - delta / scene.cameras.main.zoom;
        }
    }

    // Movement by WASD
    static cameraMovementKeys(scene: Game, delta: number) {
        if (scene.getCursors().up.isDown)
            scene.cameras.main.scrollY = scene.cameras.main.scrollY - delta / scene.cameras.main.zoom;
        else if (scene.getCursors().down.isDown)
            scene.cameras.main.scrollY = scene.cameras.main.scrollY + delta / scene.cameras.main.zoom;

        if (scene.getCursors().left.isDown)
            scene.cameras.main.scrollX = scene.cameras.main.scrollX - delta / scene.cameras.main.zoom;
        else if (scene.getCursors().right.isDown)
            scene.cameras.main.scrollX = scene.cameras.main.scrollX + delta / scene.cameras.main.zoom;
    }

    // Zoom
    static cameraZoom(scene: Game, deltaY: number) {
        if (!scene.isOptionsMenuOpened())
            if (deltaY > 0)
                scene.cameras.main.zoom = Phaser.Math.Clamp(scene.cameras.main.zoom - GeneralData.ConfigData.ZOOM_AMOUNT, GeneralData.ConfigData.MIN_ZOOM, GeneralData.ConfigData.MAX_ZOOM);
            else if (deltaY < 0)
                scene.cameras.main.zoom = Phaser.Math.Clamp(scene.cameras.main.zoom + GeneralData.ConfigData.ZOOM_AMOUNT, GeneralData.ConfigData.MIN_ZOOM, GeneralData.ConfigData.MAX_ZOOM);
    }

}