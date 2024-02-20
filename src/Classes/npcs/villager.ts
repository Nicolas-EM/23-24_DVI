import npc from './npc';

export default class villager extends npc {

    public villager(id?: string, owner: Player, X: number, Y: number, health: number, visionRange?: number){
        super(id, owner, X, Y, health, visionRange);
    }

    /**
     * @param buildingId id of the building (town hall, hut, etc...)
     * @param X x coordinate of the soon-to-be built building.
     * @param Y y coordinate of the soon-to-be built building.
     */
    buildOrder(buildingId: number,X: number, Y: number){

    }

    /**
     * @summary build order complete, spawn completed building
     * //TODO
     */
    build(){

    }
    
    gather(){

    }
}