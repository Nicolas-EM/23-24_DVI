import { Resources } from "../utils";

namespace StartingData {

    export class InitData {
        public static INIT_RESOURCES: Resources = {
            wood: 100,
            food: 100,
            gold: 0
        }
        public static MAX_POPULATION: number = 10
    }
}

export default StartingData;