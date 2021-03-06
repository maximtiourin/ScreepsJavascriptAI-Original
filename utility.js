var Utility = {
    OWNERSHIP_ANY: 0,
    OWNERSHIP_MINE: 1,
    OWNERSHIP_ENEMY: 2,
    GUID: {
        /*
         * Generates a guid for the given basename such that it is as low as possible while being unique
         * for that basename
         */
        creepGenerate: function(baseName) {
            let n = 1;

            let done = false;
            while (!done) {
                if (Game.creeps[(baseName + n)]) {
                    n++;
                }
                else {
                    done = true;
                }
            }

            return n;
        }
    },
    Count: {
        containerResources: function(container) {
            return _.sum(container.store);
        },
        creepsOfRole: function(role) {
            return _.sum(Game.creeps, (creep) => { return creep.memory.role === role });
        },
        creepsOfRoleAssignedToRoom: function(role, room, additionalFilter = undefined) {
            return _.sum(Game.creeps, (creep) => { 
                return (creep.memory.role === role) && (creep.memory.assignedRoom === room.name) && (!additionalFilter || additionalFilter(creep)); 
            });
        },
        creepEnergyLeftToFill: function(creep) {
          return creep.carryCapacity - creep.carry.energy;
        },
    },
    Evaluate: {
        /*
         * Returns true if func is undefined, otherwise returns the result of "func(value)"
         */
        undefinedBooleanFunction: function(func, value) {
            return (func != undefined && func != null) ? (func(value)) : (true);
        },
        isCreepEnergyEmpty: function(creep) {
            return creep.carry.energy == 0;
        },
        isCreepEnergyFull: function(creep) {
            return creep.carry.energy == creep.carryCapacity;
        },
        isCreepRole: function(creep, role) {
            return creep.memory.role === role;   
        },
        isSpawnCurrentlyUsable: function(spawn) {
            let ret = spawn.canCreateCreep([MOVE]);
            return ret == 0;
        },
        isStructureOwnedBy: function(structure, ownership = 0, strictOwnership = false) {
            if (ownership == Utility.OWNERSHIP_ANY) {
                return true;
            }
            else if (ownership == Utility.OWNERSHIP_MINE) {
                if (structure.owner) {
                    if (structure.my) {
                        return true;
                    }
                }
                else if (!strictOwnership) {
                    return true;
                }
            }
            else if (ownership == Utility.OWNERSHIP_ENEMY) {
                if (structure.owner) {
                    if (!structure.my) {
                        return true;
                    }
                }
                else if (!strictOwnership) {
                    return true;
                }
            }

            return false;
        }
    },
    Filter: {
        Boolean: {
            refuelStructures: function(structure) {
                return (structure.energy < structure.energyCapacity);
            },
            repairStructures: function(structure) {
                if (structure.structureType === STRUCTURE_RAMPART) {
                    return structure.hits <= 60000;
                }
                else if (structure.structureType === STRUCTURE_WALL) {
                    return structure.hits <= 60000;
                }
                else {
                    return structure.hits < structure.hitsMax;
                }
            }
        },
        Priority: {
            buildStructures: function(e) {
                if (e.structureType === STRUCTURE_CONTAINER) {
                    return 1;
                }
                else if (e.structureType === STRUCTURE_EXTENSION) {
                    return 2;
                }
                else if (e.structureType === STRUCTURE_TOWER) {
                    return 3;
                }
                else {
                    return 999;
                }
            },
            containersWithEnoughEnergy: function(e, ...[energy]) {
                if (e.store[RESOURCE_ENERGY] >= energy) {
                 return 0;
                }
                else {
                 return 999;
                }
            },
            refuelStructures: function(e) {
                if (e.structureType === STRUCTURE_SPAWN) {
                    return 1;
                }
                else if (e.structureType === STRUCTURE_EXTENSION) {
                    return 2;
                }
                else if (e.structureType === STRUCTURE_TOWER) {
                    return 3;
                }
                else {
                    return 999;
                }
            },
            repairStructures: function(e) {
                if (e.structureType === STRUCTURE_CONTAINER) {
                    return 1;
                }
                else if (e.structureType === STRUCTURE_EXTENSION) {
                    return 2;
                }
                else if (e.structureType === STRUCTURE_TOWER) {
                    return 3;
                }
                else {
                    return 999;
                }
            }
        }
    },
    Get: {
        structureOfTypeAtRoomPosition: function(room, type, pos, ownership = 0, strictOwnership = false, additionalFilter = undefined) {
            let found = room.lookForAt(LOOK_STRUCTURES, pos.x, pos.y);
            if (found.length > 0) {
                for (let key in found) {
                    let structure = found[key];

                    if (structure.structureType === type) {
                        if (Utility.Evaluate.isStructureOwnedBy(structure, ownership, strictOwnership)) {
                            if (Utility.Evaluate.undefinedBooleanFunction(additionalFilter, structure)) {
                                return structure;
                            }
                        }
                    }
                }
            }

            return null;
        }
    },
    Group: {
        /*
         * Groups the elements of the collection by the value they return when run through the filter.
         *
         * By default, filter should take as its argument the element of the collection, 
         * but can be supplied additional arguments as a rest parameter.
         *
         * Returns the first group based on the order in which the groups were generated
         */
        first: function(collection, filter, ...filterArgs) {
            //Group structures by their priority
             let groups = _.groupBy(collection, function(value) {
                if (filterArgs && filterArgs.length > 0) {
                    return filter(value, filterArgs);
                }
                else {
                    return filter(value);
                }
             });

             //Get the first group
             let groupKey = Object.keys(groups)[0];
             let firstGroup = groups[groupKey];

             return firstGroup;
        }
    },
    List: {
        allConstructionSitesInRoom: function(room, ownership = 0, additionalFilter = undefined) {
            let sites = room.find(FIND_CONSTRUCTION_SITES, {
                filter: function(site) {
                    if (Utility.Evaluate.undefinedBooleanFunction(additionalFilter, site)) {
                        if (ownership == Utility.OWNERSHIP_MINE) {
                            return site.my;
                        }
                        else if (ownership == Utility.OWNERSHIP_ENEMY) {
                            return !site.my;
                        }
                        else {
                            return true;
                        }
                    }
                    else {
                       return false;
                    }
                }
            });
            return sites;
        },
        allStructuresInRoom(room, ownership = 0, strictOwnership = false, additionalFilter = undefined) {
            let structures = room.find(FIND_STRUCTURES, {
                filter: function(structure) {
                    if (Utility.Evaluate.isStructureOwnedBy(structure, ownership, strictOwnership)) {
                        if (Utility.Evaluate.undefinedBooleanFunction(additionalFilter, structure)) {
                            return true;
                        }
                    }

                    return false;
                }
            });
            return structures;
        },
        allStructuresOfTypeInRoom: function(room, type, ownership = 0, strictOwnership = false, additionalFilter = undefined) {
            let structures = room.find(FIND_STRUCTURES, {
                filter: function(structure) {
                    if (structure.structureType === type) {
                        if (Utility.Evaluate.isStructureOwnedBy(structure, ownership, strictOwnership)) {
                            if (Utility.Evaluate.undefinedBooleanFunction(additionalFilter, structure)) {
                                return true;
                            }
                        }
                    }

                    return false;
                }
            });
            return structures;
        }
    },
    Math: {
        clamp: function(value, min, max) {
            return Math.max(Math.min(value, max), min);
        },
        /*
         * Takes two objects that have properties 'x' and 'y' to find the distance squared between them
         */
        distanceSquared: function(a, b) {
            let dx = b.x - a.x;
            let dy = b.y - a.y;
            return (dx * dx) + (dy * dy);
        }
    },
    Sort: {
        Position: {
            /*
             * Returns a new sorted collection by comparing the distanceSquared between obj.pos and collection->element.pos
             * where pos is an object that has properties 'x' and 'y'
             */
            distanceSquared: function(collection, obj) {
                return _.sortBy(collection, function(o) { return Utility.Math.distanceSquared(obj.pos, o.pos) });
            }
        }
    }
};

module.exports = Utility;