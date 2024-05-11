import { Resources } from "../utils";

namespace GeneralData {

    export class InitData {
        public static INIT_RESOURCES: Resources = {
            wood: 50,
            food: 50,
            gold: 0
        }
        public static MAX_POPULATION: number = 50;
    }

    export class ConfigData {
        public static MIN_ZOOM: number = 0.5;
        public static MAX_ZOOM: number = 1;
        public static ZOOM_AMOUNT: number = 0.05;
        public static MOVEMENT_OFFSET: number = 10;
    }
    
}

export default GeneralData;