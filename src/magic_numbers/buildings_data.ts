import { IconInfo, Resources } from "../utils";

namespace BuildingsData {

    // Townhall
    export class Townhall {
        public static ICON_INFO: IconInfo = {
            name: "Townhall_",
            width: 75,
            height: 65
        }
        public static HEALTH = 200;
        public static VISION_RANGE = 5;
    }

    // Villager House
    export class VillagerHouse {
        public static ICON_INFO: IconInfo = {
            name: "House_",        
            width: 55,
            height: 85
        }
        public static HEALTH = 100;
        public static VISION_RANGE = 1.5;
        public static SPAWNING_TIME = 10000;
        public static SPAWNING_COST: Resources = {
            wood: 10,
            food: 0,
            gold: 0
        }
        public static LIMIT_NPCS = 5;
    }

    // Tower
    export class Tower {
        public static ICON_INFO: IconInfo = {
            name: "Tower_",
            width: 55,
            height: 110
        }
        public static HEALTH = 100;
        public static VISION_RANGE = 3.5;
        public static SPAWNING_TIME = 10000;
        public static SPAWNING_COST: Resources = {
            wood: 10,
            food: 10,
            gold: 0
        }
    }
    
    // Hut
    export class Hut {
        public static ICON_INFO: IconInfo = {
            name: "Hut_",
            width: 55,
            height: 85
        }
        public static HEALTH = 100;
        public static VISION_RANGE = 2;
        public static SPAWNING_TIME = 10000;
        public static SPAWNING_COST: Resources = {
            wood: 10,
            food: 0,
            gold: 10
        }
    }
}

export default BuildingsData;