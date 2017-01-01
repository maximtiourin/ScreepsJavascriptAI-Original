/*
 * The foreman container is responsible for all task delegation for its sub containers
 */
var Foreman = {
   /*
    * Maintains predefined creep count for individual rooms that contain a self owned spawner
    */
   manageCreepCounts: {
      manage: function () {
         let spawns = Game.spawns;
         for (let index in spawns) {
            let spawn = spawns[index];

            //Check if spawn not currently spawning something
            if (!spawn.spawning) {
               if (Foreman.manageCreepCounts.manageHarvester(spawn)) ;
               else if (Foreman.manageCreepCounts.manageBuilder(spawn)) ;
            }
         }
      },
      manageBuilder: function (spawn) {
         let BUILDERS_PER_ROOM = 4;

         let room = spawn.room;
         let roomMem = room.memory;

         //Check if we have atleast one built sourceContainer
         if (roomMem.sourceContainerPointsGenerated) {
            let haveBuiltContainer = false;
            for (let key in roomMem.sourceContainerPoints) {
               let point = roomMem.sourceContainerPoints[key];

               //Check to see if there's a built container structure at point
               let found = room.lookForAt(LOOK_STRUCTURES, point.x, point.y);
               if (found.length > 0) {
                  for (let subkey in found) {
                     let structure = found[subkey];

                     if (structure.structureType === STRUCTURE_CONTAINER) {
                        //Found a built container, exit loop
                        haveBuiltContainer = true;
                        break;
                     }
                  }
               }

               if (haveBuiltContainer) {
                  break;
               }
            }

            if (haveBuiltContainer) {
               //We have a built container, lets check if we need any more builders spawned
               let builderCount = Utility.Count.creepsOfRoleAssignedToRoom(Factory.ROLE_BUILDER, room);

               if (builderCount < BUILDERS_PER_ROOM) {
                  if (Utility.Evaluate.isSpawnCurrentlyUsable(spawn)) {
                     Factory.Creep.BuilderSmall.spawn(spawn);
                     return true;
                  }
               }
            }
         }

         return false;
      },
      manageHarvester: function (spawn) {
         let room = spawn.room;
         let roomMem = room.memory;

         //Check all source points to count how many harvesters max we should have for this room
         let sourceCount = 0;
         for (let ax in roomMem.sourcePoints) {
            let sourcePoint = roomMem.sourcePoints[ax];

            for (let bx in sourcePoint.validPositions) {
               sourceCount++;
            }
         }

         //Count how many harvesters we currently have assigned to this room
         let harvesterCount = Utility.Count.creepsOfRoleAssignedToRoom(Factory.ROLE_HARVESTER, room);

         if (harvesterCount < sourceCount) {
            //Attempt to spawn a harvester
            if (Utility.Evaluate.isSpawnCurrentlyUsable(spawn)) {
               Factory.Creep.HarvesterSmall.spawn(spawn);
               return true;
            }
         }

         return false;
      }
   },
   tickCreeps: function() {
      let creeps = Game.creeps;
      for (let index in creeps) {
         let creep = creeps[index];
         
         if (Utility.Evaluate.isCreepRole(creep, Factory.ROLE_HARVESTER))  {
            AIHarvester.tick(creep);
         }
         else if (Utility.Evaluate.isCreepRole(creep, Factory.ROLE_BUILDER)) {
            AIBuilder.tick(creep);
         }
      }
   },
   tick: function() {
      Foreman.manageCreepCounts.manage();

      Foreman.tickCreeps();
   }     
};

module.exports = Foreman;