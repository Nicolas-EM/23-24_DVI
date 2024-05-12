import * as Phaser from 'phaser';
import Player from '../classes/Player';
import ResourceSpawner from '../classes/resources/ResourceSpawner';
import PlayerEntity from '../classes/PlayerEntity';
import { FontLoader, Resources } from '../utils';
import SpawnerBuilding from '../classes/buildings/SpawnerBuilding';
import SceneUtils from './sceneUtils';

export default class Hud extends Phaser.Scene {

    // Logical Attributes
    private optionsMenuOpened = false;
    private displayedEntity: PlayerEntity | ResourceSpawner;
    private player: Player;

    // --- UI Attributes ---
    // Top hud
    private woodCounter: Phaser.GameObjects.Text;
    private goldCounter: Phaser.GameObjects.Text;
    private foodCounter: Phaser.GameObjects.Text;
    private populationCounter: Phaser.GameObjects.Text;
    // Bottom hud
    private selectedContainer: Phaser.GameObjects.Container;
    private infoContainer: Phaser.GameObjects.Container;
    private actionsContainer: Phaser.GameObjects.Container;
    private queueContainer: Phaser.GameObjects.Container;

    private resourceAmount: Phaser.GameObjects.Text;
    private healthAmount: Phaser.GameObjects.Text;
    private healthBar: Phaser.GameObjects.Image;
    private queueIcon: Phaser.GameObjects.Image;
    private queueTime: Phaser.GameObjects.Text;

    // Constructor
    constructor() {
        super({ key: 'hud' });
    }

    // Init
    init(data) {
        this.player = data.player;
    }

    // Create
    create() {
        SceneUtils.settingsConfig(this);

        this.createTopHud();
        this.createBottomHud();
    }

    // --- UI FUNCTIONS ---
    // Top hud
    createTopHud() {
        // Team
        let teamContainer = this.add.container(40, 40);
        teamContainer.add(SceneUtils.addImageFilter(this, { x: 0, y: 0 }, "Carved_Square", 45, 45));
        teamContainer.add(SceneUtils.addImageFilter(this, { x: 0, y: 0 }, `King_${this.player.getColor()}`, 25, 25));

        // Load font
        FontLoader.loadFonts(this, (self) => {
            // Resources
            self.woodCounter = self.addResourceBanner(120, "Wood", self.player.getWood());
            self.foodCounter = self.addResourceBanner(222, "Food", self.player.getFood());
            self.goldCounter = self.addResourceBanner(324, "Gold", self.player.getGold());

            // Population
            let populationContainer = self.add.container(SceneUtils.getMidX(self), 45);
            let populationBanner = self.add.nineslice(0, 0, 'Connection_Up', undefined, 450, 198, 35, 35, 0, 10).setDisplaySize(170, 66);
            populationBanner.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            populationContainer.add(populationBanner);

            populationContainer.add(SceneUtils.addImageFilter(self, { x: -35, y: 0 }, `Soldier_${self.player.getColor()}`, 60, 60));
            populationContainer.add(SceneUtils.addImageFilter(self, { x: -20, y: 2 }, `Villager_${self.player.getColor()}`, 60, 60));

            self.populationCounter = self.add.text(0, -13, `${self.player.getNPCs.length}/${self.player.getMaxPopulation()}`,
                { color: '#000000', fontFamily: "Quattrocento", fontSize: 18 });
            populationContainer.add(self.populationCounter);
        });
    }

    // Bottom hud
    createBottomHud() {
        const botY = this.cameras.main.height - 55;

        // Info area
        let infoAreaContainer = this.add.container(SceneUtils.getMidX(this) - 145, botY + 25);
        infoAreaContainer.add(SceneUtils.addImageScale(this, { x: 0, y: 0 }, "Carved_Rectangle_Shadow", 0.95));
        this.infoContainer = this.add.container(0, 0);  // Info changing container        
        infoAreaContainer.add(this.infoContainer);

        // Selected Entity
        let selectedAreaContainer = this.add.container(SceneUtils.getMidX(this), botY);
        selectedAreaContainer.add(SceneUtils.addImageScale(this, { x: 55, y: -20 }, `Ribbon_${this.player.getColor()}_Left`, 0.45));
        selectedAreaContainer.add(SceneUtils.addImageScale(this, { x: -55, y: -20 }, `Ribbon_${this.player.getColor()}_Right`, 0.45));
        selectedAreaContainer.add(SceneUtils.addImageScale(this, { x: 0, y: 0 }, "Carved_Big_Shadow", 0.55));
        this.selectedContainer = this.add.container(0, 0);  // Selected entity changing container
        selectedAreaContainer.add(this.selectedContainer);

        // Action area
        let actionAreaContainer = this.add.container(SceneUtils.getMidX(this) + 145, botY + 25);
        actionAreaContainer.add(SceneUtils.addImageScale(this, { x: 0, y: 0 }, "Carved_Rectangle_Shadow", 0.95));
        this.actionsContainer = this.add.container(0, 0);  // Actions changing container
        actionAreaContainer.add(this.actionsContainer);

        // --- QUEUE ---
        // Queue Area
        this.queueContainer = this.add.container(SceneUtils.getMidX(this) + 161, botY - 28);
        this.queueContainer.setVisible(false);  // Not visible
        this.queueContainer.add(SceneUtils.addImageScale(this, { x: 0, y: 0 }, "Carved_Rectangle_Shadow", 0.78));
        // Queue icon
        this.queueIcon = SceneUtils.addImageFilter(this, { x: -35, y: 0 }, "X", 26, 26);
        this.queueContainer.add(this.queueIcon);

        // Load fonts
        FontLoader.loadFonts(this, (self) => {
            // Queue time
            self.queueTime = self.add.text(-10, -8, `0s`, { color: '#000000', fontFamily: "Quattrocento" }).setSize(20, 20);
            self.queueContainer.add(self.queueTime);
            // Queue cancel
            let cancelButton = SceneUtils.addButtonIcon(self, self.queueContainer, { x: 45, y: 3 }, "Button_Red", "X", -1, true, false, 0.5, 25, undefined, 25);
            SceneUtils.addListenerButtonTexture(cancelButton.img, "Button_Red", "Button_Red_Pressed", cancelButton.icon, "X", "X_Pressed", this.cancelSpawn);

            // When entity clicked, fill hud info
            self.events.on('entityClicked', (selectedEntity: PlayerEntity | ResourceSpawner) => {
                this.buildHudInfo(selectedEntity);
            });

            // When no entity selected, flush hud info
            self.events.on('entityUnclicked', () => {
                this.flushHud();
            });
        });
    }

    // Fill hud with entity info
    buildHudInfo(selectedEntity: PlayerEntity | ResourceSpawner) {

        // Reset hud and save entity info
        this.flushHud();
        this.displayedEntity = selectedEntity;
        let hudInfo = this.displayedEntity.getHudInfo();

        // ----- Selected entity -----
        this.selectedContainer.add(SceneUtils.addImageFilter(this, { x: 0, y: 0 }, hudInfo.entity.name, hudInfo.entity.width, hudInfo.entity.height));

        // ----- Info -----
        // ResourceSpawner
        if ("remainingResources" in hudInfo.info) {
            this.infoContainer.add(SceneUtils.addImageFilter(this, { x: -58, y: 0 }, hudInfo.info.resource, 60, 60));
            this.resourceAmount = this.add.text(-36, -8, `${hudInfo.info.remainingResources}`, { color: '#000000', fontFamily: "Quattrocento" });
            this.infoContainer.add(this.resourceAmount);
        }
        // PlayerEntity
        else {
            // Health
            this.createHealthBar(hudInfo.info.health, hudInfo.info.totalHealth);
            
            // if AttackUnit, show damage
            if ("damage" in hudInfo.info) {
                this.infoContainer.add(SceneUtils.addImageFilter(this, {x: 30, y: 0}, "Sword", -14, 30));
                this.infoContainer.add(this.add.text(45, -10, `${hudInfo.info.damage}`, { color: '#000000', fontFamily: "Quattrocento" }));
            }
        }

        // ----- Actions -----
        if ("isMine" in hudInfo.info && hudInfo.info.isMine) {
            let startX = -45;
            hudInfo.actions.forEach((action, i) => {
                let actionIcon = SceneUtils.addImageFilter(this, {x: startX + 45 * i, y: 0}, "Icons", 35, 35, action.actionFrame).setInteractive();
                actionIcon.on("pointerup", (pointer: Phaser.Input.Pointer) => {
                    if (pointer.leftButtonReleased() && !this.optionsMenuOpened)
                        action.run();
                });
                this.actionsContainer.add(actionIcon);
            });
        }
    }

    // Health bar
    createHealthBar(health: number, totalHealth: number) {
        this.healthAmount = this.add.text(-45, -15, `${health}/${totalHealth}`, { color: '#000000', fontFamily: "Quattrocento", fontSize: 13 });
        this.infoContainer.add(this.healthAmount);
        this.healthBar = SceneUtils.addImageFilter(this, { x: -30, y: 8 }, "Health", 80, 30, this.calculateHealthBar(health, totalHealth));
        this.infoContainer.add(this.healthBar);
    }

    // Add banner of a resource to TopHud
    addResourceBanner(posX: number, resource: string, amount: number | string): Phaser.GameObjects.Text {
        let container = this.add.container(posX, 45);
        let banner = this.add.nineslice(0, 0, 'Connection_Up', undefined, 450, 198, 35, 35, 0, 10).setDisplaySize(120, 53);
        banner.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        container.add(banner);
        container.add(SceneUtils.addImageFilter(this, { x: -20, y: -3 }, resource, 60, 60));
        let amountText = this.add.text(0, -10, `${amount}`, { color: '#000000', fontFamily: "Quattrocento" });
        container.add(amountText);
        return amountText;
    }

    // --- UPDATE FUNCTIONS ---
    update() {
        // Update queue
        if (this.displayedEntity) {
            const hudInfo = this.displayedEntity.getHudInfo();
            // Load font
            FontLoader.loadFonts(this, (self) => {
                // if Building with queue, show queue data
                if ("queueIcon" in hudInfo.info && hudInfo.info.queueIcon != null && "queueTime" in hudInfo.info) {
                    self.queueIcon.setTexture("Icons", hudInfo.info.queueIcon);
                    self.queueTime.text = hudInfo.info.queueTime === Infinity ? "Wait" : `${hudInfo.info.queueTime}s`;
                    self.queueContainer.setVisible(true);
                }
                // Queue empty
                else if ("queueIcon" in hudInfo.info && "queueTime" in hudInfo.info)
                    self.queueContainer.setVisible(false);
            });
        }
    }

    updateResources(resources: Resources) {
        this.woodCounter.setText(`${resources.wood}`);
        this.foodCounter.setText(`${resources.food}`);
        this.goldCounter.setText(`${resources.gold}`);
    }

    updatePopulation(curPop, maxPop) {
        this.populationCounter.setText(`${curPop}/${maxPop}`);
    }

    updateInfo(entity: ResourceSpawner | PlayerEntity, data: number, data_2: number) {
        // Update only if shown in hud
        if (this.displayedEntity && entity.getId() == this.displayedEntity.getId())
            if (entity instanceof ResourceSpawner) {
                if (data > 0)
                    this.resourceAmount.text = `${data}`;
                // Spawner with no resources -> no longer displayed
                else
                    this.flushHud();
            }
            else {
                if (data > 0) {
                    this.healthAmount.text = `${data}/${data_2}`;
                    this.healthBar.setFrame(this.calculateHealthBar(data, data_2));
                }
                // Entity with no life -> no longer displayed
                else
                    this.flushHud();
            }
    }

    // --- Other functions ---
    // Change "is menu opened?"
    setOptionsMenuOpened(opened: boolean) {
        this.optionsMenuOpened = opened;
    }

    // Cancel queue
    cancelSpawn = () => {
        if (this.displayedEntity instanceof SpawnerBuilding)
            this.displayedEntity.cancelNPC();
    }

    // Remove all elements from hud
    flushHud() {
        this.displayedEntity = undefined;
        this.selectedContainer.removeAll(true);
        this.infoContainer.removeAll(true);
        this.actionsContainer.removeAll(true);
        this.queueContainer.setVisible(false);
    }

    // --- AUX ---
    // Calculate frame of the health bar according to %
    calculateHealthBar(currentHealth: number, totalHealth: number) {
        const healthRatio = currentHealth / totalHealth;
        if (healthRatio >= 0.875) return 0;  // 100 %
        else if (healthRatio >= 0.625)  return 1;  // 75%
        else if (healthRatio >= 0.375) return 2;  // 50%
        else if (healthRatio >= 0.175)  return 3;  // 25%
        else return 4;  // 10%
    }

}