import * as Phaser from 'phaser';

import * as Sprites from '../../assets/sprites';

export default class LoadingScreen extends Phaser.Scene {
    private muteBtn;
    private silenceIcon;
    private skipBtn;
    private xBtn;
    private trailer: Phaser.GameObjects.Video;

    private trailerEnded = true;
    private assetsLoaded = false;

    private loadingSprite: Phaser.GameObjects.Sprite;

    constructor() {
        super({ key: 'loading-screen' });
    }

    preload() {
        // Load loading screen UI
        this.load.image('Sound_Off', Sprites.UI.Icons.Sound_Off);
        this.load.image('Sound_On', Sprites.UI.Icons.Sound_On);
        this.load.image('X_Disable', Sprites.UI.Icons.X_Disable);
        this.load.image('X_Pressed', Sprites.UI.Icons.X_Pressed);
        this.load.image('X', Sprites.UI.Icons.X);
        this.load.image('Button_Yellow_Pressed', Sprites.UI.Buttons.Yellow_Pressed);
        this.load.image('Button_Yellow', Sprites.UI.Buttons.Yellow);

        // Trailer
        this.load.video('trailer', Sprites.Trailer);

        this.load.spritesheet('Villager_Blue', Sprites.NPCs.Villager.Blue, { frameWidth: 192, frameHeight: 192 });
    }

    create() {
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

        this.input.setDefaultCursor(`url(${Sprites.UI.Pointers.Pointer}), pointer`);
        this.scene.run('boot');
        this.scene.get('boot').events.on("bootFinished", () => {
            this.assetsLoaded = true;
            if(this.trailerEnded)
                this.startMenu();
        });

        this.playTrailer();
    }

    playTrailer() {
        this.trailerEnded = false;
        this.trailer = this.add.video(this.cameras.main.width / 2, this.cameras.main.height / 2, 'trailer');
        this.trailer.setScale(0.5);
        this.trailer.setMute(true);
        this.trailer.play();

        const muteX = this.cameras.main.width - 105;
        const muteY = 45;

        this.muteBtn = this.add.image(muteX, muteY, "Button_Yellow");
        this.muteBtn.setScale(0.8);
        this.silenceIcon = this.add.image(muteX, muteY - 4, "Sound_Off").setDisplaySize(45, 45);
        this.muteBtn.setInteractive();
        this.muteBtn.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown()) {
                if (this.trailer.isMuted()) {
                    this.silenceIcon.setPosition(muteX, muteY - 1);
                }
                else {
                    this.silenceIcon.setPosition(muteX, muteY + 1);
                }
                this.muteBtn.setTexture("Button_Yellow_Pressed");
            }
        });
        this.muteBtn.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonReleased()) {
                if (this.trailer.isMuted()) {
                    this.silenceIcon.setTexture("Sound_On");
                    this.silenceIcon.setPosition(muteX, muteY - 2);
                }
                else {
                    this.silenceIcon.setTexture("Sound_Off");
                    this.silenceIcon.setPosition(muteX, muteY - 4);
                }
                this.trailer.setMute(!this.trailer.isMuted());
                this.muteBtn.setTexture("Button_Yellow");
            }
        });

        this.skipBtn = this.add.image(muteX + 50, muteY, "Button_Yellow").setScale(0.8);
        this.xBtn = this.add.image(muteX + 50, muteY, "X").setScale(0.8);
        this.skipBtn.setInteractive();
        this.skipBtn.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown()) {
                this.xBtn.setTexture("X_Pressed");
                this.skipBtn.setTexture("Button_Yellow_Pressed");
            }
        });
        this.skipBtn.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonReleased()) {
                this.xBtn.setTexture("X");
                this.skipBtn.setTexture("Button_Yellow");
                this.destroyTrailer();
            }
        });

        this.trailer.on("VIDEO_COMPLETE", () => this.destroyTrailer(), this);
    }

    destroyTrailer() {
        this.trailer.destroy();
        this.muteBtn.destroy();
        this.silenceIcon.destroy();
        this.skipBtn.destroy();
        this.xBtn.destroy();

        this.trailerEnded = true;
        if(this.assetsLoaded)
            this.startMenu();
    }

    startMenu() {
        this.scene.start('menu');
    }
}