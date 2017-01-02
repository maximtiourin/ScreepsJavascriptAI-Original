//Define global structure
global.AI =                   global.AI                  || require('ai');
global.AIBuilder =            global.AIBuilder           || require('ai.builder');
global.AIHarvester =          global.AIHarvester         || require('ai.harvester');
global.AIRefueler =           global.AIRefueler          || require('ai.refueler');
global.AITower =              global.AITower             || require('ai.tower');
global.AIUpgrader =           global.AIUpgrader          || require('ai.upgrader');
global.Factory =              global.Factory             || require('factory');
global.Foreman =              global.Foreman             || require('foreman');
global.GarbageCollector =     global.GarbageCollector    || require('garbagecollector');
global.Surveyor =             global.Surveyor            || require('surveyor');
global.TickCache =            global.TickCache           || require('tickcache');
global.Utility =              global.Utility             || require('utility');


module.exports.loop = function() {
   //Calculate room source point arrays
   Surveyor.survey();

   //Free unused memory
   GarbageCollector.freeUnusedMemory();

   //Foreman tick
   Foreman.tick();
};