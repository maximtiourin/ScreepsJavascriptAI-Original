var AIReclaimer = {
   isEnergyEmpty: function(creep) {
      return creep.carry.energy == 0;
   },
   isEnergyFull: function(creep) {
      return creep.carry.energy == creep.carryCapacity;
   },
   tick: function(creep) {
      let t = AIReclaimer;

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
               //Search for loose energy to pickup
               let energies = room.find(FIND_DROPPED_ENERGY);
               if (energies.length > 0) {
                  let sortedEnergies = Utility.Sort.Position.distanceSquared(energies, creep);

                  let energy = sortedEnergies[0];

                  AI.Creep.Behavior.Pickup.target(creep, energy);
               }
               else {
                  //No energy to pick up right now, deposit what we have if we have something, otherwise move towards spawn so as to not block space
                  if (t.isEnergyEmpty(creep)) {
                     if (creepMem.targetSpawn) {
                        let spawn = Game.getObjectById(creepMem.targetSpawn);

                        if (spawn) {
                           creep.moveTo(spawn);
                        }
                     }
                  }
                  else {
                     creepMem.isRefueling = false;
                  }
               }
            }
            else {
               //Deposit loose energy
               //Find the closest container to deposit to
               let containers = Utility.List.allStructuresInRoom(room, Utility.OWNERSHIP_MINE, false, function(structure) {
                  return structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_STORAGE;
               });
               if (containers.length > 0) {
                  let sortedContainers = _.sortBy(containers, function(structure) {
                     //Weigh the containers by fillPercentage and their distanceSquare
                     let percentage = 1.0;
                     if (structure.structureType === STRUCTURE_STORAGE) {
                        //Convert storage percentage to container percentage
                        percentage = Utility.Count.containerResources(structure) / 1000000.0;
                     }
                     else {
                        //Must be a regular container
                        percentage = Utility.Count.containerResources(structure) / 2000.0;
                     }

                     return (percentage * 71) + Utility.Math.distanceSquared(creep.pos, structure.pos); //magic number 71 is the average diagonal distance of the room
                  });

                  //Get the closest container by path
                  let container = sortedContainers[0];

                  AI.Creep.Behavior.Refuel.target(creep, container, RESOURCE_ENERGY);
               }
               else {
                  creepMem.isRefueling = true;
               }
            }
         }
      }
   }
}

module.exports = AIReclaimer;