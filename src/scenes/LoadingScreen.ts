import * as Phaser from 'phaser';
import * as Sprites from '../../assets/sprites';
import SceneUtils from './sceneUtils';


export default class LoadingScreen extends Phaser.Scene {
    
    // Logical Attributes
    private trailerEnded = false;
    private assetsLoaded = false;

    // UI Attributes
    private trailer: Phaser.GameObjects.Video;
    private loadingSprite: Phaser.GameObjects.Sprite;
    private trailerContainer: Phaser.GameObjects.Container;

    constructor() {
        super({ key: 'loading-screen' });
    }

    preload() {
        // Cursor
        this.load.image('Pointer', Sprites.UI.Pointers.Pointer);
        this.load.image('Pointer_Pressed', Sprites.UI.Pointers.Pointer_Pressed);

        // Resources needed
        this.load.image('Sound_On', Sprites.UI.Icons.Sound_On);
        this.load.image('Sound_Off', Sprites.UI.Icons.Sound_Off);              
        this.load.image('Button_Yellow', Sprites.UI.Buttons.Yellow);
        this.load.image('Button_Yellow_Pressed', Sprites.UI.Buttons.Yellow_Pressed);        
        this.load.image('Button_Red', Sprites.UI.Buttons.Red);
        this.load.image('Button_Red_Pressed', Sprites.UI.Buttons.Red_Pressed);        
        this.load.image('Exit', Sprites.UI.MenuLobby.Exit);

        // Trailer
        this.load.video('trailer', Sprites.Trailer);

        // Villager for loading screen
        this.load.spritesheet('Villager_Blue', Sprites.NPCs.Villager.Blue, { frameWidth: 192, frameHeight: 192 });
    }

    create() {
        // Cursor
        this.input.setDefaultCursor(`url(${Sprites.UI.Pointers.Pointer}), pointer`);
        SceneUtils.setCursor(this);

        // Animation of villager for loading screen
        this.anims.create({
            key: 'loadingScreenAnim',
            frames: this.anims.generateFrameNumbers(`Villager_Blue`, {
                frames: [0, 1, 2, 3, 4, 5],
            }),
            frameRate: 15,
            repeat: -1,
            skipMissedFrames: true
        });
        this.loadingSprite = this.add.sprite(this.cameras.main.width - 55, this.cameras.main.height - 45, 'Villager_Blue')
        this.loadingSprite.anims.play('loadingScreenAnim');
        this.loadingSprite.setVisible(false);

        // Meanwhile run Boot to start loading assets
        this.scene.run('boot');
        // When all loaded, if trailer ended start Menu
        this.scene.get('boot').events.on("bootFinished", () => {
            this.assetsLoaded = true;
            if (this.trailerEnded)
                this.startMenu();
        });

        this.playTrailer();
    }

    playTrailer() {
        this.trailerContainer = this.add.container(0, 0);

        // Trailer
        this.trailer = this.add.video(this.cameras.main.width / 2, this.cameras.main.height / 2, 'trailer').setScale(0.5).setVolume(0.7).setMute(true);
        this.trailer.play();
        this.trailerContainer.add(this.trailer);

        // Silence button
        let silenceButton = SceneUtils.addButtonIcon(this, this.trailerContainer, {x: this.cameras.main.width - 105, y: 45}, "Button_Yellow", "Sound_Off", -3, true, false, 0.78, 45, undefined, 45);
        silenceButton.img.setInteractive();
        silenceButton.img.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown())
                if (this.trailer.isMuted())
                    silenceButton.icon.setPosition(0, 0);
                else
                    silenceButton.icon.setPosition(0, 3);
                silenceButton.img.setTexture("Button_Yellow_Pressed");
        });
        silenceButton.img.on("pointerup", (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonReleased()) {
                if (this.trailer.isMuted()) {
                    silenceButton.icon.setTexture("Sound_On");
                    silenceButton.icon.setPosition(0, 0);
                }
                else {
                    silenceButton.icon.setTexture("Sound_Off");
                    silenceButton.icon.setPosition(0, -3);
                }
                silenceButton.img.setTexture("Button_Yellow");
                this.trailer.setMute(!this.trailer.isMuted());
            }
        });

        // Skip trailer button
        let closeButton = SceneUtils.addButtonIcon(this, this.trailerContainer, {x: this.cameras.main.width - 55, y: 45}, "Button_Red", "Exit", -5, true, false, 0.8, -25, undefined, 25);
        SceneUtils.addListenerButtonPos(closeButton.img, "Button_Red", "Button_Red_Pressed", closeButton.icon, -5, -2, this.destroyTrailer); 

        // When trailer finishes, destroy
        this.trailer.on("complete", this.destroyTrailer);
    }

    destroyTrailer = () => {
        this.trailer.destroy();
        this.trailerContainer.removeAll();

        this.trailerEnded = true;
        if (this.assetsLoaded)
            this.startMenu();
    }

    startMenu() {
        this.scene.start('menu');
    }

}