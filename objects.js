
var rooms = require('./rooms');

var cache = {};

/**
 * @param context RoomObject|RoomPosition
 * @param target RoomObject|RoomPosition|string|number
 * @returns RoomObject|RoomPosition|null
 */
module.exports.get = function(context, target)
{
	// already a room object or position
	if ((target instanceof RoomObject) || (target instanceof RoomPosition) || !target) {
		return target;
	}
	if (cache[target]) return cache[target];
	if (context instanceof RoomObject) context = context.pos;
	if (cache[context.roomName] && cache[context.roomName][target]) return cache[context.roomName][target];
	// a number : may be some kind of FIND_RESOURCE, FIND_STRUCTURE, or what
	if (!isNaN(target)) {
		let object = context.findClosestByRange(target);
		if (object instanceof RoomObject) {
			return cache[target] = object;
		}
	}
	// a 24 characters long string : it is probably an id
	if (target.length == 24) {
		let object = Game.getObjectById(target);
		if (object instanceof RoomObject) {
			return cache[target] = object;
		}
	}
	// a room role ?
	if (Memory.rooms[context.roomName][target]) {
		if (!cache[context.roomName]) cache[context.roomName] = {};
		return cache[context.roomName][target] = rooms.get(context.roomName, target);
	}
	// the name of a creep ?
	if (Game.creeps[target]) {
		return cache[target] = Game.creeps[target];
	}
	// the name of a flag ?
	if (Game.flags[target]) {
		return cache[target] = Game.flags[target];
	}
	// the name of a spawn ?
	if (Game.spawns[target]) {
		return cache[target] = Game.spawns[target];
	}
	return null;
};

/**
 * @param object RoomObject
 * @returns number|null
 */
module.exports.energy = function(object)
{
	if (object instanceof ConstructionSite)    return object.progress;
	if (object instanceof Creep)               return object.carry.energy;
	if (object instanceof Resource)            return object.amount;
	if (object instanceof Room)                return object.energyAvailable;
	if (object instanceof Source)              return object.energy;
	if (object instanceof StructureContainer)  return object.store[RESOURCE_ENERGY];
	if (object instanceof StructureController) return object.progress;
	if (object instanceof StructureExtension)  return object.energy;
	if (object instanceof StructureLink)       return object.energy;
	if (object instanceof StructureNuker)      return object.energy;
	if (object instanceof StructureSpawn)      return object.energy;
	if (object instanceof StructureStorage)    return object.store[RESOURCE_ENERGY];
	if (object instanceof StructureTerminal)   return object.store[RESOURCE_ENERGY];
	if (object instanceof StructureTower)      return object.energy;
	return null;
};

/**
 * @param object RoomObject
 * @returns number|null
 */
module.exports.energyCapacity = function(object)
{
	if (object instanceof ConstructionSite)    return object.progressTotal;
	if (object instanceof Creep)               return object.carryCapacity;
	if (object instanceof Resource)            return object.amount;
	if (object instanceof Room)                return object.energyCapacityAvailable;
	if (object instanceof Source)              return object.energyCapacity;
	if (object instanceof StructureContainer)  return object.storeCapacity;
	if (object instanceof StructureController) return object.progressTotal;
	if (object instanceof StructureExtension)  return object.energyCapacity;
	if (object instanceof StructureLink)       return object.energyCapacity;
	if (object instanceof StructureNuker)      return object.energyCapacity;
	if (object instanceof StructureSpawn)      return object.energyCapacity;
	if (object instanceof StructureStorage)    return object.storeCapacity;
	if (object instanceof StructureTerminal)   return object.storeCapacity;
	if (object instanceof StructureTower)      return object.energyCapacity;
	return null;
};

/**
 * @param object RoomObject
 * @returns number
 */
module.exports.energyRatio = function(object)
{
	return this.energy(object) / this.energyCapacity(object);
};

/**
 * @param object RoomObject
 * @returns boolean
 */
module.exports.energyFull = function(object)
{
	return this.energy(object) == this.energyCapacity(object);
};
