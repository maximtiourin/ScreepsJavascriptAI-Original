var AI = {
   Creep: {
      Behavior: {
         Build: {
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