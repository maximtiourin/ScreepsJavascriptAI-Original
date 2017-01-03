var AIBuilder = {
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
   filterStructureRefuelTypes: function(e) {
      if (e.structureType === STRUCTURE_SPAWN) {
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
   handleError: function(desc, creep, error) {
      console.log("CREEP ERROR: [" + desc + "] " + creep.name + " {" + creep.id + "} code: " + error);
   },
   tick: function(creep) {
      let t = AIBuilder;

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
               //Find construction sites to build, priotizing accordingly. If there are no construction sites, find things to repair.
               let sites = Utility.List.allConstructionSitesInRoom(room, Utility.OWNERSHIP_MINE);

               if (sites.length > 0) {
                  //Build construction site
                  //Get the group of constructionSite structuresTypes that have priority
                  let priorityGroup = Utility.Group.first(sites, t.filterStructureTypes);

                  //Sort that group for distanceSquared
                  let sortedPriorities = Utility.Sort.Position.distanceSquared(priorityGroup, creep);

                  //Select our priority site
                  let prioritySite = sortedPriorities[0];

                  //Attempt to build our priority site
                  AI.Creep.Behavior.Build.target(creep, prioritySite);
               }
               else {
                  //Look for something to repair
                  //Get all of my structures that need repairing
                  let structures = Utility.List.allStructuresInRoom(room, Utility.OWNERSHIP_MINE, false, function(structure) {
                     return structure.hits < structure.hitsMax;
                  });

                  if (structures.length > 0) {
                     //Get the group of structure structuresTypes that have priority
                     let priorityGroup = Utility.Group.first(structures, t.filterStructureTypes);

                     //Sort that group for distanceSquared
                     let sortedStructures = Utility.Sort.Position.distanceSquared(priorityGroup, creep);

                     //Select our priority structure
                     let priorityStructure = sortedStructures[0];

                     //Attempt to repair priority structure
                     AI.Creep.Behavior.Repair.target(creep, priorityStructure);
                  }
                  else {
                     //Look for something to refuel
                     //Find a priority structure to refuel that needs fuel
                     let refuelStructures = Utility.List.allStructuresInRoom(room, Utility.OWNERSHIP_MINE, false, function(structure) {
                        return (structure.energy < structure.energyCapacity);
                     });

                     if (refuelStructures.length > 0) {
                        let priorityGroup = Utility.Group.first(refuelStructures, t.filterStructureRefuelTypes);

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
   }
}

module.exports = AIBuilder;