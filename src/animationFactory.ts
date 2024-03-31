// src/animationFactory.ts

export namespace animationFactory {
    export function createAnimations(scene: Phaser.Scene) {
        //note: we can create only the ones we need for the game (but they're small and no memory issues are expected)
        const colors = ['Blue', 'Red', 'Yellow', 'Purple'];

        colors.forEach((color) => {

            scene.anims.create({
                key: `villagerIdle${color}`,
                frames: scene.anims.generateFrameNumbers(`Villager_${color}`, {
                    frames: [0, 1, 2, 3, 4, 5],
                }),
                frameRate: 8,

            });
            //we need to flip this when walking left
            scene.anims.create({
                key: `villagerWalk${color}`,
                frames: scene.anims.generateFrameNumbers(`Villager_${color}`, {
                    frames: [6, 7, 8, 9, 10, 11],
                }),
                frameRate: 8,

            });

            scene.anims.create({
                key: `villagerAxe${color}`,
                frames: scene.anims.generateFrameNumbers(`Villager_${color}`, {
                    frames: [18, 19, 20, 21, 22, 23],

                }),
                frameRate: 8,
                repeat: 5,

            });
            scene.anims.create({
                key: `villagerHammer${color}`,
                frames: scene.anims.generateFrameNumbers(`Villager_${color}`, {
                    frames: [12, 13, 14, 15, 16, 17],
                }),
                frameRate: 8,
                repeat: 5,

            });
            //maybe this mneeds to be flipped as well..?
            // scene.anims.create({
            //   key: "villagerCarrying",
            //   frames: scene.anims.generateFrameNumbers(`Villager_${color}`, {
            //     frames: [24, 25, 26, 27, 28, 29],
            //   }),
            //   frameRate: 8,
            //   
            // });
            // //also flip this when walking left
            // scene.anims.create({
            //   key: "villagerCarryWalk",
            //   frames: scene.anims.generateFrameNumbers(`Villager_${color}`, {
            //     frames: [30, 31, 32, 33, 34, 35],
            //   }),
            //   frameRate: 8,
            //   
            // });
            scene.anims.create({
                key: `soldierIdleRight${color}`,
                frames: scene.anims.generateFrameNumbers(`Soldier_${color}`, {
                    frames: [0, 1, 2, 3, 4, 5],
                }),
                frameRate: 8,

            });

            //note, walk left is the same as this but with setFlipX(true)
            scene.anims.create({
                key: `soldierWalkRight${color}`,
                frames: scene.anims.generateFrameNumbers(`Soldier_${color}`, {
                    frames: [6, 7, 8, 9, 10, 11],
                }),
                frameRate: 8,

            });
            //note, left attack is just this one, but call setFlipX(true) to attack left, then disable for normal behaviour.
            scene.anims.create({
                key: `soldierAttackRight${color}`,
                frames: scene.anims.generateFrameNumbers(`Soldier_${color}`, {
                    frames: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                }),
                frameRate: 8,

            });
            scene.anims.create({
                key: `soldierAttackDown${color}`,
                frames: scene.anims.generateFrameNumbers(`Soldier_${color}`, {
                    frames: [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
                }),
                frameRate: 8,

            });
            scene.anims.create({
                key: `soldierAttackUp${color}`,
                frames: scene.anims.generateFrameNumbers(`Soldier_${color}`, {
                    frames: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47],
                }),
                frameRate: 8,
            });
            scene.anims.create({
                key: `archerIdleRight${color}`,
                frames: scene.anims.generateFrameNumbers(`Archer_${color}`, {
                    frames: [0, 1, 2, 3, 4, 5],
                }),
                frameRate: 8,

            });
            //flip needed
            scene.anims.create({
                key: `archerWalkRight${color}`,
                frames: scene.anims.generateFrameNumbers(`Archer_${color}`, {
                    frames: [8,9,10,11,12,13],
                }),
                frameRate: 8,

            });
            //flip needed: down
            scene.anims.create({
                key: `archerShootUp${color}`,
                frames: scene.anims.generateFrameNumbers(`Archer_${color}`, {
                    frames: [16, 17, 18, 19, 20, 21, 22, 23],
                }),
                frameRate: 8,

            });
            //flip needed
            scene.anims.create({
                key: `archerShootDiagonalUpRight${color}`,
                frames: scene.anims.generateFrameNumbers(`Archer_${color}`, {
                    frames: [24, 25, 26, 27, 28, 29, 30, 31],
                }),
                frameRate: 8,

            });
            //flip needed
            scene.anims.create({
                key: `archerShootRight${color}`,
                frames: scene.anims.generateFrameNumbers(`Archer_${color}`, {
                    frames: [32, 33, 34, 35, 36, 37, 38, 39],
                }),
                frameRate: 8,

            });
            //flip needed
            scene.anims.create({
                key: `archerShootDiagonalDownRight${color}`,
                frames: scene.anims.generateFrameNumbers(`Archer_${color}`, {
                    frames: [40, 41, 42, 43, 44, 45, 46, 47],
                }),
                frameRate: 8,

            });
            //flip needed
            scene.anims.create({
                key: `archerShootDown${color}`,
                frames: scene.anims.generateFrameNumbers(`Archer_${color}`, {
                    frames: [48, 49, 50, 51, 52, 53, 54, 55],
                }),
                frameRate: 8,

            });
            //flip needed for all
            scene.anims.create({
                key: `goblinIdleRight${color}`,
                frames: scene.anims.generateFrameNumbers(`Goblin_${color}`, {
                    frames: [0, 1, 2, 3, 4, 5, 6],
                }),
                frameRate: 8,

            });
            scene.anims.create({
                key: `goblinWalkRight${color}`,
                frames: scene.anims.generateFrameNumbers(`Goblin_${color}`, {
                    frames: [7, 8, 9, 10, 11, 12],
                }),
                frameRate: 8,

            });
            scene.anims.create({
                key: `goblinAttackRight${color}`,
                frames: scene.anims.generateFrameNumbers(`Goblin_${color}`, {
                    frames: [13, 14, 15, 16, 17, 18],
                }),
                frameRate: 8,

            });
            scene.anims.create({
                key: `goblinAttackDown${color}`,
                frames: scene.anims.generateFrameNumbers(`Goblin_${color}`, {
                    frames: [19, 20, 21, 22, 23, 24],
                }),
                frameRate: 8,

            });
            scene.anims.create({
                key: `goblinAttackUp${color}`,
                frames: scene.anims.generateFrameNumbers(`Goblin_${color}`, {
                    frames: [25, 26, 27, 28, 29, 30],
                }),
                frameRate: 8,

            });
           
        });
        //same for all.. no duplicates here. 
        scene.anims.create({
            key: 'death',
            frames: scene.anims.generateFrameNumbers('Death', {
                frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            }),
        });
    }
}