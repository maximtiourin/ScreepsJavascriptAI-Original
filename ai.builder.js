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
      if (e.structureType === STRUCTURE_RAMPART) {
         return 0;
      }
      else if (e.structureType === STRUCTURE_CONTAINER) {
         return 1;
      }
      else if (e.structureType === STRUCTURE_EXTENSION) {
         return 2;
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
                  let desirableContainers = _.filter(containers, function(container) {
                     return container.store[RESOURCE_ENERGY] >= t.getEnergyLeftToFill(creep);
                  });

                  let filterContainers = [];
                  if (desirableContainers.length > 0) {
                     //Add only desirable containers to distance filtering list
                     _.forEach(desirableContainers, function(value) {
                        filterContainers.push(value);
                     });
                  }
                  else {
                     //No desirable containers, add undesirables to distance filtering list
                     _.forEach(containers, function(value) {
                        filterContainers.push(value);
                     });
                  }

                  //Sort filter containers by distanceSquared
                  let sortedFilterContainers = _.sortBy(filterContainers, [function(o) { return Utility.Math.distanceSquared(creep.pos, o.pos) }]);

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
                  //Group construction sites by their priority
                  let groupedSites = _.groupBy(sites, t.filterStructureTypes);

                  //Get the group with the highest priority
                  let groupKey = Object.keys(groupedSites)[0];
                  let priorityGroup = groupedSites[groupKey];

                  //Sort that group for distanceSquared
                  let sortedPriorities = _.sortBy(priorityGroup, [function(o) { return Utility.Math.distanceSquared(creep.pos, o.pos) }]);

                  //Select our priority site
                  let sortedKey = Object.keys(sortedPriorities)[0];
                  let prioritySite = sortedPriorities[sortedKey];

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
                     //Group structures by their priority
                     let groupedStructures = _.groupBy(structures, t.filterStructureTypes);

                     //Get the group with the highest priority
                     let groupKey = Object.keys(groupedStructures)[0];
                     let priorityGroup = groupedStructures[groupKey];

                     //Sort that group for distanceSquared
                     let sortedStructures = _.sortBy(priorityGroup, [function(o) { return Utility.Math.distanceSquared(creep.pos, o.pos) }]);

                     //Select our priority structure
                     let sortedKey = Object.keys(sortedStructures)[0];
                     let priorityStructure = sortedStructures[sortedKey];

                     //Attempt to repair priority structure
                     AI.Creep.Behavior.Repair.target(creep, priorityStructure);
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

module.exports = AIBuilder;