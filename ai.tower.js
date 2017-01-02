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
      else {
         //Check if we should try to repair something
         //Get all of my structures that need repairing
         let structures = Utility.List.allStructuresInRoom(room, Utility.OWNERSHIP_MINE, false, function(structure) {
            return structure.hits < structure.hitsMax;
         });

         if (structures.length > 0) {
            //Get the group of structure structuresTypes that have priority
            let priorityGroup = Utility.Group.first(structures, t.filterStructureTypes);

            //Sort that group for distanceSquared
            let sortedStructures = Utility.Sort.Position.distanceSquared(priorityGroup, tower);

            //Select our priority structure
            let priorityStructure = sortedStructures[0];

            //Attempt to repair priority structure
            AI.Tower.Behavior.Repair.target(tower, priorityStructure);
         }
      }
   }
}

module.exports = AITower;