import * as Phaser from 'phaser';
import Client from '../client';
import { HudInfo } from '../utils';

export default class Hud extends Phaser.Scene {
    // Attributes
    private woodCounter: number;
    private goldCounter: number;
    private sheepCounter: number;
    private displayedEntity: Phaser.GameObjects.Sprite;
    // UI
    private selectedContainer: Phaser.GameObjects.Container;
    private infoContainer: Phaser.GameObjects.Container;
    private actionsContainer: Phaser.GameObjects.Container;
    private optionsContainer: Phaser.GameObjects.Container;
    // Options menu
    private optionsBackground: Phaser.GameObjects.Rectangle;
    private optionsButton: Phaser.GameObjects.Image;
    
    // Constructor
    constructor() {
        super({ key: 'hud' });
    }

    preload() {
        this.load.setPath('assets/sprites/');
    }

    create() {
        this.createTopHud();
        this.createBottomHud();
        this.createOptionsMenu();
    }

    createTopHud() {

        const midX = this.cameras.main.width / 2;

        // Team
        let teamContainer = this.add.container(40, 40);
        let squareTeam = this.add.image(0, 0, 'Carved_Square');
        squareTeam.setDisplaySize(45, 45);
        squareTeam.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        let king = this.add.image(0, 0, `King_${Client.getMyColor()}`);
        king.setDisplaySize(25, 25);
        king.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        teamContainer.add(squareTeam);
        teamContainer.add(king);

        // Resources
        this.addResourceBanner(120, "Wood", "150");
        this.addResourceBanner(222, "Food", "230");      
        this.addResourceBanner(324, "Gold", "100");

        // Population
        let soldierIcon = this.add.image(-35, 0, `Soldier_${Client.getMyColor()}`);
        soldierIcon.setDisplaySize(60, 60);
        soldierIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        let villagerIcon = this.add.image(-20, 2, `Villager_${Client.getMyColor()}`);
        villagerIcon.setDisplaySize(60, 60);
        villagerIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        let population = this.add.text(-5, -10, '42/50', { color: '#000000' });

        let populationContainer = this.add.container(midX, 45);
        let populationBanner = this.add.nineslice(0, 0, 'Connection_Up', undefined, 450, 198, 35, 35, 0, 10);
        populationBanner.setDisplaySize(170, 66);
        populationBanner.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        populationContainer.add(populationBanner);
        populationContainer.add(soldierIcon);
        populationContainer.add(villagerIcon);
        populationContainer.add(population);

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

    }

    createBottomHud() {
        const midX = this.cameras.main.width / 2;
        const botY = this.cameras.main.height - 55;

        // Info area
        let infoBox = this.add.image(0, 0, "Carved_Rectangle_Shadow");
        infoBox.scale = 0.95;
        this.infoContainer = this.add.container(0, 0);
        let infoAreaContainer = this.add.container(midX - 145, botY + 25);
        infoAreaContainer.add(infoBox);        
        infoAreaContainer.add(this.infoContainer);

        // Selected Entity
        let entityBox = this.add.image(0, 0, "Carved_Big_Shadow");
        entityBox.scale = 0.55;
        let leftRibbon = this.add.image(55, -20, `Ribbon_${Client.getMyColor()}_Left`);
        leftRibbon.scale = 0.45;
        let rightRibbon = this.add.image(-55, -20, `Ribbon_${Client.getMyColor()}_Right`);
        rightRibbon.scale = 0.45;
        this.selectedContainer = this.add.container(0, 0);
        let selectedAreaContainer = this.add.container(midX, botY);
        selectedAreaContainer.add(leftRibbon);
        selectedAreaContainer.add(rightRibbon);
        selectedAreaContainer.add(entityBox);
        selectedAreaContainer.add(this.selectedContainer);

        // Action area
        let actionBox = this.add.image(0, 0, "Carved_Rectangle_Shadow");
        actionBox.scale = 0.95;
        this.actionsContainer = this.add.container(0, 0);
        let actionAreaContainer = this.add.container(midX + 145, botY + 25);
        actionAreaContainer.add(actionBox);        
        actionAreaContainer.add(this.actionsContainer);

        let entityIcon;

        this.events.on('entityClicked', (hudInfo: HudInfo) => {
            
            // -----------------------------------------------
            // TODO - Move to Game onclick
            this.flushHud();
            // -----------------------------------------------
           
            // ----- Selected entity -----
            entityIcon = this.add.image(0, 0, hudInfo.entity.name);
            entityIcon.setDisplaySize(hudInfo.entity.width, hudInfo.entity.height);
            entityIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            this.selectedContainer.add(entityIcon);
            
            // ----- Info -----
            // ResourceSpawner
            if ("remainingResources" in hudInfo.info) {
                let resourceIcon = this.add.image(-58, 0, hudInfo.info.resource);
                resourceIcon.setDisplaySize(60, 60);
                resourceIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
                let resourceAmount = this.add.text(-36, -8, `${hudInfo.info.remainingResources}`, { color: '#000000' });
                this.infoContainer.add(resourceIcon);
                this.infoContainer.add(resourceAmount);
            }
            // PlayerEntity
            else {
                // Health
                let healthAmount = this.add.text(-45, -15, `${hudInfo.info.health}/${hudInfo.info.totalHealth}`, { color: '#000000' });
                healthAmount.setFontSize(13);
                let healthBar = this.add.image(-30, 8, 'Health', this.calculateHealthBar(hudInfo.info.health, hudInfo.info.totalHealth));
                healthBar.setDisplaySize(80, 30);
                healthBar.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
                this.infoContainer.add(healthAmount);
                this.infoContainer.add(healthBar);
                // if AttackUnit, show damage
                if ("damage" in hudInfo.info) {
                    // Sword
                    let sword = this.add.image(35, 0, 'Sword');
                    sword.setDisplaySize(30, 30);
                    sword.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
                    sword.setFlipX(true);
                    this.infoContainer.add(sword);
                    // Damage
                    let damageAmount = this.add.text(45, -5, `${hudInfo.info.damage}`, { color: '#000000' });
                    this.infoContainer.add(damageAmount);
                }                
            }
            
            // ----- Actions -----
            if("isMine" in hudInfo.info && hudInfo.info.isMine) {
                let startX = -45;
                hudInfo.actions.forEach((action, i) => {
                    let actionIcon = this.add.image(startX + 45 * i, 0, "Icons", action.actionFrame);
                    actionIcon.setDisplaySize(35, 35);
                    actionIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
                    // Funcionalidad acción
                    actionIcon.setInteractive();
                    actionIcon.on("pointerdown", () => {
                        console.log(`Nueva acción pulsada: ${action.run}`);
                        action.run();
                    });
                    this.actionsContainer.add(actionIcon);
                });
            }
        });

    }

    createOptionsMenu() {
        // Darken background
        this.optionsBackground = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.6);
        this.optionsBackground.setOrigin(0);
        this.optionsBackground.setVisible(false);

        const midX = this.cameras.main.width / 2;
        const midY = this.cameras.main.height / 2;

        // Menu
        let menu = this.add.nineslice(0, 0, "Vertical", undefined, 385, 400, 75, 75, 75, 75);
        // Surrender button
        let surrenderBtnImg = this.add.image(-125, 85, "Button_Red_Slide");
        surrenderBtnImg.scale = 0.7;
        surrenderBtnImg.setOrigin(0);
        let surrenderBtnText = this.add.text(-102, 95, "SURRENDER");
        let surrenderBtnContainer = this.add.container(0, 0);
        surrenderBtnContainer.add(surrenderBtnImg);
        surrenderBtnContainer.add(surrenderBtnText);

        // Silence button
        let silenceBtnImg = this.add.image(32, 80, "Button_Yellow");
        silenceBtnImg.scale = 0.8;        
        silenceBtnImg.setOrigin(0);
        let silenceIcon = this.add.image(57, 104, "Sound_On");
        silenceIcon.setDisplaySize(45, 45);
        silenceIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        let silenceBtnContainer = this.add.container(0, 0);
        silenceBtnContainer.add(silenceBtnImg);
        silenceBtnContainer.add(silenceIcon);

        // Fullscreen button
        let fullscreenBtnImg = this.add.image(80, 80, "Button_Yellow");
        fullscreenBtnImg.scale = 0.8;
        fullscreenBtnImg.setOrigin(0);
        let fullscreenIcon = this.add.image(105, 100, "Selected");
        fullscreenIcon.setDisplaySize(22, 22);
        fullscreenIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        let fullscreenBtnContainer = this.add.container(0, 0);
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
        let closeBtnImg = this.add.image(80, -140, "Button_Red");
        closeBtnImg.scale = 0.8;
        closeBtnImg.setOrigin(0);
        let closeIcon = this.add.image(105, -115, "X");
        closeIcon.setDisplaySize(40, 40);
        closeIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        let closeBtnContainer = this.add.container(0, 0);
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

        this.optionsContainer = this.add.container(midX, midY);
        this.optionsContainer.add(menu);
        this.optionsContainer.add(surrenderBtnContainer);
        this.optionsContainer.add(silenceBtnContainer);
        this.optionsContainer.add(fullscreenBtnContainer);
        this.optionsContainer.add(closeBtnContainer);
        this.optionsContainer.setVisible(false);
    }

    // Add banner of a resource to TopHud
    addResourceBanner(posX, resource, amount) {
        let container = this.add.container(posX, 45);

        let banner = this.add.nineslice(0, 0, 'Connection_Up', undefined, 450, 198, 35, 35, 0, 10);
        banner.setDisplaySize(120, 53);
        banner.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        let icon = this.add.image(-20, -3, resource);
        icon.setDisplaySize(60, 60);
        icon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        let amountText = this.add.text(0, -10, amount, { color: '#000000' });

        container.add(banner);
        container.add(icon);
        container.add(amountText);
    }

    // Calculate 
    calculateHealthBar(currentHealth, totalHealth) {
        const healthRatio = currentHealth / totalHealth;
        if (healthRatio >= 0.875) { // 100%
            return 0;
        } else if (healthRatio >= 0.625) { // 75%
            return 1;
        } else if (healthRatio >= 0.375) { // 50%
            return 2;
        } else if (healthRatio >= 0.175) { // 25%
            return 3;
        } else { // 10%
            return 4;
        }
    }

    changeFullscreen() {
        console.log("here");
        if (document.fullscreenElement) {
            // exitFullscreen is only available on the Document object.
            document.exitFullscreen();
        } else {
            const el = document.getElementById("game")!;
            el.requestFullscreen();
        }
    }

    openOptionsMenu() {
        this.optionsButton.disableInteractive();
        this.optionsBackground.setVisible(true);
        this.optionsContainer.setVisible(true);
        this.scene.get('game').events.emit('menuOpened');
    }

    closeOptionsMenu() {
        this.optionsButton.setInteractive();
        this.optionsBackground.setVisible(false);
        this.optionsContainer.setVisible(false);
        this.scene.get('game').events.emit('menuClosed');
    }

    // Remove all elements from hud
    flushHud() {
        this.selectedContainer.removeAll(true);
        this.infoContainer.removeAll(true);
        this.actionsContainer.removeAll(true);
    }

}