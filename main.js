//Define global structure
global.AIBuilder =            global.AIBuilder           || require('ai.builder');
global.AIHarvester =          global.AIHarvester         || require('ai.harvester');
global.Factory =              global.Factory             || require('factory');
global.Foreman =              global.Foreman             || require('foreman');
global.GarbageCollector =     global.GarbageCollector    || require('garbagecollector');
global.Surveyor =             global.Surveyor            || require('surveyor');
global.Utility =              global.Utility             || require('utility');


module.exports.loop = function() {
   //Calculate room source point arrays
   Surveyor.survey();

   //Free unused memory
   GarbageCollector.freeUnusedMemory();

   //Foreman tick
   Foreman.tick();
};