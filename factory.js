var Factory = {
   ROLE_BUILDER: "builder",
   ROLE_HARVESTER: "harvester",
   ROLE_UPGRADER: "upgrader",
   ROLE_WORKER: "worker",
   Creep: {
      BuilderSmall: {
         body: [WORK, CARRY, CARRY, MOVE, MOVE],
         role: "builder",
         baseName: "Builder",
         spawn: function (spawner, name = undefined) {
            let t = Factory.Creep.BuilderSmall;

            let body = t.body;
            let role = t.role;
            let finalname = name || (t.baseName + Game.time);

            spawner.createCreep(body, finalname, { "role": role, "assignedRoom": spawner.room.name });
         }
      },
      HarvesterSmall: {
         body: [WORK, CARRY, CARRY, MOVE, MOVE],
         role: "harvester",
         baseName: "Harvester",
         spawn: function (spawner, name = undefined) {
            let t = Factory.Creep.HarvesterSmall;

            let body = t.body;
            let role = t.role;
            let finalname = name || (t.baseName + Game.time);

            spawner.createCreep(body, finalname, { "role": role, "assignedRoom": spawner.room.name });
         }
      }
   }
};

module.exports = Factory;