var Factory = {
   ROLE_BUILDER: "builder",
   ROLE_HARVESTER: "harvester",
   ROLE_REFUELER: "refueler",
   ROLE_UPGRADER: "upgrader",
   ROLE_WORKER: "worker",
   Creep: {
      BuilderSmall: {
         baseName: "Builder",
         body: [WORK, CARRY, CARRY, MOVE, MOVE],
         cost: 300,
         role: "builder",
         spawn: function (spawner, name = undefined) {
            let t = Factory.Creep.BuilderSmall;

            let body = t.body;
            let role = t.role;
            let finalname = name || (t.baseName + Game.time);

            spawner.createCreep(body, finalname, { "role": role, "assignedRoom": spawner.room.name });
         }
      },
      HarvesterSmall: {
         baseName: "Harvester",
         body: [WORK, CARRY, CARRY, MOVE, MOVE],
         cost: 300,
         role: "harvester",
         spawn: function (spawner, name = undefined) {
            let t = Factory.Creep.HarvesterSmall;

            let body = t.body;
            let role = t.role;
            let finalname = name || (t.baseName + Game.time);

            spawner.createCreep(body, finalname, { "role": role, "assignedRoom": spawner.room.name });
         }
      },
      RefuelerSmall: {
         baseName: "Refueler",
         body: [WORK, CARRY, CARRY, MOVE, MOVE],
         cost: 300,
         role: "refueler",
         spawn: function (spawner, name = undefined) {
            let t = Factory.Creep.RefuelerSmall;

            let body = t.body;
            let role = t.role;
            let finalname = name || (t.baseName + Game.time);

            spawner.createCreep(body, finalname, { "role": role, "assignedRoom": spawner.room.name });
         }
      },
      UpgraderMedium: {
         baseName: "Upgrader",
         body: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
         cost: 500,
         role: "upgrader",
         spawn: function (spawner, name = undefined) {
            let t = Factory.Creep.UpgraderMedium;

            let body = t.body;
            let role = t.role;
            let finalname = name || (t.baseName + Game.time);

            spawner.createCreep(body, finalname, { "role": role, "assignedRoom": spawner.room.name });
         }
      }
   }
};

module.exports = Factory;