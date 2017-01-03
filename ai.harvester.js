var AIHarvester = {
   STATE_SOURCE_CONTAINER_NONE: 0,
   STATE_SOURCE_CONTAINER_PLAN: 1,
   STATE_SOURCE_CONTAINER_BUILT: 2,
   checkoutSource: function(creep, point) {
      creep.memory.checkedOutSource = point;
   },
   /*
    * Looks at the sourceContainerPoint and determines what kind of activity needs to be done there, also stores
    * the guid of the structure there if there is one, which is then used in the future to check against to skip
    * expensive calls
    */
   determineSourceContainerState(creep) {
      let t = AIHarvester;

      let source = creep.memory.checkedOutSource.source;

      if (source) {
         let creepMem = creep.memory;
         let room = Game.rooms[creepMem.assignedRoom];
         if (room) {
            let roomMem = room.memory;

            if (roomMem.sourceContainerPointsGenerated) {
               let sourceContainerPoints = roomMem.sourceContainerPoints;

               let point = sourceContainerPoints[source];
               if (point) {
                  //First check if sourceContainer id is defined in memory, then if it references a valid object
                  let sourceContainerId = creepMem.sourceContainer;
                  if (sourceContainerId) {
                     let sourceContainer = Game.getObjectById(sourceContainerId);

                     if (sourceContainer) {
                        return creepMem.sourceContainerState;
                     }
                  }

                  //Second check to see if theres a construction plan for a container at container point
                  let found = room.lookForAt(LOOK_CONSTRUCTION_SITES, point.x, point.y);

                  if (found.length > 0) {
                     for (let key in found) {
                        let site = found[key];

                        if (site.my && site.structureType === STRUCTURE_CONTAINER) {
                           //Found candidate, store its id
                           creepMem.sourceContainer = site.id;

                           return t.STATE_SOURCE_CONTAINER_PLAN;
                        }
                     }
                  }

                  //Third check to see if theres a built container structure at container point
                  found = room.lookForAt(LOOK_STRUCTURES, point.x, point.y);
                  if (found.length > 0) {
                     for (let key in found) {
                        let structure = found[key];

                        let structureId = structure.id;

                        if (structure.structureType === STRUCTURE_CONTAINER) {
                           //Found candidate, store its id
                           creepMem.sourceContainer = structureId;

                           return t.STATE_SOURCE_CONTAINER_BUILT;
                        }
                     }
                  }
               }
            }
         }
      }

      return t.STATE_SOURCE_CONTAINER_NONE;
   },
   handleError: function(desc, creep, error) {
      console.log("CREEP ERROR: [" + desc + "] " + creep.name + " {" + creep.id + "} code: " + error);
   },
   isEnergyEmpty: function(creep) {
      return creep.carry.energy == 0;
   },
   isEnergyFull: function(creep) {
      return creep.carry.energy == creep.carryCapacity;
   },
   isSourceCheckedOut: function(point) {
      //Check if any creeps in the world are currently checking out this source
      for (let ax in Game.creeps) {
         let creep = Game.creeps[ax];
         let mem = creep.memory.checkedOutSource;

         if (mem && mem.source === point.source && mem.x == point.x && mem.y == point.y) {
            return true;
         }
      }

      return false;
   },
   tick: function(creep) {
      let t = AIHarvester;

      if (!creep.spawning) {
         //Check if harvester is currently checking out a sourcePoint, if not try to check one out
         if (!creep.memory.checkedOutSource) {
            //Find sourcePoint that isn't "checked out"
            let room = Game.rooms[creep.memory.assignedRoom];

            if (room) {
               let roomMem = room.memory;
               let sourcePoints = roomMem.sourcePoints;

               //Get all valid positions for sourcePoints and collapse them into an array
               let collapsedPoints = [];
               for (let ax in sourcePoints) {
                  let sourcePoint = sourcePoints[ax];

                  for (let bx in sourcePoint.validPositions) {
                     let pos = sourcePoint.validPositions[bx];

                     collapsedPoints.push({source: ax, x: pos.x, y: pos.y}); //Creates a new structure where each point has a reference to its source id
                  }
               }

               //Sort points by distanceSquared from creep position, least to most
               let sortedPoints = _.sortBy(collapsedPoints, function(o) { return Utility.Math.distanceSquared(creep.pos, o) });

               //Go through sorted points and find the first one that isn't currently checked out
               let checkedOut = false;
               for (let ax in sortedPoints) {
                  let point = sortedPoints[ax];

                  if (!t.isSourceCheckedOut(point)) {
                     //Checkout the source
                     t.checkoutSource(creep, point);
                     checkedOut = true;
                     break;
                  }
               }

               if (!checkedOut) {
                  //No sources to checkout, idle
                  creep.say("No Sources!");
               }
            }
         }
         else {
            /*
             * MAIN LOGIC
             */

            let creepMem = creep.memory;
            let room = Game.rooms[creepMem.assignedRoom];

            if (room) {
               let roomMem = room.memory;

               if (roomMem.sourceContainerPointsGenerated) { 
                  let sourceContainerPoints = roomMem.sourceContainerPoints;

                  let containerPoint = sourceContainerPoints[creepMem.checkedOutSource.source];
                  if (containerPoint) {
                     if (creepMem.isHarvesting && t.isEnergyFull(creep)) {
                        creepMem.isHarvesting = false;
                     }
                     else if (!creepMem.isHarvesting && t.isEnergyEmpty(creep)) {
                        creepMem.isHarvesting = true;
                     }


                     if (!creepMem.isHarvesting) {
                        //Energy is not empty, check to see if we need to work with the container
                        let state = t.determineSourceContainerState(creep);
                        creepMem.sourceContainerState = state; //Cache return state for optimization reuse in determineSourceContainerState
                        if (state == t.STATE_SOURCE_CONTAINER_NONE) {
                           //We need to create a plan for a container
                           let ret = room.createConstructionSite(containerPoint.x, containerPoint.y, STRUCTURE_CONTAINER);
                        }
                        else if (state == t.STATE_SOURCE_CONTAINER_PLAN) {
                           //We need to build up the container
                           let site = Game.getObjectById(creepMem.sourceContainer);

                           if (site) {
                              AI.Creep.Behavior.Build.target(creep, site);
                           }
                        }
                        else if (state == t.STATE_SOURCE_CONTAINER_BUILT) {
                           //Check if we need to repair container, otherwise deposit
                           let container = Game.getObjectById(creepMem.sourceContainer);

                           if (container) {
                              if (container.hits < container.hitsMax) {
                                 //Should repair
                                 AI.Creep.Behavior.Repair.target(creep, container);
                              }
                              else {
                                 //Check to see if container has room
                                 if (Utility.Count.containerResources(container) < container.storeCapacity) {
                                    //Should deposit
                                    AI.Creep.Behavior.Refuel.target(creep, container, RESOURCE_ENERGY);
                                 }
                                 else {
                                    //If energy not topped off, go harvest, otherwise check if a spawn needs energy, otherwise idle at sourcePoint
                                    if (!t.isEnergyFull(creep)) {
                                       creepMem.isHarvesting = true;
                                    }
                                    else {
                                       //Get all spawns owned by me that are not topped off
                                       let spawns = Utility.List.allStructuresOfTypeInRoom(room, STRUCTURE_SPAWN, Utility.OWNERSHIP_MINE, true, function(structure) {
                                          return structure.energy < structure.energyCapacity;
                                       });

                                       if (spawns.length > 0) {
                                          //Sort by distanceSquared
                                          spawnsSorted = Utility.Sort.Position.distanceSquared(spawns, creep);

                                          //Select closest spawn
                                          let spawn = spawnsSorted[0];

                                          //Attempt to refuel the spawn
                                          AI.Creep.Behavior.Refuel.target(creep, spawn, RESOURCE_ENERGY);
                                       }
                                       else {
                                          //Idle at sourcePoint
                                          AI.Creep.Behavior.Idle.atPoint(creep, creep.memory.checkedOutSource);
                                       }
                                    }
                                 }
                              }
                           }
                        }
                     }
                     else {
                        //Energy not full, lets harvest
                        //Try to mine source from given source point
                        let point = creep.memory.checkedOutSource;

                        AI.Creep.Behavior.Harvest.targetFromPoint(creep, Game.getObjectById(point.source), point);
                     }
                  }
               }
            }
         }
      }
   }
};

module.exports = AIHarvester;