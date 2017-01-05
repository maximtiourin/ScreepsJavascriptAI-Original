var AICleanser = {
   tick: function(creep) {
      let t = AICleanser;

      if (!creep.spawning) {
         let creepMem = creep.memory;
         let room = Game.rooms[creepMem.assignedRoom];

         if (room) {
            let roomMem = room.memory;

            if (creep.room.name === creep.memory.targetRoom) {
               let targetRoom = creep.room;

               //We are in our target, lets wreak havoc
               let enemies = targetRoom.find(FIND_HOSTILE_CREEPS);

               if (enemies.length > 0) {
                  //Sort enemies by distance
                  let sortedEnemies = Utility.Sort.Position.distanceSquared(enemies, creep);

                  let enemy = sortedEnemies[0];

                  //Find path between creep and enemy
                  /*let pathfind = PathFinder.search(creep.pos, {"pos": enemy.pos, "range": 3});

                  if (pathfind.path.length > 0) {
                     let step = pathfind.path[0];

                     //Move towards step in path
                     creep.move(creep.pos.getDirectionTo(step));
                  }*/

                  //Move closer to enemy
                  creep.moveTo(enemy);

                  let closeEnemyCreeps = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
                  if (closeEnemyCreeps.length > 0) {
                     //Attack enemy
                     let e = closeEnemyCreeps[0];
                     AI.Creep.Behavior.RangedAttack.target(creep, e);
                  }
                  else {
                     //Try to attack a structure just to be useful
                     let closeEnemyStructures = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                        filter: function(struct) {
                           return struct.structureType === STRUCTURE_WALL || !struct.my;
                        }
                     });
                     if (closeEnemyStructures.length > 0) {
                        let e = closeEnemyStructures[0];
                        AI.Creep.Behavior.RangedAttack.target(creep, e);
                     }
                  }
               }
               else {
                  //Try to find a spawn
                  let enemySpawns = targetRoom.find(FIND_HOSTILE_SPAWNS);
                  if (enemySpawns.length > 0) {
                     let enemySpawn = enemySpawns[0];

                     creep.moveTo(enemySpawn);

                     let closeEnemySpawns = creep.pos.findInRange(FIND_HOSTILE_SPAWNS, 3);
                     if (closeEnemySpawns.length > 0) {
                        let e = closeEnemySpawns[0];
                        AI.Creep.Behavior.RangedAttack.target(creep, e);
                     }
                     else {
                        let closeEnemyStructures = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                           filter: function(struct) {
                              return struct.structureType === STRUCTURE_WALL || !struct.my;
                           }
                        });
                        if (closeEnemyStructures.length > 0) {
                           let e = closeEnemyStructures[0];
                           AI.Creep.Behavior.RangedAttack.target(creep, e);
                        }
                     }
                  }
                  else {
                     //Nothing left to currently kill, lets see if we should despawn the flag before the creep dies, to prevent spawning a new one
                     if (creepMem.targetFlag) {
                        if (creep.ticksToLive <= 20) {
                           let flag = Game.flags[creepMem.targetFlag];

                           flag.remove();

                           delete creepMem.targetFlag;
                        }
                     }
                  }
               }
            }
            else {
               //Lets move to our target room
               if (creepMem.targetFlag) {
                  let flag = Game.flags[creepMem.targetFlag];

                  if (!creepMem.targetRoom && flag.room && creep.room.name === flag.room.name) {
                     creepMem.targetRoom = flag.room.name;
                  }

                  creep.moveTo(flag);
               }
               else {
                  let exitDir = Game.map.findExit(creep.room.name, creep.memory.targetRoom);
                  let exitPos = creep.pos.findClosestByRange(exitDir);
                  creep.moveTo(exitPos);
               }
            }
         }
      }
   }
}

module.exports = AICleanser;