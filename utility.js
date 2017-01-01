var Utility = {
    OWNERSHIP_ANY: 0,
    OWNERSHIP_MINE: 1,
    OWNERSHIP_ENEMY: 2,
    Count: {
        containerResources: function(container) {
            return _.sum(container.store);
        },
        creepsOfRole: function(role) {
            return _.sum(Game.creeps, (creep) => { return creep.memory.role === role });
        },
        creepsOfRoleAssignedToRoom: function(role, room) {
            return _.sum(Game.creeps, (creep) => { return (creep.memory.role === role) && (creep.memory.assignedRoom === room.name) });
        }
    },
    Evaluate: {
        /*
         * Returns true if func is undefined, or returns the return value of func by passing it value
         */
        ifDefinedIsItTrue: function(func, value) {
            return (func) ? (func(value)) : (true);
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
                if (structure instanceof OwnedStructure) {
                    if (structure.my) {
                        return true;
                    }
                }
                else if (!strictOwnership) {
                    return true;
                }
            }
            else if (ownership == Utility.OWNERSHIP_ENEMY) {
                if (structure instanceof OwnedStructure) {
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
    Get: {
        structureOfTypeAtRoomPosition: function(room, type, pos, ownership = 0, strictOwnership = false, additionalFilter = undefined) {
            let found = room.lookForAt(LOOK_STRUCTURES, pos.x, pos.y);
            if (found.length > 0) {
                for (let key in found) {
                    let structure = found[key];

                    if (structure.structureType === type) {
                        if (Utility.Evaluate.isStructureOwnedBy(structure, ownership, strictOwnership)) {
                            if (Utility.Evaluate.ifFunctionIsDefinedAndTrue(additionalFilter, structure)) {
                                return structure;
                            }
                        }
                    }
                }
            }

            return null;
        }
    },
    List: {
        allConstructionSitesInRoom: function(room, ownership = 0, additionalFilter = undefined) {
            let sites = room.find(FIND_CONSTRUCTION_SITES, {
                filter: function(site) {
                    if (Utility.Evaluate.ifFunctionIsDefinedAndTrue(additionalFilter, structure)) {
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
        allStructuresOfTypeInRoom: function(room, type, ownership = 0, strictOwnership = false, additionalFilter = undefined) {
            let structures = room.find(FIND_STRUCTURES, {
                filter: function(structure) {
                    if (structure.structureType === type) {
                        if (Utility.Evaluate.isStructureOwnedBy(structure, ownership, strictOwnership)) {
                            if (Utility.Evaluate.ifFunctionIsDefinedAndTrue(additionalFilter, structure)) {
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
        /*
         * Takes two objects that have properties 'x' and 'y' to find the distance squared between them
         */
        distanceSquared: function(a, b) {
            let dx = b.x - a.x;
            let dy = b.y - a.y;
            return (dx * dx) + (dy * dy);
        }
    }
};

module.exports = Utility;