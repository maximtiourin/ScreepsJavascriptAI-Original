var AIBuilder = {
   isEnergyEmpty: function(creep) {
      return creep.carry.energy == 0;
   },
   isEnergyFull: function(creep) {
      return creep.carry.energy == creep.carryCapacity;
   },
   /*
    * Applies a filter value to a construction site, allowing it to be sorted in ascending order of most priority (0) to least priority (999)
    */
   filterConstructionSites: function(site) {
      if (site.structureType === STRUCTURE_CONTAINER) {
         return 0;
      }
      else if (site.structureType === STRUCTURE_EXTENSION) {
         return 1;
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

                  let ret = creep.withdraw(closestContainer, RESOURCE_ENERGY);

                  if (ret == ERR_NOT_IN_RANGE) {
                     creep.moveTo(closestContainer);
                  }
                  else if (ret != OK && ret != ERR_NOT_ENOUGH_RESOURCES) {
                     t.handleError("Builder Refuel at Container", creep, ret);
                  }
               }
            }
            else {
               //Find construction sites to build, priotizing accordingly. If there are no construction sites, find things to repair.
               let sites = Utility.List.allConstructionSitesInRoom(room, Utility.OWNERSHIP_MINE);

               if (sites.length > 0) {
                  //Build construction site
                  //Group construction sites by their priority
                  let groupedSites = _.groupBy(sites, t.filterConstructionSites);

                  //Get the group with the highest priority
                  let groupKey = Object.keys(groupedSites)[0];
                  let priorityGroup = groupedSites[groupKey];

                  //Sort that group for distanceSquared
                  let sortedPriorities = _.sortBy(priorityGroup, [function(o) { return Utility.Math.distanceSquared(creep.pos, o.pos) }]);

                  //Select our priority site
                  let sortedKey = Object.keys(sortedPriorities)[0];
                  let prioritySite = sortedPriorities[sortedKey];

                  //Attempt to build our priority site
                  let ret = creep.build(prioritySite);

                  if (ret == ERR_NOT_IN_RANGE) {
                     creep.moveTo(prioritySite);
                  }
                  else if (ret != OK) {
                     t.handleError("Builder Build at Construction Site", creep, ret);
                  }
               }
               else {
                  // {TODO} Look for something to repair
               }
            }
         }
      }
   }
}

module.exports = AIBuilder;