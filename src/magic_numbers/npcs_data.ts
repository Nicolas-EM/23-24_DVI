import { IconInfo, Resources } from "../utils";

namespace NPCsData {

    // Villager
    export class Villager {
        public static ICON_INFO: IconInfo = {
            name: "Villager_",
            width: 200,
            height: 200
        }
        public static HEALTH = 100;
        public static SPEED = 2.5;
        public static SPAWNING_TIME = 15000;
        public static SPAWNING_COST: Resources = {
            wood: 0,
            food: 25,
            gold: 0
        }
        public static GATHER_COOLDOWN = 7.5;
    }
    
    // Soldier
    export class Soldier {
        public static ICON_INFO: IconInfo = {
            name: "Soldier_",
            width: 150,
            height: 150
        }
        public static HEALTH = 250;
        public static SPEED = 2.5;
        public static DAMAGE = 25;
        public static BONUS_DAMAGE = 1.25;
        public static ATTACK_RANGE = 1; // tiles
        public static ATTACK_COOLDOWN = 3; // seconds
        public static SPAWNING_TIME = 23000;
        public static SPAWNING_COST: Resources = {
            wood: 0,
            food: 75,
            gold: 0
        }
    }

    // Archer
    export class Archer {
        public static ICON_INFO: IconInfo = {
            name: "Archer_",
            width: 150,
            height: 150
        }
        public static HEALTH = 150;
        public static SPEED = 2.5;
        public static DAMAGE = 20;
        public static BONUS_DAMAGE = 1.25;
        public static ATTACK_RANGE = 10;
        public static ATTACK_COOLDOWN = 3;
        public static SPAWNING_TIME = 20000; 
        public static SPAWNING_COST: Resources = {
            wood: 40,
            food: 25,
            gold: 0
        }
    }

    // Goblin
    export class Goblin {
        public static ICON_INFO: IconInfo = {
            name: "Goblin_",
            width: 150,
            height: 150
        }
        public static HEALTH = 175;
        public static SPEED = 3.75;
        public static DAMAGE = 17;
        public static BONUS_DAMAGE = 1.25;
        public static ATTACK_RANGE = 1;
        public static ATTACK_COOLDOWN = 3;
        public static SPAWNING_TIME = 18000;
        public static SPAWNING_COST: Resources = {
            wood: 25,
            food: 0,
            gold: 40
        }
    }
};

export default NPCsData;