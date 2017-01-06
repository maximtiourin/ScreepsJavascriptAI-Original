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