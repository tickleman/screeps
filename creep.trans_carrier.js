/**
 * A big fast carrier that makes it job into a foreign room
 */

let objects = require('./objects');
let rooms   = require('./rooms');

module.exports.__proto__ = require('./creep.carrier');

/**
 * Body parts for a fast carrier
 * CARRY x 15, MOVE x15
 * - consumes up to 1600 energy units
 * - moves 750 energy / tick
 */
module.exports.body_parts = [
	CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
	MOVE,  MOVE,  MOVE,  MOVE,  MOVE,  MOVE,  MOVE,  MOVE,  MOVE,  MOVE,  MOVE,  MOVE,  MOVE,  MOVE,  MOVE
];

module.exports.role = 'trans_carrier';

/**
 * Returns true if the target needs energy.
 * A margin of 10 energy units is kept as target may have used its energy since the last transfer.
 *
 * @param target
 */
let needsEnergy = function(target)
{
	return (objects.energyCapacity(target) - objects.energy(target)) > 10;
};

/**
 * @param creep Creep
 * @return boolean
 */
module.exports.sourceJobDone = function(creep)
{
	if (creep.room.name === creep.memory.source_room) {
		return module.exports.__proto__.sourceJobDone(creep);
	}
	else {
		if (!objects.range(creep, Game.flags['to-' + creep.memory.source_room])) {
			creep.memory.source = creep.memory.final_source;
		}
		return false;
	}
};

/**
 * @param context RoomObject
 * @returns Creep[]|Flag[]|StructureExtension[]|StructureSpawn[]|StructureTower[]
 */
module.exports.sources = function(context)
{
	if (context instanceof Creep) {
		if (context.room.name === context.memory.source_room) {
			return [Game.getObjectById(context.memory.final_source)];
		}
		else {
			return [Game.flags['to-' + context.memory.source_room]];
		}
	}
	return [];
};

/**
 * @param creep Creep
 * @return boolean
 */
module.exports.targetJobDone = function(creep)
{
	if (creep.room.name === creep.memory.target_room) {
		return module.exports.__proto__.targetJobDone(creep);
	}
	else {
		if (!objects.range(creep, Game.flags['to-' + creep.memory.target_room])) {
			creep.memory.target = creep.memory.final_target;
		}
		return false;
	}
};

/**
 * @param context RoomObject
 * @returns Creep[]|Flag[]|StructureExtension[]|StructureSpawn[]|StructureTower[]
 */
module.exports.targets = function(context)
{
	if (context instanceof Creep) {
		return (context.room.name === context.memory.target_room)
			? module.exports.__proto__.targets(context)
			: [Game.flags['to-' + context.memory.target_room]];
	}
	return [];
};
