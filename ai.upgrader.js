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
               //Refuel at closest energy storage
               AI.Creep.Behavior.Refuel.Advanced.energyFromContainer(room, creep);
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