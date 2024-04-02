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
        public static VISION_RANGE = 5;
        public static SPEED = 2.5;
        public static SPAWNING_TIME = 5000;
        public static SPAWNING_COST: Resources = {
            wood: 0,
            food: 10,
            gold: 0
        }
    }
    
    // Soldier
    export class Soldier {
        public static ICON_INFO: IconInfo = {
            name: "Soldier_",
            width: 150,
            height: 150
        }
        public static HEALTH = 100;
        public static VISION_RANGE = 5;
        public static SPEED = 2.5;
        public static DAMAGE = 10;
        public static ATTACK_RANGE = 1;     // tiles
        public static ATTACK_COOLDOWN = 5;  // seconds
        public static SPAWNING_TIME = 5000;    
        public static SPAWNING_COST: Resources = {
            wood: 10,
            food: 10,
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
        public static HEALTH = 100;
        public static VISION_RANGE = 10;
        public static SPEED = 2.5;
        public static DAMAGE = 10;
        public static ATTACK_RANGE = 5;     // tiles
        public static ATTACK_COOLDOWN = 5;  // seconds
        public static SPAWNING_TIME = 5000;    
        public static SPAWNING_COST: Resources = {
            wood: 10,
            food: 10,
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
        public static HEALTH = 100;
        public static VISION_RANGE = 5;
        public static SPEED = 3.75;
        public static DAMAGE = 10;
        public static ATTACK_RANGE = 1;    // tiles
        public static ATTACK_COOLDOWN = 5;  // seconds
        public static SPAWNING_TIME = 5000;    
        public static SPAWNING_COST: Resources = {
            wood: 10,
            food: 0,
            gold: 10
        }
    }
};

export default NPCsData;