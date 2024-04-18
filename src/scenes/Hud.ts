import * as Phaser from 'phaser';
import Player from '../classes/Player';
import ResourceSpawner from '../classes/resources/ResourceSpawner';
import PlayerEntity from '../classes/PlayerEntity';
import { FontLoader } from '../utils';
import SpawnerBuilding from '../classes/buildings/SpawnerBuilding';

export default class Hud extends Phaser.Scene {
    // Attributes
    private woodCounter: Phaser.GameObjects.Text;
    private goldCounter: Phaser.GameObjects.Text;
    private foodCounter: Phaser.GameObjects.Text;
    private populationCounter: Phaser.GameObjects.Text;

    private displayedEntity: PlayerEntity | ResourceSpawner;

    // UI
    private selectedContainer: Phaser.GameObjects.Container;
    private infoContainer: Phaser.GameObjects.Container;
    private actionsContainer: Phaser.GameObjects.Container;

    // Queue
    private queueContainer: Phaser.GameObjects.Container;
    private queueIcon: Phaser.GameObjects.Image;
    private queueTime: Phaser.GameObjects.Text;

    // Player
    private player: Player;

    // Spawn Cancell
    private closeBtnImg: Phaser.GameObjects.Image;
    private closeBtnXImg: Phaser.GameObjects.Image;

    private optionsMenuOpened = false;

    // Constructor
    constructor() {
        super({ key: 'hud' });
    }

    init(data) {
        this.player = data.player;
    }

    create() {
        this.createTopHud();
        this.createBottomHud();

        this.scene.get('settings').events.on('menuOpened', () => {
            this.optionsMenuOpened = true;
        });
        this.scene.get('settings').events.on('menuClosed', () => {
            this.optionsMenuOpened = false;
        });
    }

    createTopHud() {
        const midX = this.cameras.main.width / 2;

        // Team
        let teamContainer = this.add.container(40, 40);
        let squareTeam = this.add.image(0, 0, 'Carved_Square');
        squareTeam.setDisplaySize(45, 45);
        squareTeam.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        let king = this.add.image(0, 0, `King_${this.player.getColor()}`);
        king.setDisplaySize(25, 25);
        king.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        teamContainer.add(squareTeam);
        teamContainer.add(king);

        // Load font
        FontLoader.loadFonts(this, (self) => {
            // Resources
            self.woodCounter = self.addResourceBanner(120, "Wood", self.player.getWood());
            self.foodCounter = self.addResourceBanner(222, "Food", self.player.getFood());
            self.goldCounter = self.addResourceBanner(324, "Gold", self.player.getGold());

            // Population
            let soldierIcon = self.add.image(-35, 0, `Soldier_${self.player.getColor()}`);
            soldierIcon.setDisplaySize(60, 60);
            soldierIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            let villagerIcon = self.add.image(-20, 2, `Villager_${self.player.getColor()}`);
            villagerIcon.setDisplaySize(60, 60);
            villagerIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            self.populationCounter = self.add.text(0, -13, `0/${self.player.getMaxPopulation()}`,
                { color: '#000000', fontFamily: "Quattrocento", fontSize: 18 });

            let populationContainer = self.add.container(midX, 45);
            let populationBanner = self.add.nineslice(0, 0, 'Connection_Up', undefined, 450, 198, 35, 35, 0, 10);
            populationBanner.setDisplaySize(170, 66);
            populationBanner.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            populationContainer.add(populationBanner);
            populationContainer.add(soldierIcon);
            populationContainer.add(villagerIcon);
            populationContainer.add(self.populationCounter);
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
        let leftRibbon = this.add.image(55, -20, `Ribbon_${this.player.getColor()}_Left`);
        leftRibbon.scale = 0.45;
        let rightRibbon = this.add.image(-55, -20, `Ribbon_${this.player.getColor()}_Right`);
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

        // Queue area
        let queueBox = this.add.image(0, 0, "Carved_Rectangle_Shadow");
        queueBox.scale = 0.78;
        this.queueContainer = this.add.container(midX + 161, botY - 28);
        this.queueContainer.add(queueBox);
        // Queue icon
        this.queueIcon = this.add.image(-35, 0, "X");
        this.queueIcon.setDisplaySize(26, 26);
        this.queueIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        // Load fonts
        FontLoader.loadFonts(this, (self) => {
            // Queue time
            self.queueTime = self.add.text(-10, -8, `0s`, { color: '#000000', fontFamily: "Quattrocento" });
            self.queueTime.setSize(20, 20);
            // Close button
            self.closeBtnImg = self.add.image(0, 0, "Button_Red");
            self.closeBtnImg.scale = 0.5;
            
            self.closeBtnXImg = self.add.image(-0.5, -0.8, "X");
            self.closeBtnXImg.setDisplaySize(25, 25);
            self.closeBtnXImg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);

            self.closeBtnImg.setInteractive();
            self.closeBtnImg.on("pointerdown", () => {
                self.closeBtnImg.setTexture("Button_Red_Pressed");
                self.closeBtnXImg.setTexture("X_Pressed");
            });
            self.closeBtnImg.on("pointerup", self.cancelSpawn, self);

            let closeBtnContainer = self.add.container(45, 3);
            closeBtnContainer.add(self.closeBtnImg);
            closeBtnContainer.add(self.closeBtnXImg);
            // Add all to container and set it invisible
            self.queueContainer.add(self.queueIcon);
            self.queueContainer.add(self.queueTime);
            self.queueContainer.add(closeBtnContainer);
            self.queueContainer.setVisible(false);


            let entityIcon;

            self.events.on('entityClicked', (selectedEntity: PlayerEntity | ResourceSpawner) => {

                // Save selectedEntity
                this.displayedEntity = selectedEntity;

                this.flushHud();

                let hudInfo = this.displayedEntity.getHudInfo();

                // ----- Selected entity -----
                entityIcon = this.add.image(0, 0, hudInfo.entity.name);
                entityIcon.setDisplaySize(hudInfo.entity.width, hudInfo.entity.height);
                entityIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
                this.selectedContainer.add(entityIcon);

                // ----- Actions -----
                if ("isMine" in hudInfo.info && hudInfo.info.isMine) {
                    let startX = -45;
                    hudInfo.actions.forEach((action, i) => {
                        let actionIcon = this.add.image(startX + 45 * i, 0, "Icons", action.actionFrame);
                        actionIcon.setDisplaySize(35, 35);
                        actionIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
                        // Funcionalidad acción
                        actionIcon.setInteractive();
                        actionIcon.on("pointerdown", () => {
                            if(!this.optionsMenuOpened)
                                action.run();
                        });
                        this.actionsContainer.add(actionIcon);
                    });
                }
            });

            self.events.on('entityUnclicked', () => {
                this.displayedEntity = null;
                this.flushHud();
            });
        });
    }

    cancelSpawn(pointer: Phaser.Input.Pointer): void {
        this.closeBtnImg.setTexture("Button_Red");
        this.closeBtnXImg.setTexture("X");

        if (pointer.leftButtonReleased()) {
            if(this.displayedEntity instanceof SpawnerBuilding) {
                this.displayedEntity.cancelNPC();
            }
        }
    }

    createHealthBar(health: number, totalHealth: number) {
        let healthAmount = this.add.text(-45, -15, `${health}/${totalHealth}`, { color: '#000000', fontFamily: "Quattrocento" });
        healthAmount.setFontSize(13);
        let healthBar = this.add.image(-30, 8, 'Health', this.calculateHealthBar(health, totalHealth));
        healthBar.setDisplaySize(80, 30);
        healthBar.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.infoContainer.add(healthAmount);
        this.infoContainer.add(healthBar);
    }

    // Add banner of a resource to TopHud
    addResourceBanner(posX: number, resource: string | Phaser.Textures.Texture, amount: number | string): Phaser.GameObjects.Text {
        let container = this.add.container(posX, 45);

        let banner = this.add.nineslice(0, 0, 'Connection_Up', undefined, 450, 198, 35, 35, 0, 10);
        banner.setDisplaySize(120, 53);
        banner.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        let icon = this.add.image(-20, -3, resource);
        icon.setDisplaySize(60, 60);
        icon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        let amountText = this.add.text(0, -10, `${amount}`, { color: '#000000', fontFamily: "Quattrocento" });

        container.add(banner);
        container.add(icon);
        container.add(amountText);

        return amountText;
    }

    // Calculate 
    calculateHealthBar(currentHealth: number, totalHealth: number) {
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

    // Remove all elements from hud
    flushHud() {
        this.selectedContainer.removeAll(true);
        this.infoContainer.removeAll(true);
        this.actionsContainer.removeAll(true);
        this.queueContainer.setVisible(false);
    }

    update(time: number, delta: number) {
        this.woodCounter.setText(`${this.player.getWood()}`);
        this.foodCounter.setText(`${this.player.getFood()}`);
        this.goldCounter.setText(`${this.player.getGold()}`);

        this.populationCounter.setText(`${this.player.getNPCs().length}/${this.player.getMaxPopulation()}`);

        if (this.displayedEntity) {
            const hudInfo = this.displayedEntity.getHudInfo();

            this.infoContainer.removeAll(true);

            // Load fonts
            FontLoader.loadFonts(this, (self) => {
                // ----- Info -----
                // ResourceSpawner
                if ("remainingResources" in hudInfo.info) {
                    let resourceIcon = self.add.image(-58, 0, hudInfo.info.resource);
                    resourceIcon.setDisplaySize(60, 60);
                    resourceIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
                    let resourceAmount = self.add.text(-36, -8, `${hudInfo.info.remainingResources}`, { color: '#000000', fontFamily: "Quattrocento" });
                    self.infoContainer.add(resourceIcon);
                    self.infoContainer.add(resourceAmount);

                    if(hudInfo.info.remainingResources <= 0)
                        self.displayedEntity = undefined;
                }
                // PlayerEntity
                else {
                    // Health
                    self.createHealthBar(hudInfo.info.health, hudInfo.info.totalHealth);
                    // if AttackUnit, show damage
                    if ("damage" in hudInfo.info) {
                        // Sword
                        let sword = self.add.image(30, 0, 'Sword');
                        sword.setDisplaySize(14, 30);
                        sword.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
                        sword.setFlipX(true);
                        self.infoContainer.add(sword);
                        // Damage
                        let damageAmount = self.add.text(45, -5, `${hudInfo.info.damage}`, { color: '#000000', fontFamily: "Quattrocento" });
                        self.infoContainer.add(damageAmount);
                    }
                    // if Building with queue, show queue data
                    if ("queueIcon" in hudInfo.info && hudInfo.info.queueIcon != null && "queueTime" in hudInfo.info) {
                        self.queueIcon.setTexture("Icons", hudInfo.info.queueIcon);
                        self.queueTime.text = hudInfo.info.queueTime === Infinity ? "Inf." : `${hudInfo.info.queueTime}s`;
                        // If not visible, set visible
                        if (!self.queueContainer.visible) {
                            self.queueContainer.setVisible(true);
                        }
                    }
                    // Queue empty
                    else if ("queueIcon" in hudInfo.info && "queueTime" in hudInfo.info) {
                        self.queueContainer.setVisible(false);
                    }

                    if(hudInfo.info.health <= 0)
                        self.displayedEntity = undefined;
                }
            });
        } else {
            this.flushHud();
        }
    }
}