/*
 * The foreman container is responsible for all task delegation for its sub containers
 */
var Foreman = {
   FLAG_DEPLOYMENT: "DeploymentFlag",
   FLAG_LONGRANGEHARVESTING: "LongRangeHarvestingFlag",
   FLAG_RESERVATION: "ReservationFlag",
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
               else if (Foreman.manageCreepCounts.manageReclaimer(spawn)) ;
               else if (Foreman.manageCreepCounts.manageRefueler(spawn)) ;
               else if (Foreman.manageCreepCounts.manageBuilder(spawn)) ;
               else if (Foreman.manageCreepCounts.manageUpgrader(spawn)) ;
               else if (Foreman.manageCreepCounts.manageLongRangeHarvester(spawn)) ;
               else if (Foreman.manageCreepCounts.manageReserver(spawn)) ;
               else if (Foreman.manageCreepCounts.manageHauler(spawn)) ;
            }
         }
      },
      manageBuilder: function (spawn) {
         let BUILDERS_PER_ROOM = 6;

         let room = spawn.room;
         let roomMem = room.memory;

         //[CACHED] Check if we have atleast one built sourceContainer
         let haveBuiltContainer = TickCache.cache('Foreman_haveBuiltSourceContainer', function() {
            if (roomMem.sourceContainerPointsGenerated) {
               for (let key in roomMem.sourceContainerPoints) {
                  let point = roomMem.sourceContainerPoints[key];

                  //Check to see if there's a built container structure at point
                  let found = room.lookForAt(LOOK_STRUCTURES, point.x, point.y);
                  if (found.length > 0) {
                     for (let subkey in found) {
                        let structure = found[subkey];

                        if (structure.structureType === STRUCTURE_CONTAINER) {
                           //Found a built container
                           return true;
                        }
                     }
                  }
               }
            }

            return false;
         });

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
      },
      manageHauler: function (spawn) {
         let HAULERS_PER_ROOM = 3;

         let room = spawn.room;
         let roomMem = room.memory;

         if (room.storage && (Utility.Count.containerResources(room.storage) < room.storage.storeCapacity)) {
            //Count how many haulers we currently have assigned to this room
            let haulerCount = Utility.Count.creepsOfRoleAssignedToRoom(Factory.ROLE_HAULER, room);

            if (haulerCount < HAULERS_PER_ROOM) {
               //Attempt to spawn a harvester
               if (Utility.Evaluate.isSpawnCurrentlyUsable(spawn)) {
                  Factory.Creep.Hauler.spawn(spawn);
                  return true;
               }
            }
         }

         return false;
      },
      manageLongRangeHarvester: function(spawn) {
         let HARVESTERS_PER_FLAG = 5;

         let room = spawn.room;
         let roomMem = room.memory;
         let controller = room.controller;

         if (controller) {
            if (controller.level >= 3) {
               let flags = Game.flags;

               for (let key in flags) {
                  let flag = flags[key];

                  if (key.indexOf(Foreman.FLAG_LONGRANGEHARVESTING) !== -1) {
                     //This is a LRH flag.
                     let harvesterCount = Utility.Count.creepsOfRoleAssignedToRoom(Factory.ROLE_LONGRANGEHARVESTER, room, function(creep) { return creep.memory.targetFlag === key });

                     if (harvesterCount < HARVESTERS_PER_FLAG) {
                        if (room.energyAvailable > (room.energyCapacityAvailable / 3) && room.energyAvailable >= Factory.Creep.LongRangeHarvester.cost) {
                           //Create deployed LRH
                           Factory.Creep.LongRangeHarvester.spawn(spawn, key);
                           return true;
                        }
                     }
                  }
               }
            }
         }

         return false;
      },
      manageReclaimer: function (spawn) {
         let RECLAIMERS_PER_ROOM = 1;

         let room = spawn.room;
         let roomMem = room.memory;

         //[CACHED] Check if we have atleast one built sourceContainer
         let haveBuiltContainer = TickCache.cache('Foreman_haveBuiltSourceContainer', function() {
            if (roomMem.sourceContainerPointsGenerated) {
               for (let key in roomMem.sourceContainerPoints) {
                  let point = roomMem.sourceContainerPoints[key];

                  //Check to see if there's a built container structure at point
                  let found = room.lookForAt(LOOK_STRUCTURES, point.x, point.y);
                  if (found.length > 0) {
                     for (let subkey in found) {
                        let structure = found[subkey];

                        if (structure.structureType === STRUCTURE_CONTAINER) {
                           //Found a built container
                           return true;
                        }
                     }
                  }
               }
            }

            return false;
         });

         if (haveBuiltContainer) {
            //We have a built container, lets check if we need any more reclaimers spawned
            let reclaimerCount = Utility.Count.creepsOfRoleAssignedToRoom(Factory.ROLE_RECLAIMER, room);

            if (reclaimerCount < RECLAIMERS_PER_ROOM) {
               if (Utility.Evaluate.isSpawnCurrentlyUsable(spawn)) {
                  Factory.Creep.Reclaimer.spawn(spawn);
                  return true;
               }
            }
         }

         return false;
      },
      manageRefueler: function (spawn) {
         let REFUELERS_PER_ROOM = 4;

         let room = spawn.room;
         let roomMem = room.memory;

         //[CACHED] Check if we have atleast one built sourceContainer
         let haveBuiltContainer = TickCache.cache('Foreman_haveBuiltSourceContainer', function() {
            if (roomMem.sourceContainerPointsGenerated) {
               for (let key in roomMem.sourceContainerPoints) {
                  let point = roomMem.sourceContainerPoints[key];

                  //Check to see if there's a built container structure at point
                  let found = room.lookForAt(LOOK_STRUCTURES, point.x, point.y);
                  if (found.length > 0) {
                     for (let subkey in found) {
                        let structure = found[subkey];

                        if (structure.structureType === STRUCTURE_CONTAINER) {
                           //Found a built container
                           return true;
                        }
                     }
                  }
               }
            }

            return false;
         });

         if (haveBuiltContainer) {
            //We have a built container, lets check if we need any more refuelers spawned
            let refuelerCount = Utility.Count.creepsOfRoleAssignedToRoom(Factory.ROLE_REFUELER, room);

            if (refuelerCount < REFUELERS_PER_ROOM) {
               if (Utility.Evaluate.isSpawnCurrentlyUsable(spawn)) {
                  Factory.Creep.RefuelerSmall.spawn(spawn);
                  return true;
               }
            }
         }

         return false;
      },
      manageReserver: function(spawn) {
         let RESERVERS_PER_FLAG = 1;
         let TICKS_TO_LAPSE = 150;

         let room = spawn.room;
         let roomMem = room.memory;
         let controller = room.controller;

         if (controller) {
            if (controller.level >= 3) {
               let flags = Game.flags;

               for (let key in flags) {
                  let flag = flags[key];

                  if (key.indexOf(Foreman.FLAG_RESERVATION) !== -1) {
                     //This is a Reservation flag.
                     let reserverCount = Utility.Count.creepsOfRoleAssignedToRoom(Factory.ROLE_RESERVER, room, function(creep) { return creep.memory.targetFlag === key });

                     let spawnReserver = false;
                     if (reserverCount < RESERVERS_PER_FLAG) {
                        spawnReserver = true;
                     }
                     else if (reserverCount == RESERVERS_PER_FLAG){
                        //Check if we need to preemptively spawn a reserver, so that the reservation doesnt lapse before the new one can get there
                        let expiringReservers = _.filter(Game.creeps, function(creep) {
                           return (creep.memory.role === Factory.ROLE_RESERVER) && (creep.memory.assignedRoom === room.name) && (creep.memory.targetFlag === key)
                                 && (creep.ticksToLive < TICKS_TO_LAPSE);
                        });

                        if (expiringReservers.length > 0) {
                           spawnReserver = true;
                        }
                     }

                     if (spawnReserver) {
                        if (room.energyAvailable >= Factory.Creep.Reserver.cost) {
                           //Create deployed reserver
                           Factory.Creep.Reserver.spawn(spawn, key);
                           return true;
                        }
                     }
                  }
               }
            }
         }

         return false;
      },
      manageUpgrader: function (spawn) {
         let UPGRADERS_PER_ROOM = 2;

         let room = spawn.room;
         let roomMem = room.memory;

         //[CACHED] Check if we have atleast one built sourceContainer
         let haveBuiltContainer = TickCache.cache('Foreman_haveBuiltSourceContainer', function() {
            if (roomMem.sourceContainerPointsGenerated) {
               for (let key in roomMem.sourceContainerPoints) {
                  let point = roomMem.sourceContainerPoints[key];

                  //Check to see if there's a built container structure at point
                  let found = room.lookForAt(LOOK_STRUCTURES, point.x, point.y);
                  if (found.length > 0) {
                     for (let subkey in found) {
                        let structure = found[subkey];

                        if (structure.structureType === STRUCTURE_CONTAINER) {
                           //Found a built container
                           return true;
                        }
                     }
                  }
               }
            }

            return false;
         });

         if (haveBuiltContainer) {
            //We have a built container, lets check if we need any more upgraders spawned
            let upgraderCount = Utility.Count.creepsOfRoleAssignedToRoom(Factory.ROLE_UPGRADER, room);

            if (upgraderCount < UPGRADERS_PER_ROOM) {
               if (Utility.Evaluate.isSpawnCurrentlyUsable(spawn)) {
                  Factory.Creep.UpgraderMedium.spawn(spawn);
                  return true;
               }
            }
         }

         return false;
      }
   },
   manageEmergencies: {
      manage: function() {
         let t = Foreman.manageEmergencies;

         let spawns = Game.spawns;
         for (let index in spawns) {
            let spawn = spawns[index];

            let room = spawn.room;

            t.manageSafeMode(room);            
         }
      },
      manageSafeMode: function(room) {
         let controller = room.controller;

         if (controller) {
            if (!controller.safeMode && !controller.safeModeCooldown && controller.safeModeAvailable > 0) {
               //Check if any enemies in room
               let enemies = room.find(FIND_HOSTILE_CREEPS);

               if (enemies.length > 0) {
                  //Check if we have a tower that can defend itself
                  let towers = Utility.List.allStructuresOfTypeInRoom(room, STRUCTURE_TOWER, Utility.OWNERSHIP_MINE, true, function(tower) {
                     return tower.energy >= 10;
                  });

                  if (towers.length <= 0) {
                     //Activate safe mode, we don't have a capable tower
                     controller.activateSafeMode();
                  }
               }
            }
         }
      }
   },
   manageWar: {
      manage: function() {
         let t = Foreman.manageWar;

         if (ENABLE_WAR) {
            let spawns = Game.spawns;
            for (let index in spawns) {
               let spawn = spawns[index];

               let room = spawn.room;

               t.manageBorderExpansion(room, spawn);            
            }
         }
         else {
            //Flag-based cleansers
            let spawns = Game.spawns;
            for (let index in spawns) {
               let spawn = spawns[index];

               let room = spawn.room;

               t.manageDeployment(room, spawn);            
            }
         }
      },
      manageBorderExpansion: function(room, spawn) {
         let controller = room.controller;

         if (controller) {
            if (controller.level >= 3) {
               let exits = Game.map.describeExits(room.name);

               if (exits) {
                  for (let key in exits) {
                     let exit = exits[key];

                     let cleanserCount = Utility.Count.creepsOfRoleAssignedToRoom(Factory.ROLE_CLEANSER, room, function(creep) { return creep.memory.targetRoom === exit });

                     if (cleanserCount < 1) {
                        if (room.energyAvailable == room.energyCapacityAvailable) {
                           //console.log("Spawn Cleanser towards: " + exit);

                           //Full on energy, lets use it to 'expand'
                           Factory.Creep.Cleanser.spawn(spawn, exit);
                        }
                     }
                  }
               }
            }
         }
      },
      manageDeployment: function(room, spawn) {
         let controller = room.controller;

         if (controller) {
            if (controller.level >= 3) {
               let flags = Game.flags;

               for (let key in flags) {
                  let flag = flags[key];

                  if (key.indexOf(Foreman.FLAG_DEPLOYMENT) !== -1) {
                     //This is a deployment flag.
                     let cleanserCount = Utility.Count.creepsOfRoleAssignedToRoom(Factory.ROLE_CLEANSER, room, function(creep) { return creep.memory.targetFlag === key });

                     if (cleanserCount < 1) {
                        if (room.energyAvailable >= Factory.Creep.Cleanser.cost) {
                           //Create deployed cleanser
                           Factory.Creep.Cleanser.spawn(spawn, undefined, undefined, key);
                        }
                     }
                  }
               }
            }
         }
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
         else if (Utility.Evaluate.isCreepRole(creep, Factory.ROLE_RECLAIMER)) {
            AIReclaimer.tick(creep);
         }
         else if (Utility.Evaluate.isCreepRole(creep, Factory.ROLE_REFUELER)) {
            AIRefueler.tick(creep);
         }
         else if (Utility.Evaluate.isCreepRole(creep, Factory.ROLE_UPGRADER)) {
            AIUpgrader.tick(creep);
         }
         else if (Utility.Evaluate.isCreepRole(creep, Factory.ROLE_CLEANSER)) {
            AICleanser.tick(creep);
         }
         else if (Utility.Evaluate.isCreepRole(creep, Factory.ROLE_LONGRANGEHARVESTER)) {
            AILongRangeHarvester.tick(creep);
         }
         else if (Utility.Evaluate.isCreepRole(creep, Factory.ROLE_RESERVER)) {
            AIReserver.tick(creep);
         }
         else if (Utility.Evaluate.isCreepRole(creep, Factory.ROLE_HAULER)) {
            AIHauler.tick(creep);
         }
      }
   },
   tickTowers: function() {
      let spawns = Game.spawns;

      for (let index in spawns) {
         let spawn = Game.spawns[index];

         let room = spawn.room;

         let towers = Utility.List.allStructuresOfTypeInRoom(room, STRUCTURE_TOWER, Utility.OWNERSHIP_MINE, true);

         for (let towerIndex in towers) {
            let tower = towers[towerIndex];

            AITower.tick(tower);
         }
      }
   },
   tick: function() {
      Foreman.manageCreepCounts.manage();
      Foreman.manageEmergencies.manage();
      Foreman.manageWar.manage();

      Foreman.tickTowers();
      Foreman.tickCreeps();
   }     
};

module.exports = Foreman;