var Surveyor = {
   Dimensions: {
      ROOM_WIDTH: 50,
      ROOM_HEIGHT: 50,
      ROOM_BORDER_OFFSET: 2
   },
   Extension: {
      countExtensionSitesAndStructures: function(room) {
         //[CACHED] Count how many extensions are built or being built
         let count = TickCache.cache('Surveyor_countExtensionSitesAndStructures', function() {
            let sites = Utility.List.allConstructionSitesInRoom(room, Utility.OWNERSHIP_MINE, function(site) {
               return site.structureType === STRUCTURE_EXTENSION;
            });

            let structures = Utility.List.allStructuresOfTypeInRoom(room, STRUCTURE_EXTENSION, Utility.OWNERSHIP_MINE, true);

            return sites.length + structures.length;
         });

         return count;
      },
      generateRoomExtensions: function(room) {
         let t = Surveyor.Extension;

         let controller = room.controller;

         if (controller) {
            let level = controller.level;

            if (level == 2) {
               //Maintain atleast 5 extensions
               t.maintainExtensionsForLevel(room, 5);
            }
            else if (level == 3) {
               //Maintain atleast 10 extensions
               t.maintainExtensionsForLevel(room, 10);
            }
            else if (level == 4) {
               //Maintain atleast 20 extensions
               t.maintainExtensionsForLevel(room, 20);
            }
         }
      },
      isValidExtensionPlacementAtPoint: function(room, point) {
         let t = Surveyor.Extension;

         //Make sure point is empty and a valid tile, then Check 4 cardinal direction top, bot, left, right for emptiness only
         //Center
         if (!t.isValidExtensionPoint(room, point)) {
            return false;
         }
         //Top
         if (!t.isValidExtensionPoint(room, {'x': point.x, 'y': point.y - 1})) {
            return false;
         }
         //Bot
         if (!t.isValidExtensionPoint(room, {'x': point.x, 'y': point.y + 1})) {
            return false;
         }
         //Left
         if (!t.isValidExtensionPoint(room, {'x': point.x - 1, 'y': point.y})) {
            return false;
         }
         //Right
         if (!t.isValidExtensionPoint(room, {'x': point.x + 1, 'y': point.y})) {
            return false;
         }

         return true;
      },
      isValidExtensionPoint: function(room, point) {
         let centerLook = room.lookAt(point.x, point.y);

         for (let index in centerLook) {
            let obj = centerLook[index];

            if (obj.type === LOOK_TERRAIN) {
               if (obj.terrain === 'wall') {
                  return false;
               }
            }
            else if (obj.type === LOOK_STRUCTURES) {
               if (obj.structure.structureType !== STRUCTURE_ROAD && obj.structure.structureType !== STRUCTURE_RAMPART) {
                  return false;
               }
            }
            else if (obj.type === LOOK_CONSTRUCTION_SITES) {
               if (obj.constructionSite.structureType !== STRUCTURE_ROAD && obj.constructionSite.structureType !== STRUCTURE_RAMPART) {
                  return false;
               }
            }
         }

         return true;
      },
      maintainExtensionsForLevel: function(room, limit) {
         let ROOM_WIDTH = Surveyor.Dimensions.ROOM_WIDTH;
         let ROOM_HEIGHT = Surveyor.Dimensions.ROOM_HEIGHT;
         let BORDER_OFFSET = Surveyor.Dimensions.ROOM_BORDER_OFFSET + 6;
         let MAX_DISTANCE_FROM_SPAWN = Math.round(ROOM_WIDTH / 6.0);

         let t = Surveyor.Extension;

         let count = t.countExtensionSitesAndStructures(room);

         if (count < limit) {
            //Find a valid placement for a new extension site
            let spawns = Utility.List.allStructuresOfTypeInRoom(room, STRUCTURE_SPAWN, Utility.OWNERSHIP_MINE, true);

            if (spawns.length > 0) {
               let spawn = spawns[0];
               let center = spawn.pos;

               let xmin = Utility.Math.clamp(center.x - MAX_DISTANCE_FROM_SPAWN, BORDER_OFFSET, ROOM_WIDTH - 1 - BORDER_OFFSET);
               let xmax = Utility.Math.clamp(center.x + MAX_DISTANCE_FROM_SPAWN, BORDER_OFFSET, ROOM_WIDTH - 1 - BORDER_OFFSET);
               let ymin = Utility.Math.clamp(center.y - MAX_DISTANCE_FROM_SPAWN, BORDER_OFFSET, ROOM_HEIGHT - 1 - BORDER_OFFSET);
               let ymax = Utility.Math.clamp(center.y + MAX_DISTANCE_FROM_SPAWN, BORDER_OFFSET, ROOM_HEIGHT - 1 - BORDER_OFFSET);

               for (let x = xmin; x <= xmax; x++) {
                  for (let y = ymin; y <= ymax; y++) {
                     let point = {'x': x, 'y': y};

                     if (t.isValidExtensionPlacementAtPoint(room, point)) {
                        room.createConstructionSite(point.x, point.y, STRUCTURE_EXTENSION);
                        return true;
                     }
                  }
               }
            }
         }

         return false;
      }
   },
   Source: {
      /*
       * Determines all of the sources in non-empty rooms, and stores positions of any open surrounding terrain in memory
       */
      generateRoomSourcePoints: function(room) {         
         if (!room.memory.sourcePointsGenerated) {
            room.memory.sourcePoints = {};         
            
            let sources = room.find(FIND_SOURCES);
            for (let index in sources) {
               let source = sources[index];
               
               room.memory.sourcePoints[source.id] = {validPositions: []};
               
               //Determine source open terrain positions in 8 cardinal directions
               let pos = source.pos;
               let x = pos.x;
               let y = pos.y;
               
               let ix = -1;
               let iy = -1;
               while (ix <= 1) {
                  iy = -1;
                  while (iy <= 1) {
                     if (!(ix == 0 && iy == 0)) {
                        let nx = x + ix;
                        let ny = y + iy;
                        
                        let terrain = Game.map.getTerrainAt(nx, ny, pos.roomName);
                        
                        if (terrain === "plain" || terrain === "swamp") {
                           //Valid position for source harvesting
                           room.memory.sourcePoints[source.id].validPositions.push({x: nx, y: ny});
                        }
                     }
                     
                     iy += 1;
                  }
                  ix += 1;
               }
            }
            
            room.memory.sourcePointsGenerated = true;
         }
      },
      /*
       * Determines all of the container points for each source in non-empty rooms, creates a flag for them, and stores information
       * in that flags memory used to manage the maintaining of container structures at those points
       */
      generateRoomSourceContainerPoints: function(room) {
         let DISTANCE_FROM_SOURCE = 2;
         let colorPRIMARY = COLOR_YELLOW;
         let colorSECONDARY = COLOR_YELLOW;

         let mem = room.memory;

         //Generate room's container point structure
         if (!mem.sourceContainerPointsGenerated) {
            mem.sourceContainerPoints = {};

            mem.sourceContainerPointsGenerated = true;
         }

         //Make sure this room has had its source points generated first
         if (mem.sourcePointsGenerated) {
            //Make sure this room has spawns, otherwise we dont need to proceed
            let spawns = room.find(FIND_MY_SPAWNS);
            if (spawns.length > 0) {
               //Look through all sources and see if a sourceContainerPoint has been generated for them
               for (let sourceId in mem.sourcePoints) {
                  let source = Game.getObjectById(sourceId);

                  if (!_.some(mem.sourceContainerPoints, function(point, key) { return key ===  sourceId })) {
                     //Generate a sourceContainerPoint DISTANCE_FROM_SOURCE tiles away from source, on a path between the the first spawn in the room and the source
                     let spawn = spawns[0];

                     //Generate path
                     let avoidStructures = room.find(FIND_STRUCTURES);
                     let avoidConstructions = room.find(FIND_CONSTRUCTION_SITES);
                     let avoidObjects = avoidStructures.concat(avoidConstructions);

                     PathFinder.use(false);

                     let path = room.findPath(spawn.pos, source.pos, {avoid: avoidObjects});
                     let pathLength = path.length;

                     PathFinder.use(true);

                     if (pathLength > 0) {
                        //Have a path
                        let pathStep = null;
                        if (pathLength <= DISTANCE_FROM_SOURCE) {
                           pathStep = path[0];
                        }
                        else {
                           pathStep = path[pathLength - DISTANCE_FROM_SOURCE];
                        }

                        //{ TODO:delete this } Generate debug flag on the point and set memory
                        let flagName = "sourceContainerPoint::" + sourceId;
                        room.createFlag(pathStep.x, pathStep.y, flagName, colorPRIMARY, colorSECONDARY);

                        //sourceContainerPoint memory
                        mem.sourceContainerPoints[sourceId] = {x: pathStep.x, y: pathStep.y};
                     }
                     else {
                        console.log("Error: {generateRoomSourceContainerPoints} Surveyor can not find path from " + spawn.name + " to Source::" + sourceId);
                     }
                  }
               }
            }
         }
      }
   },
   Tower: {
      countTowers: function(room) {
         //[CACHED] Count how many towers are built or being built
         let count = TickCache.cache('Surveyor_countTowers', function() {
            let sites = Utility.List.allConstructionSitesInRoom(room, Utility.OWNERSHIP_MINE, function(site) {
               return site.structureType === STRUCTURE_TOWER;
            });

            let structures = Utility.List.allStructuresOfTypeInRoom(room, STRUCTURE_TOWER, Utility.OWNERSHIP_MINE, true);

            return sites.length + structures.length;
         });

         return count;
      },
      generateRoomTowers: function(room) {
         let t = Surveyor.Tower;

         let controller = room.controller;

         if (controller) {
            let level = controller.level;

            if (level == 3) {
               //Maintain atleast 1 tower
               t.maintainTowersForLevel(room, 1);
            }
            else if (level == 4) {
               //Maintain atleast 1 tower
               t.maintainTowersForLevel(room, 1);
            }
         }
      },
      isValidTowerPlacementAtPoint: function(room, point) {
         let t = Surveyor.Tower;

         //Make sure point is empty and a valid tile, then Check 4 cardinal direction top, bot, left, right for emptiness only
         //Center
         if (!t.isValidTowerPoint(room, point)) {
            return false;
         }
         //Top
         if (!t.isValidTowerPoint(room, {'x': point.x, 'y': point.y - 1})) {
            return false;
         }
         //Bot
         if (!t.isValidTowerPoint(room, {'x': point.x, 'y': point.y + 1})) {
            return false;
         }
         //Left
         if (!t.isValidTowerPoint(room, {'x': point.x - 1, 'y': point.y})) {
            return false;
         }
         //Right
         if (!t.isValidTowerPoint(room, {'x': point.x + 1, 'y': point.y})) {
            return false;
         }

         return true;
      },
      isValidTowerPoint: function(room, point) {
         let centerLook = room.lookAt(point.x, point.y);

         for (let index in centerLook) {
            let obj = centerLook[index];

            if (obj.type === LOOK_TERRAIN) {
               if (obj.terrain === 'wall') {
                  return false;
               }
            }
            else if (obj.type === LOOK_STRUCTURES) {
               if (obj.structure.structureType !== STRUCTURE_ROAD && obj.structure.structureType !== STRUCTURE_RAMPART) {
                  return false;
               }
            }
            else if (obj.type === LOOK_CONSTRUCTION_SITES) {
               if (obj.constructionSite.structureType !== STRUCTURE_ROAD && obj.constructionSite.structureType !== STRUCTURE_RAMPART) {
                  return false;
               }
            }
         }

         return true;
      },
      maintainTowersForLevel: function(room, limit) {
         let ROOM_WIDTH = Surveyor.Dimensions.ROOM_WIDTH;
         let ROOM_HEIGHT = Surveyor.Dimensions.ROOM_HEIGHT;
         let BORDER_OFFSET = Surveyor.Dimensions.ROOM_BORDER_OFFSET + 6;
         let MAX_DISTANCE_FROM_SPAWN = Math.round(ROOM_WIDTH / 6.0);

         let t = Surveyor.Tower;

         let count = t.countTowers(room);

         if (count < limit) {
            //Find a valid placement for a new tower site
            let spawns = Utility.List.allStructuresOfTypeInRoom(room, STRUCTURE_SPAWN, Utility.OWNERSHIP_MINE, true);

            if (spawns.length > 0) {
               let spawn = spawns[0];
               let center = spawn.pos;

               let xmin = Utility.Math.clamp(center.x - MAX_DISTANCE_FROM_SPAWN, BORDER_OFFSET, ROOM_WIDTH - 1 - BORDER_OFFSET);
               let xmax = Utility.Math.clamp(center.x + MAX_DISTANCE_FROM_SPAWN, BORDER_OFFSET, ROOM_WIDTH - 1 - BORDER_OFFSET);
               let ymin = Utility.Math.clamp(center.y - MAX_DISTANCE_FROM_SPAWN, BORDER_OFFSET, ROOM_HEIGHT - 1 - BORDER_OFFSET);
               let ymax = Utility.Math.clamp(center.y + MAX_DISTANCE_FROM_SPAWN, BORDER_OFFSET, ROOM_HEIGHT - 1 - BORDER_OFFSET);

               for (let x = xmin; x <= xmax; x++) {
                  for (let y = ymin; y <= ymax; y++) {
                     let point = {'x': x, 'y': y};

                     if (t.isValidTowerPlacementAtPoint(room, point)) {
                        room.createConstructionSite(point.x, point.y, STRUCTURE_TOWER);
                        return true;
                     }
                  }
               }
            }
         }

         return false;
      }
   },
   survey: function() {
      let t = Surveyor;
      for (let name in Game.rooms) {
         let room = Game.rooms[name];

         t.Source.generateRoomSourcePoints(room);
         t.Source.generateRoomSourceContainerPoints(room);
         t.Extension.generateRoomExtensions(room);
         t.Tower.generateRoomTowers(room);
      }
   }   
};

module.exports = Surveyor;