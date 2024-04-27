import { Resources } from "../utils";

namespace StartingData {

    export class InitData {
        public static INIT_RESOURCES: Resources = {
            wood: 50,
            food: 50,
            gold: 0
        }
        public static MAX_POPULATION: number = 50
    }
}

export default StartingData;