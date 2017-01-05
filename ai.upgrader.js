var AIUpgrader = {
   isEnergyEmpty: function(creep) {
      return creep.carry.energy == 0;
   },
   isEnergyFull: function(creep) {
      return creep.carry.energy == creep.carryCapacity;
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
      let t = AIUpgrader;

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
               let containers = Utility.List.allStructuresInRoom(room, Utility.OWNERSHIP_MINE, false, function(structure) {
                  return structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_STORAGE;
               });
               if (containers.length > 0) {
                  //Get desirable containers by first trying to retrieve a group of containers that can fully refuel this creep, then settling for any
                  let filterContainers = Utility.Group.first(containers, t.filterContainersWithEnoughEnergy, t.getEnergyLeftToFill(creep));

                  //Sort filter containers by distanceSquared
                  let sortedFilterContainers = Utility.Sort.Position.distanceSquared(filterContainers, creep);

                  //Select closest container to refuel from
                  let closestContainer = sortedFilterContainers[0];

                  //See if we need to move away from an empty container
                  let moveAway = false;
                  if (Utility.Math.distanceSquared(creep.pos, closestContainer.pos) < 4) {
                     if (closestContainer.store[RESOURCE_ENERGY] == 0) {
                        //Move away from container to free up space
                        moveAway = true;
                        creep.moveTo(room.controller);
                     }
                  }

                  if (!moveAway) {
                     AI.Creep.Behavior.Refuel.fromTarget(creep, closestContainer, RESOURCE_ENERGY);
                  }
               }
            }
            else {
               //Upgrade controller
               AI.Creep.Behavior.Upgrade.target(creep, room.controller);
            }
         }
      }
   }
}

module.exports = AIUpgrader;