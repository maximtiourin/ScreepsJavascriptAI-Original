var GarbageCollector = {
  /*
   * Looks through areas of memory to see if it is being wasted, and then frees it
   */
  freeUnusedMemory: function() {
    //Clean up dead creep memory
    for (let name in Memory.creeps) {
      if (!Game.creeps[name]) {
        delete Memory.creeps[name];
      }
    }

    //Clean up empty room memory
    for (let name in Memory.rooms) {
      if (!Game.rooms[name]) {
        delete Memory.rooms[name];
      }
    }

    //Clean up removed flag memory
    for (let name in Memory.flags) {
      if (!Game.flags[name]) {
        delete Memory.flags[name];
      }
    }
  }
};

module.exports = GarbageCollector;