var Factory = {
   ROLE_BUILDER: "builder",
   ROLE_CLEANSER: "cleanser",
   ROLE_HARVESTER: "harvester",
   ROLE_HAULER: "hauler",
   ROLE_LONGRANGEHARVESTER: "longrangeharvester",
   ROLE_RECLAIMER: "reclaimer",
   ROLE_REFUELER: "refueler",
   ROLE_RESERVER: "reserver",
   ROLE_UPGRADER: "upgrader",
   ROLE_WORKER: "worker",
   Creep: {
      BuilderSmall: {
         baseName: "B:",
         body: [WORK, CARRY, CARRY, MOVE, MOVE],
         cost: 300,
         role: "builder",
         spawn: function (spawner, name = undefined) {
            let t = Factory.Creep.BuilderSmall;

            let body = t.body;
            let role = t.role;
            let finalname = name || (t.baseName + Utility.GUID.creepGenerate(t.baseName));

            spawner.createCreep(body, finalname, { "role": role, "assignedRoom": spawner.room.name });
         }
      },
      Cleanser: {
         baseName: "Cleanser:",
         body: [RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE],
         cost: 600,
         role: "cleanser",
         spawn: function (spawner, targetRoom, name = undefined, targetFlag = undefined) {
            let t = Factory.Creep.Cleanser;

            let body = t.body;
            let role = t.role;
            let finalname = name || (t.baseName + Utility.GUID.generate());

            if (targetFlag) {
               spawner.createCreep(body, finalname, { "role": role, "assignedRoom": spawner.room.name, "targetRoom": targetRoom, "targetFlag": targetFlag});
            }
            else {
               spawner.createCreep(body, finalname, { "role": role, "assignedRoom": spawner.room.name, "targetRoom": targetRoom});
            }
         }
      },
      HarvesterSmall: {
         baseName: "H:",
         body: [WORK, WORK, CARRY, MOVE],
         cost: 300,
         role: "harvester",
         spawn: function (spawner, name = undefined) {
            let t = Factory.Creep.HarvesterSmall;

            let body = t.body;
            let role = t.role;
            let finalname = name || (t.baseName + Utility.GUID.creepGenerate(t.baseName));

            spawner.createCreep(body, finalname, { "role": role, "assignedRoom": spawner.room.name });
         }
      },
      Hauler: {
         baseName: "Hlr:",
         body: [CARRY, MOVE],
         cost: 100,
         role: "hauler",
         spawn: function (spawner, name = undefined) {
            let t = Factory.Creep.Hauler;

            let body = t.body;
            let role = t.role;
            let finalname = name || (t.baseName + Utility.GUID.creepGenerate(t.baseName));

            spawner.createCreep(body, finalname, { "role": role, "assignedRoom": spawner.room.name });
         }
      },
      LongRangeHarvester: {
         baseName: "LRH:",
         body: [WORK, CARRY, MOVE],
         cost: 200,
         role: "longrangeharvester",
         spawn: function (spawner, targetFlag, name = undefined) {
            let t = Factory.Creep.LongRangeHarvester;

            let body = t.body;
            let role = t.role;
            let finalname = name || (t.baseName + Utility.GUID.creepGenerate(t.baseName));

            spawner.createCreep(body, finalname, { "role": role, "assignedRoom": spawner.room.name, "targetFlag": targetFlag });
         }
      },
      Reclaimer: {
         baseName: "Rec:",
         body: [CARRY, MOVE],
         cost: 100,
         role: "reclaimer",
         spawn: function (spawner, name = undefined) {
            let t = Factory.Creep.Reclaimer;

            let body = t.body;
            let role = t.role;
            let finalname = name || (t.baseName + Utility.GUID.creepGenerate(t.baseName));

            spawner.createCreep(body, finalname, { "role": role, "assignedRoom": spawner.room.name, "targetSpawn": spawner.id });
         }
      },
      RefuelerSmall: {
         baseName: "Rfl:",
         body: [WORK, CARRY, CARRY, MOVE, MOVE],
         cost: 300,
         role: "refueler",
         spawn: function (spawner, name = undefined) {
            let t = Factory.Creep.RefuelerSmall;

            let body = t.body;
            let role = t.role;
            let finalname = name || (t.baseName + Utility.GUID.creepGenerate(t.baseName));

            spawner.createCreep(body, finalname, { "role": role, "assignedRoom": spawner.room.name });
         }
      },
      Reserver: {
         baseName: "RSV:",
         body: [CLAIM, MOVE],
         cost: 650,
         role: "reserver",
         spawn: function (spawner, targetFlag, name = undefined) {
            let t = Factory.Creep.Reserver;

            let body = t.body;
            let role = t.role;
            let finalname = name || (t.baseName + Utility.GUID.creepGenerate(t.baseName));

            spawner.createCreep(body, finalname, { "role": role, "assignedRoom": spawner.room.name, "targetFlag": targetFlag });
         }
      },
      UpgraderMedium: {
         baseName: "Upg:",
         body: [WORK, WORK, WORK, CARRY, MOVE],
         cost: 400,
         role: "upgrader",
         spawn: function (spawner, name = undefined) {
            let t = Factory.Creep.UpgraderMedium;

            let body = t.body;
            let role = t.role;
            let finalname = name || (t.baseName + Utility.GUID.creepGenerate(t.baseName));

            spawner.createCreep(body, finalname, { "role": role, "assignedRoom": spawner.room.name });
         }
      }
   }
};

module.exports = Factory;