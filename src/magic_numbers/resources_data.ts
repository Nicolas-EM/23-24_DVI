import { IconInfo } from "../utils";

namespace ResourcesData {

    // Wood
    export class Wood {
        public static ICON_INFO: IconInfo = {
            name: "Tree",
            width: 85,
            height: 85
        }
        public static ICON = "Wood";
        public static CAPACITY = 800;
        public static RATE = 10;
    }
    
    // Food
    export class Food {
        public static ICON_INFO: IconInfo = {
            name: "Sheep",
            width: 100,
            height: 100
        }
        public static ICON = "Food";
        public static CAPACITY = 1500;
        public static RATE = 10;
    }
    
    // Gold
    export class Gold {
        public static ICON_INFO: IconInfo = {
            name: "GoldMine",
            width: 85,
            height: 58
        }
        public static ICON = "Gold";
        public static CAPACITY = 3000;
        public static RATE = 10;
    }
};

export default ResourcesData;