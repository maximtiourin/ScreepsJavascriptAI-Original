var AIUpgrader = {
   tick: function(creep) {
      let t = AIUpgrader;

      if (!creep.spawning) {
         let creepMem = creep.memory;
         let room = Game.rooms[creepMem.assignedRoom];

         if (room) {
            let roomMem = room.memory;

            if (creepMem.isRefueling && Utility.Evaluate.isCreepEnergyFull(creep)) {
               creepMem.isRefueling = false;
            }
            else if (!creepMem.isRefueling && Utility.Evaluate.isCreepEnergyEmpty(creep)) {
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