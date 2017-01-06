var AILongRangeHarvester = {
   isEnergyEmpty: function(creep) {
      return creep.carry.energy == 0;
   },
   isEnergyFull: function(creep) {
      return creep.carry.energy == creep.carryCapacity;
   },
   tick: function(creep) {
      let t = AILongRangeHarvester;

      if (!creep.spawning) {
         let creepMem = creep.memory;
         let room = Game.rooms[creepMem.assignedRoom];

         if (room) {
            let roomMem = room.memory;

            if (creepMem.isHarvesting && t.isEnergyFull(creep)) {
               creepMem.isHarvesting = false;
            }
            else if (!creepMem.isHarvesting && t.isEnergyEmpty(creep)) {
               creepMem.isHarvesting = true;
            }

            if (creepMem.isHarvesting) {
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

                        creepMem.isHarvesting = false;
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

                           creepMem.isHarvesting = false;
                        }
                     }
                     else {
                        //We are in our valid target room, lets do harvesting
                        let closestSource = creep.pos.findClosestByPath(FIND_SOURCES);

                        if (closestSource) {
                           AI.Creep.Behavior.Harvest.target(creep, closestSource);
                        }
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

                        creepMem.isHarvesting = false;
                     }
                  }
               }
            }
            else {
               //Need to deposit source!
               if (creepMem.targetContainer) {
                  let container = Game.getObjectById(creepMem.targetContainer);

                  if (container) {
                     if (Utility.Count.containerResources(container) < container.storeCapacity) {
                        AI.Creep.Behavior.Refuel.target(creep, container, RESOURCE_ENERGY);
                     }
                     else {
                        delete creepMem.targetContainer;
                     }
                  }
                  else {
                     delete creepMem.targetContainer;
                  }
               }
               else {
                  let containers = Utility.List.allStructuresInRoom(room, Utility.OWNERSHIP_MINE, false, function(structure) {
                     return structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_STORAGE;
                  });
                  if (containers.length > 0) {
                     let sortedContainers = _.sortBy(containers, function(structure) {
                        //Weigh the containers by fillPercentage and their distanceSquare
                        let percentage = 1.0;
                        if (structure.structureType === STRUCTURE_STORAGE) {
                           //Convert storage percentage to container percentage, prioritize storage
                           percentage = Utility.Count.containerResources(structure) / 1000000.0;
                        }
                        else {
                           //Must be a regular container
                           percentage = (Utility.Count.containerResources(structure) / 2000.0) * 1.2;
                        }

                        return percentage; //unlike reclaimer, LRH doesnt compare distance, due to 'cheap' distanceSquared calculation not being simple between rooms
                     });

                     let container = sortedContainers[0];

                     creepMem.targetContainer = container.id;

                     AI.Creep.Behavior.Refuel.target(creep, container, RESOURCE_ENERGY);
                  }
               }
            }
         }
      }
   }
}

module.exports = AILongRangeHarvester;