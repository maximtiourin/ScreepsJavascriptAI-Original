var Surveyor = {
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
   },
   survey: function() {
      let t = Surveyor;
      for (let name in Game.rooms) {
         let room = Game.rooms[name];

         t.generateRoomSourcePoints(room);
         t.generateRoomSourceContainerPoints(room);
      }
   }   
};

module.exports = Surveyor;