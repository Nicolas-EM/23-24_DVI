import * as Phaser from 'phaser';
import Player from '../classes/Player';
import ResourceSpawner from '../classes/resources/ResourceSpawner';
import PlayerEntity from '../classes/PlayerEntity';
import { FontLoader } from '../utils';

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
    private optionsContainer: Phaser.GameObjects.Container;
    // Options menu
    private optionsBackground: Phaser.GameObjects.Rectangle;
    private optionsButton: Phaser.GameObjects.Image;

    // Player
    private player: Player;

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
            let soldierIcon = this.add.image(-35, 0, `Soldier_${this.player.getColor()}`);
            soldierIcon.setDisplaySize(60, 60);
            soldierIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            let villagerIcon = this.add.image(-20, 2, `Villager_${this.player.getColor()}`);
            villagerIcon.setDisplaySize(60, 60);
            villagerIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            self.populationCounter = self.add.text(0, -13, `0/${self.player.getMaxPopulation()}`,
                { color: '#000000', fontFamily: "Bellefair", fontSize: 18 });

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

        let entityIcon;

        this.events.on('entityClicked', (entity: PlayerEntity | ResourceSpawner) => {
            // -----------------------------------------------
            // TODO - Move to Game onclick
            this.flushHud();
            // -----------------------------------------------

            const hudInfo = entity.getHudInfo();
            this.displayedEntity = entity;

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
                        console.log(`Nueva acción pulsada: ${action.run}`);
                        action.run();
                    });
                    this.actionsContainer.add(actionIcon);
                });
            }
        });

    }

    createHealthBar(health: number, totalHealth: number) {
        let healthAmount = this.add.text(-45, -15, `${health}/${totalHealth}`, { color: '#000000', fontFamily: "Bellefair" });
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
        let amountText = this.add.text(0, -10, `${amount}`, { color: '#000000', fontFamily: "Bellefair" });

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
                    let resourceAmount = self.add.text(-36, -8, `${hudInfo.info.remainingResources}`, { color: '#000000', fontFamily: "Bellefair" });
                    self.infoContainer.add(resourceIcon);
                    self.infoContainer.add(resourceAmount);
                }
                // PlayerEntity
                else {
                    // Health
                    self.createHealthBar(hudInfo.info.health, hudInfo.info.totalHealth);
                    // if AttackUnit, show damage
                    if ("damage" in hudInfo.info) {
                        // Sword
                        let sword = self.add.image(35, 0, 'Sword');
                        sword.setDisplaySize(30, 30);
                        sword.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
                        sword.setFlipX(true);
                        self.infoContainer.add(sword);
                        // Damage
                        let damageAmount = self.add.text(45, -5, `${hudInfo.info.damage}`, { color: '#000000', fontFamily: "Bellefair" });
                        self.infoContainer.add(damageAmount);
                    }
                }
            });
        }
    }
}