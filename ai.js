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
   }
}

module.exports = AI;