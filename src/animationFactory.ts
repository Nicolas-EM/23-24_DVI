export namespace animationFactory {
    export function createAnimations(scene: Phaser.Scene) {
        // NOTE: We could create only the ones we need for the game but they're small and no memory issues are expected
        const colors = ['Blue', 'Red', 'Yellow', 'Purple'];

        colors.forEach((color) => {

            // --- VILLAGER ---
            // - Idle -
            scene.anims.create({
                key: `villagerIdle${color}`,
                frames: scene.anims.generateFrameNumbers(`Villager_${color}`, {
                    frames: [0, 1, 2, 3, 4, 5],
                }),
                frameRate: 8,
            });

            // - Walk -
            scene.anims.create({
                key: `villagerWalk${color}`,
                frames: scene.anims.generateFrameNumbers(`Villager_${color}`, {
                    frames: [6, 7, 8, 9, 10, 11],
                }),
                frameRate: 8,
            });

            // - Gather -
            scene.anims.create({
                key: `villagerAxe${color}`,
                frames: scene.anims.generateFrameNumbers(`Villager_${color}`, {
                    frames: [18, 19, 20, 21, 22, 23],

                }),
                frameRate: 8,
                repeat: 5,

            });

            // --- SOLDIER ---
            // - Idle -
            scene.anims.create({
                key: `soldierIdleRight${color}`,
                frames: scene.anims.generateFrameNumbers(`Soldier_${color}`, {
                    frames: [0, 1, 2, 3, 4, 5],
                }),
                frameRate: 8,
            });

            // - Walk -
            scene.anims.create({
                key: `soldierWalkRight${color}`,
                frames: scene.anims.generateFrameNumbers(`Soldier_${color}`, {
                    frames: [6, 7, 8, 9, 10, 11],
                }),
                frameRate: 8,
            });

            // - Attack Left/Right -
            scene.anims.create({
                key: `soldierAttackRight${color}`,
                frames: scene.anims.generateFrameNumbers(`Soldier_${color}`, {
                    frames: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                }),
                frameRate: 8,
            });

            // - Attack Down -
            scene.anims.create({
                key: `soldierAttackDown${color}`,
                frames: scene.anims.generateFrameNumbers(`Soldier_${color}`, {
                    frames: [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
                }),
                frameRate: 8,
            });

            // - Attack Up -
            scene.anims.create({
                key: `soldierAttackUp${color}`,
                frames: scene.anims.generateFrameNumbers(`Soldier_${color}`, {
                    frames: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47],
                }),
                frameRate: 8,
            });

            // --- ARCHER ---
            // - Idle -
            scene.anims.create({
                key: `archerIdleRight${color}`,
                frames: scene.anims.generateFrameNumbers(`Archer_${color}`, {
                    frames: [0, 1, 2, 3, 4, 5],
                }),
                frameRate: 8,
            });

            // - Walk -
            scene.anims.create({
                key: `archerWalkRight${color}`,
                frames: scene.anims.generateFrameNumbers(`Archer_${color}`, {
                    frames: [8, 9, 10, 11, 12, 13],
                }),
                frameRate: 8,
            });

            // - Shoot Up -
            scene.anims.create({
                key: `archerShootUp${color}`,
                frames: scene.anims.generateFrameNumbers(`Archer_${color}`, {
                    frames: [16, 17, 18, 19, 20, 21, 22, 23],
                }),
                frameRate: 8,
            });

            // - Shoot Diagonal Up Left/Right -
            scene.anims.create({
                key: `archerShootDiagonalUpRight${color}`,
                frames: scene.anims.generateFrameNumbers(`Archer_${color}`, {
                    frames: [24, 25, 26, 27, 28, 29, 30, 31],
                }),
                frameRate: 8,
            });

            // - Shoot Diagonal Left/Right -
            scene.anims.create({
                key: `archerShootRight${color}`,
                frames: scene.anims.generateFrameNumbers(`Archer_${color}`, {
                    frames: [32, 33, 34, 35, 36, 37, 38, 39],
                }),
                frameRate: 8,
            });

            // - Shoot Diagonal Down Left/Right -
            scene.anims.create({
                key: `archerShootDiagonalDownRight${color}`,
                frames: scene.anims.generateFrameNumbers(`Archer_${color}`, {
                    frames: [40, 41, 42, 43, 44, 45, 46, 47],
                }),
                frameRate: 8,
            });

            // - Shoot Down -
            scene.anims.create({
                key: `archerShootDown${color}`,
                frames: scene.anims.generateFrameNumbers(`Archer_${color}`, {
                    frames: [48, 49, 50, 51, 52, 53, 54, 55],
                }),
                frameRate: 8,
            });

            // --- GOBLIN ---
            // - Idle -
            scene.anims.create({
                key: `goblinIdleRight${color}`,
                frames: scene.anims.generateFrameNumbers(`Goblin_${color}`, {
                    frames: [0, 1, 2, 3, 4, 5, 6],
                }),
                frameRate: 8,
            });

            // - Walk -
            scene.anims.create({
                key: `goblinWalkRight${color}`,
                frames: scene.anims.generateFrameNumbers(`Goblin_${color}`, {
                    frames: [7, 8, 9, 10, 11, 12],
                }),
                frameRate: 8,
            });

            // - Attack Left/Right -
            scene.anims.create({
                key: `goblinAttackRight${color}`,
                frames: scene.anims.generateFrameNumbers(`Goblin_${color}`, {
                    frames: [14, 15, 16, 17, 18, 19],
                }),
                frameRate: 8,
            });

            // - Attack Down -
            scene.anims.create({
                key: `goblinAttackDown${color}`,
                frames: scene.anims.generateFrameNumbers(`Goblin_${color}`, {
                    frames: [21, 22, 23, 24, 25, 26],
                }),
                frameRate: 8,
            });

            // - Attack Up -
            scene.anims.create({
                key: `goblinAttackUp${color}`,
                frames: scene.anims.generateFrameNumbers(`Goblin_${color}`, {
                    frames: [28, 29, 30, 31, 32, 33],
                }),
                frameRate: 8,
            });
        });
        
        // --- DEATH ---
        scene.anims.create({
            key: 'death',
            frames: scene.anims.generateFrameNumbers('Death', {
                frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            }),
            frameRate: 7,
        });

        // --- FIRE ---
        scene.anims.create({
            key: 'fire',
            frames: scene.anims.generateFrameNumbers('Flame', {
                frames: [0, 1, 2, 3, 4, 5, 6],
            }),
            frameRate: 7,
            repeat: -1,
            randomFrame: true
        });

        // --- RESOURCE SPAWNERS ---
        // - Tree -
        scene.anims.create({
            key: 'treeIdle',
            frames: scene.anims.generateFrameNumbers('Tree', {
                frames: [0, 1, 2, 3],
            }),
            frameRate: 5,
            repeat: -1,
            randomFrame: true
        });

        // - Sheep -
        scene.anims.create({
            key: 'sheepIdle',
            frames: scene.anims.generateFrameNumbers('Sheep', {
                frames: [0, 1, 2, 3, 4, 5, 6, 7],
            }),
            duration: 800,
            repeat: -1,
            randomFrame: true
        });

        // --- FOAM ---
        scene.anims.create({
            key: 'Foam',
            frames: scene.anims.generateFrameNumbers('Foam', {
                frames: [0, 1, 2, 3, 4, 5, 6, 7],
            }),
            frameRate: 5,
            repeat: -1
        });

        // --- ROCK 1 ---
        scene.anims.create({
            key: 'Rock1',
            frames: scene.anims.generateFrameNumbers('Rocks', {
                frames: [0, 1, 2, 3, 4, 5, 6, 7],
            }),
            frameRate: 5,
            repeat: -1
        });

        // --- ROCK 2 ---
        scene.anims.create({
            key: 'Rock2',
            frames: scene.anims.generateFrameNumbers('Rocks', {
                frames: [8, 9, 10, 11, 12, 13, 14, 15],
            }),
            frameRate: 5,
            repeat: -1
        });

        // --- ROCK 3 ---
        scene.anims.create({
            key: 'Rock3',
            frames: scene.anims.generateFrameNumbers('Rocks', {
                frames: [16, 17, 18, 19, 20, 21, 22, 23],
            }),
            frameRate: 5,
            repeat: -1
        });

        // --- ROCK 4 ---
        scene.anims.create({
            key: 'Rock4',
            frames: scene.anims.generateFrameNumbers('Rocks', {
                frames: [24, 25, 26, 27, 28, 29, 30, 31],
            }),
            frameRate: 5,
            repeat: -1
        });
    }
}