var AIBuilder = {
   tick: function(creep) {
      let t = AIBuilder;

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
               //Build my construction sites
               let build = AI.Creep.Behavior.Build.Advanced.myConstructionSites(room, creep);
               if (!build) {
                  //Repair my structures
                  let repair = AI.Creep.Behavior.Repair.Advanced.myStructures(room, creep);
                  if (!repair) {
                     //Refuel my structures
                     let refuel = AI.Creep.Behavior.Refuel.Advanced.energyMyStructures(room, creep);
                     if (!refuel) {
                        //Upgrade Controller
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