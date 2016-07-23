
var rooms = require('./rooms');
var tests = require('./tests');

var cache = {};

/**
 * Returns true if the creep can do the told job
 *
 * @param creep Creep
 * @param [what] string ATTACK, CARRY, CLAIM, HEAL, MOVE, RANGED_ATTACK, TOUGH, WORK
 * @returns boolean|object if what is not set, returns an object with { body_part: true }
 */
var can = function(creep, what)
{
	if (!what) var parts = {};
	for (let part in creep.body) if (creep.body.hasOwnProperty(part)) {
		part = creep.body[part];
		if (!what) parts[part.type] = true;
		else if (part.type == what) return true;
	}
	return what ? false : parts;
};

/**
 * @type boolean
 */
module.exports.DEBUG = true;

/**
 * @param object RoomObject
 * @return number damage ratio (0 = wreck, 1 = ok)
 */
module.exports.hitsRatio = function(object)
{
	return object.hitsMax ? (object.hits / object.hitsMax) : 1;
};

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

/**
 * Gets energy from any source
 *
 * @param creep             Creep
 * @param source            RoomObject
 * @param [allow_dismantle] boolean
 * @returns number
 */
module.exports.getEnergy = function(creep, source, allow_dismantle)
{
	var creep_can = can(creep);
	if (this.DEBUG) console.log(creep, 'getEnergy', source, tests.dump(creep_can));
	if (creep_can[CARRY]) {
		if (this.DEBUG) console.log('- can carry');
		if (source instanceof Creep)              return source.transfer(creep, RESOURCE_ENERGY);
		if (source instanceof Resource)           return creep.pickup(source);
		if (source instanceof StructureContainer) return creep.withdraw(source, RESOURCE_ENERGY);
		if (source instanceof StructureExtension) return creep.withdraw(source, RESOURCE_ENERGY);
		if (source instanceof StructureLink)      return creep.withdraw(source, RESOURCE_ENERGY);
		if (source instanceof StructureNuker)     return creep.withdraw(source, RESOURCE_ENERGY);
		if (source instanceof StructureSpawn)     return creep.withdraw(source, RESOURCE_ENERGY);
		if (source instanceof StructureStorage)   return creep.withdraw(source, RESOURCE_ENERGY);
		if (source instanceof StructureTerminal)  return creep.withdraw(source, RESOURCE_ENERGY);
		if (source instanceof StructureTower)     return creep.withdraw(source, RESOURCE_ENERGY);
	}
	if (creep_can[WORK]) {
		if (this.DEBUG) console.log('- can work');
		if (source instanceof Mineral) return creep.harvest(source);
		if (source instanceof Source)  return creep.harvest(source);
		if (allow_dismantle && source.my && (source instanceof Structure)) return creep.dismantle(source);
	}
	if (!source.my) {
		if (this.DEBUG) console.log('- not mine');
		if (creep_can[CLAIM] && source instanceof StructureController) return creep.attackController(source);
		if (creep_can[ATTACK])                                         return creep.attack(source);
		if (creep_can[RANGED_ATTACK])                                  return creep.rangedAttack(source);
	}
	if (this.DEBUG) console.log('- invalid source');
	return ERR_INVALID_TARGET;
};

/**
 * Puts energy to target, depending on its need
 *
 * @param creep  Creep
 * @param target RoomObject
 * @returns number
 */
module.exports.putEnergy = function(creep, target)
{
	var creep_can = can(creep);
	if (this.DEBUG) console.log(creep, 'putEnergy', target, tests.dump(creep_can));
	if (creep_can[HEAL]) {
		if (this.DEBUG) console.log('- can heal');
		if ((target instanceof Creep) && this.wounded(target)) return creep.heal(target);
	}
	if (creep_can[WORK]) {
		if (this.DEBUG) console.log('- can work');
		if ((target instanceof Structure) && this.wounded(target)) return creep.repair(target);
		if (target instanceof ConstructionSite)    return creep.build(target);
		if (target instanceof StructureController) return creep.upgradeController(target);
	}
	if (this.DEBUG) console.log('- try transfer / drop');
	if (target instanceof Creep)              return creep.transfer(target);
	if (target instanceof Resource)           return creep.drop(RESOURCE_ENERGY);
	if (target instanceof RoomPosition)       return creep.drop(RESOURCE_ENERGY);
	if (target instanceof StructureContainer) return creep.transfer(target);
	if (target instanceof StructureExtension) return creep.transfer(target);
	if (target instanceof StructureLink)      return creep.transfer(target);
	if (target instanceof StructureNuker)     return creep.transfer(target);
	if (target instanceof StructureSpawn)     return creep.transfer(target);
	if (target instanceof StructureStorage)   return creep.transfer(target);
	if (target instanceof StructureTerminal)  return creep.transfer(target);
	if (target instanceof StructureTower)     return creep.transfer(target);
	if (this.DEBUG) console.log('- invalid target');
	return ERR_INVALID_TARGET;
};

/**
 * @param object RoomObject
 * @return boolean true if the object is wounded, false if it is fully healed
 */
module.exports.wounded = function(object)
{
	return !(object.hits == object.hitsMax);
};
