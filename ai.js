var AI = {
   Creep: {
      Behavior: {
         Build: {
          Advanced: {
            /*
             * Attempts to build construction sites in the room, moving to them if necessary.
             * Looks for the closest target factoring in a structureType priority.
             * Returns false if no valid construction sites.
             * [Uses TickCaching]
             */
            myConstructionSites: function(room, creep) {
              let sites = TickCache.cache("List.allConstructionSitesInRoom.my::" + room.name, function() {
                return Utility.List.allConstructionSitesInRoom(room, Utility.OWNERSHIP_MINE);
              });

              if (sites.length > 0) {
                //Build construction site
                //Get the group of constructionSite structuresTypes that have priority
                let priorityGroup = Utility.Group.first(sites, Utility.Filter.Priority.buildStructures);

                //Sort that group for distanceSquared
                let sortedPriorities = Utility.Sort.Position.distanceSquared(priorityGroup, creep);

                //Select our priority site
                let prioritySite = sortedPriorities[0];

                //Attempt to build our priority site
                AI.Creep.Behavior.Build.target(creep, prioritySite);

                return true;
              }
              else {
                return false;
              }
            }
          },
            /*
             * Attempts to build the given target, moving to it if not in range
             */
            target: function(creep, target) {
               let ret = creep.build(target);

               if (ret == ERR_NOT_IN_RANGE) {
                  creep.moveTo(target);
               }
            }
         },
         Harvest: {
            /*
             * Attempts to harvest the given target, moving to it if not in range
             */
            target: function(creep, target) {
              let ret = creep.harvest(target);

              if (ret == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
              }
            },
            /*
             * Attempts to harvest the given target while standing on the given point,
             * moving to the given point if not already on it
             */
            targetFromPoint: function(creep, target, point) {
               let pos = creep.pos;

               if (point.x == pos.x && point.y == pos.y) {
                  creep.harvest(target);
               }
               else {
                  creep.moveTo(point.x, point.y);
               }
            }
         },
         Idle: {
            /*
             * Moves to the given point if not already on it
             */
            atPoint: function(creep, point) {
               let pos = creep.pos;
               if (!(point.x == pos.x && point.y == pos.y)) {
                  creep.moveTo(point.x, point.y);
               }
            }
         },
         Pickup: {
            /*
             * Attempts to pickup the given target, moving to it if not in range
             */
            target: function(creep, target) {
              let ret = creep.pickup(target);

              if (ret == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
              }
            }
         },
         RangedAttack: {
            target: function(creep, target) {
              creep.rangedAttack(target);
            }
         },
         RangedMassAttack: {
            cleave: function(creep) {
              creep.rangedMassAttack();
            }
         },
         Recycle: {
            self: function(creep, spawn) {
              let ret = spawn.recycleCreep(creep);

              if (ret == ERR_NOT_IN_RANGE) {
                creep.moveTo(spawn);
              }
            }
         },
         Refuel: {
            Advanced: {
              /*
               * Attempts to refuel from a container/storage in the room, moving to it if necessary.
               * Looks for the closest target that can fulfill its energy needs.
               * If its close to its target, and its target has no energy to give, the creep will move around 
               * a bit in order to prevent blockage.
               * Returns false if no valid energy storage structures.
               * [Uses TickCaching]
               */
              energyFromContainer: function(room, creep) {
                let containers = TickCache.cache("List.allStructuresInRoom.myEnergyStorage::" + room.name, function() {
                  return Utility.List.allStructuresInRoom(room, Utility.OWNERSHIP_MINE, false, function(structure) {
                    return structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_STORAGE;
                  });
                });
                if (containers.length > 0) {
                  //Get desirable containers by first trying to retrieve a group of containers that can fully refuel this creep, then settling for any
                  let filterContainers = Utility.Group.first(containers, Utility.Filter.Priority.containersWithEnoughEnergy, Utility.Count.creepEnergyLeftToFill(creep));

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

                  return true;
                }
                else {
                  return false;
                }
              },
              energyMyStructures: function(room, creep) {
                let refuelStructures = TickCache.cache("List.allStructuresInRoom.myNeedRefueling::" + room.name, function() {
                  return Utility.List.allStructuresInRoom(room, Utility.OWNERSHIP_MINE, false, Utility.Filter.Boolean.refuelStructures);
                });

                if (refuelStructures.length > 0) {
                  let priorityGroup = Utility.Group.first(refuelStructures, Utility.Filter.Priority.refuelStructures);

                  let sortedPriorityGroup = Utility.Sort.Position.distanceSquared(priorityGroup, creep);

                  let closestStructure = sortedPriorityGroup[0];

                  AI.Creep.Behavior.Refuel.target(creep, closestStructure, RESOURCE_ENERGY);

                  return true;
                }
                else {
                  return false;
                }
              }
            },
            /*
             * Attempts to refuel from the target with the given resourceType, moving to it if not in range
             */
            fromTarget: function(creep, target, resourceType) {
               let ret = creep.withdraw(target, resourceType);

               if (ret == ERR_NOT_IN_RANGE) {
                  creep.moveTo(target);
               }
            },
            /*
             * Attempts to refuel the target with the given resourceType, moving to it if not in range
             */
            target: function(creep, target, resourceType) {
               let ret = creep.transfer(target, resourceType);

               if (ret == ERR_NOT_IN_RANGE) {
                  creep.moveTo(target);
               }
            }
         },
         Repair: {
            Advanced: {
              myStructures: function(room, creep) {
                let structures = TickCache.cache("List.allStructuresInRoom.myNeedRepairing::" + room.name, function() {
                  return Utility.List.allStructuresInRoom(room, Utility.OWNERSHIP_MINE, false, Utility.Filter.Boolean.repairStructures);
                });

                if (structures.length > 0) {
                   //Get the group of structure structuresTypes that have priority
                   let priorityGroup = Utility.Group.first(structures, Utility.Filter.Priority.repairStructures);

                   //Sort that group for distanceSquared
                   let sortedStructures = Utility.Sort.Position.distanceSquared(priorityGroup, creep);

                   //Select our priority structure
                   let priorityStructure = sortedStructures[0];

                   //Attempt to repair priority structure
                   AI.Creep.Behavior.Repair.target(creep, priorityStructure);

                   return true;
                }
                else {
                  return false;
                }
              }
            },
            /*
             * Attempts to repair the target, moving to it if not in range
             */
            target: function(creep, target) {
               let ret = creep.repair(target);

               if (ret == ERR_NOT_IN_RANGE) {
                  creep.moveTo(target);
               }
            }
         },
         Reserve: {
            /*
             * Attempts to reserve the target, moving to it if not in range
             */
            target: function(creep, target) {
               let ret = creep.reserveController(target);

               if (ret == ERR_NOT_IN_RANGE) {
                  creep.moveTo(target);
               }
            }
         },
         Upgrade: {
            /*
             * Attempts to upgrade the target, moving to it if not in range
             */
            target: function(creep, target) {
               let ret = creep.upgradeController(target);

               if (ret == ERR_NOT_IN_RANGE) {
                  creep.moveTo(target);
               }
            }
         }
      }
   },
   Tower: {
      Behavior: {
         Attack: {
            target: function(tower, target) {
               tower.attack(target);
            }
         },
         Heal: {
            target: function(tower, target) {
               tower.heal(target);
            }
         },
         Repair: {
            target: function(tower, target) {
               tower.repair(target);
            }
         }
      }
   }
}

module.exports = AI;