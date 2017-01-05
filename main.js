//Define global structure
global.ENABLE_WAR = false;

global.AI =                   global.AI                     || require('ai');
global.AIBuilder =            global.AIBuilder              || require('ai.builder');
global.AICleanser =           global.AICleanser             || require('ai.cleanser');
global.AIHarvester =          global.AIHarvester            || require('ai.harvester');
global.AILongRangeHarvester = global.AILongRangeHarvester   || require('ai.longrangeharvester');
global.AIReclaimer =          global.AIReclaimer            || require('ai.reclaimer');
global.AIRefueler =           global.AIRefueler             || require('ai.refueler');
global.AITower =              global.AITower                || require('ai.tower');
global.AIUpgrader =           global.AIUpgrader             || require('ai.upgrader');
global.Factory =              global.Factory                || require('factory');
global.Foreman =              global.Foreman                || require('foreman');
global.GarbageCollector =     global.GarbageCollector       || require('garbagecollector');
global.Surveyor =             global.Surveyor               || require('surveyor');
global.TickCache =            global.TickCache              || require('tickcache');
global.Utility =              global.Utility                || require('utility');


module.exports.loop = function() {
   //Free unused memory
   GarbageCollector.freeUnusedMemory();

   //Calculate room source point arrays
   Surveyor.survey();

   //Foreman tick
   Foreman.tick();
};