var AIRefueler = {
   isEnergyEmpty: function(creep) {
      return creep.carry.energy == 0;
   },
   isEnergyFull: function(creep) {
      return creep.carry.energy == creep.carryCapacity;
   },
   /*
    * Applies a filter value to an object with the property 'structureType', allowing it to be sorted in ascending order of most priority (0) to least priority (999)
    */
   filterStructureTypes: function(e) {
      if (e.structureType === STRUCTURE_SPAWN) {
         return 1;
      }
      else if (e.structureType === STRUCTURE_EXTENSION) {
         return 2;
      }
      else {
         return 999;
      }
   },
   filterContainersWithEnoughEnergy: function(e, ...[energy]) {
      if (e.store[RESOURCE_ENERGY] >= energy) {
         return 0;
      }
      else {
         return 999;
      }
   },
   getEnergyLeftToFill: function(creep) {
      return creep.carryCapacity - creep.carry.energy;
   },
   tick: function(creep) {
      let t = AIRefueler;

      if (!creep.spawning) {
         let creepMem = creep.memory;
         let room = Game.rooms[creepMem.assignedRoom];

         if (room) {
            let roomMem = room.memory;

            if (creepMem.isRefueling && t.isEnergyFull(creep)) {
               creepMem.isRefueling = false;
            }
            else if (!creepMem.isRefueling && t.isEnergyEmpty(creep)) {
               creepMem.isRefueling = true;
            }

            if (creepMem.isRefueling) {
               //Find the closest container to refuel at, prioritizing containers that can fully fill this creep's carry
               let containers = Utility.List.allStructuresOfTypeInRoom(room, STRUCTURE_CONTAINER);
               if (containers.length > 0) {
                  //Get desirable containers by first trying to retrieve a group of containers that can fully refuel this creep, then settling for any
                  let filterContainers = Utility.Group.first(containers, t.filterContainersWithEnoughEnergy, t.getEnergyLeftToFill(creep));

                  //Sort filter containers by distanceSquared
                  let sortedFilterContainers = Utility.Sort.Position.distanceSquared(filterContainers, creep);

                  //Select closest container to refuel from
                  let closestContainer = sortedFilterContainers[0];

                  AI.Creep.Behavior.Refuel.fromTarget(creep, closestContainer, RESOURCE_ENERGY);
               }
            }
            else {
               //Find a priority structure to refuel that needs fuel
               let structures = Utility.List.allStructuresInRoom(room, Utility.OWNERSHIP_MINE, false, function(structure) {
                  return (structure.structureType === STRUCTURE_SPAWN || structure.structureType === STRUCTURE_EXTENSION) 
                        && (structure.energy < structure.energyCapacity);
               });

               if (structures.length > 0) {
                  let priorityGroup = Utility.Group.first(structures, t.filterStructureTypes);

                  let sortedPriorityGroup = Utility.Sort.Position.distanceSquared(priorityGroup, creep);

                  let closestStructure = sortedPriorityGroup[0];

                  AI.Creep.Behavior.Refuel.target(creep, closestStructure, RESOURCE_ENERGY);
               }
               else {
                  //Try to upgrade controller instead of idling
                  AI.Creep.Behavior.Upgrade.target(creep, room.controller);
               }
            }
         }
      }
   }
}

module.exports = AIRefueler;