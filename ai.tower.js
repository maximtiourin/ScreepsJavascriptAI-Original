var AITower = {
   /*
    * Applies a filter value to an object with the property 'structureType', allowing it to be sorted in ascending order of most priority (0) to least priority (999)
    */
   filterStructureTypes: function(e) {
      if (e.structureType === STRUCTURE_CONTAINER) {
         return 1;
      }
      else if (e.structureType === STRUCTURE_EXTENSION) {
         return 2;
      }
      else if (e.structureType === STRUCTURE_TOWER) {
         return 3;
      }
      else {
         return 999;
      }
   },
   tick: function(tower) {
      let t = AITower;

      let room = tower.room;

      //First check if we should try to attack something
      let enemies = room.find(FIND_HOSTILE_CREEPS);
      if (enemies.length > 0) {
         //Sort Enemies by distance to tower
         let sortedEnemies = _.sortBy(enemies, [function(o) { return Utility.Math.distanceSquared(tower.pos, o.pos) }]);

         let target = sortedEnemies[0];

         AI.Tower.Behavior.Attack.target(tower, target);
      }
      else if (tower.energy > (tower.energyCapacity / 4)) {
         //Check if we should try to repair something
         //Get all of my structures that need repairing that are equal to or below 20% of their health, to prevent wasting tower energy
         let structures = Utility.List.allStructuresInRoom(room, Utility.OWNERSHIP_MINE, false, function(structure) {
            if (structure.structureType === STRUCTURE_RAMPART) {
               return structure.hits <= 60000;
            }
            else if (structure.structureType === STRUCTURE_WALL) {
               return structure.hits <= 10000;
            }
            else {
               return (structure.hits / (structure.hitsMax * 1.0)) <= .20;
            }
         });

         if (structures.length > 0) {
            //Get the group of structure structuresTypes that have priority
            //let priorityGroup = Utility.Group.first(structures, t.filterStructureTypes);

            //Sort that group for structureHits
            let sortedStructures = _.sortBy(structures, function(o) {
               if (o.structureType === STRUCTURE_RAMPART && o.hits <= 1000) {
                  return 0;
               }
               else if (o.structureType === STRUCTURE_WALL && o.hits <= 500) {
                  return 1;
               }
               else {
                  return Utility.Math.distanceSquared(o.pos, tower.pos) + 10; //Add arbitrary weight to distance so priority is always higher above
               }
            });

            //Select our priority structure
            let priorityStructure = sortedStructures[0];

            //Attempt to repair priority structure
            AI.Tower.Behavior.Repair.target(tower, priorityStructure);
         }
      }
   }
}

module.exports = AITower;