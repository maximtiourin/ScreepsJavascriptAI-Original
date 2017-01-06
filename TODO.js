/*
 * TODO:
 * - When an AI selects some sort of goal or target after a calculation, store that target in memory and operate on it instead of recalculating, as long as that
 *       target still meets all valid conditions for being a good target. This will prevent pingponging, while greatly reducing average cpu cost.
 * - Implement a larger harvester that uses 5 work parts, 1 carry, 1 move, and set up the proper rules for spawning it. 1 large harvester per source, will need to use
 *    different methods for checking out a source that take into consideration only the source, rather than all of the sourcePoints like the smaller harvesters.
 * 
 * - Implement dynamic growth of builder limit for foreman based on conditions such as controller level, container spare resources, and maybe other factors
 *       EX: (2 * SourceCount) + ((Get All Currently Available Energy in Containers / getCurrentBuilderModel.energyCost) - 1)
 *
 *
 *
 * - STRETCH REWORK
 *       - Modify how harvesting works so that a harvester is something like maximum WORK up to 5, 1 carry, 1 move, one harvester per source no matter what.
            Harvester will refuel spawns if no refuelers exist, otherwise harvester will mine in place no matter what
 *       - New refueler specialized unit [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE], 1 refueler limit per source, ONLY refuels things while prioritizing picking up loose energy
            and bringing it to spawn -> extension -> container -> storage
         - Containers are only built 1 per source, and only once builders start being spawned (or something like that) 







         CURRENT

         - 
 */