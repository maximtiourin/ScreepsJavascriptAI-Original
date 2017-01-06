var AIReserver = {
   tick: function(creep) {
      let t = AIReserver;

      if (!creep.spawning) {
         let creepMem = creep.memory;
         let room = Game.rooms[creepMem.assignedRoom];

         if (room) {
            let roomMem = room.memory;
            //Need to move to targetFlag room and mine a source
            if (creep.room.name === creep.memory.targetRoom) {
               let targetRoom = creep.room;

               let controller = targetRoom.controller;
               
               if (controller && controller.level > 0) {
                  //Owned controller, delete the flag
                  let flag = Game.flags[creepMem.targetFlag];
                  if (flag) {
                     flag.remove();
                     delete creepMem.targetFlag;
                     delete creepMem.targetRoom;
                  }
               }
               else {
                  //Check to make sure no dangerous enemies
                  let enemies = targetRoom.find(FIND_HOSTILE_CREEPS, {
                     filter: function(enemy) {
                        let bodyObjects = enemy.body;

                        let hasAttack = _.some(bodyObjects, function(value) {
                           return value.type === ATTACK || value.type === RANGED_ATTACK;
                        });

                        return hasAttack;
                     }
                  });
                  if (enemies.length > 0) {
                     //Hostile enemies around, delete flag
                     let flag = Game.flags[creepMem.targetFlag];
                     if (flag) {
                        flag.remove();
                        delete creepMem.targetFlag;
                        delete creepMem.targetRoom;
                     }
                  }
                  else {
                     //We are in our valid target room, lets do reserving
                     AI.Creep.Behavior.Reserve.target(creep, controller);
                  }
               }
            }
            else {
               //Lets move to our target room
               if (creepMem.targetFlag) {
                  let flag = Game.flags[creepMem.targetFlag];

                  if (flag) {
                     //Were in targetRoom, set the memory for comparison
                     if (!creepMem.targetRoom && flag.room && creep.room.name === flag.room.name) {
                        creepMem.targetRoom = flag.room.name;
                     }

                     //Move towards flag room
                     creep.moveTo(flag);
                  }
                  else {
                     //targetFlag no longer exists!
                     delete creepMem.targetFlag;
                     delete creepMem.targetRoom;
                  }
               }
            }
         }
      }
   }
}

module.exports = AIReserver;