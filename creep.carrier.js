/**
 * The fast carrier :
 * - is as fast as it can (outside of swamps)
 * - goes to energy dropped on the ground by heavy harvesters
 * - bring this energy to extensions and spawn
 */

var objects = require('./objects');
var rooms   = require('./rooms');

module.exports.__proto__ = require('./creep');

/**
 * Body parts for a fast carrier
 * CARRY x 5, MOVE x5
 * - consumes 500 energy units
 * - moves 250 energy / tick
 */
module.exports.body_parts = [CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];

module.exports.role = 'carrier';

/**
 * Returns true if the target needs energy.
 * A margin of 10 energy units is kept as target may have used its energy since the last transfer.
 *
 * @param target
 */
var needsEnergy = function(target)
{
	return (objects.energyCapacity(target) - objects.energy(target)) > 10;
};

/**
 * Job is done when the target is almost filled with energy
 *
 * @param creep Creep
 * @return boolean
 */
module.exports.targetJobDone = function(creep)
{
	let target = objects.get(creep, creep.memory.target);
	if (this.DEBUG) console.log('t: target =', target);
	let result = !needsEnergy(target);
	if (this.DEBUG) console.log(
		result ? 't: target job done (target energy full)' : 't: target job continue (target energy not full)'
	);
	return result;
};

/**
 * The targets are :
 * - the simple harvesters targets (extensions, then spawn), that need energy)
 * - upgraders
 *
 * @param context RoomObject
 * @returns Creep[]|StructureExtension[]|StructureSpawn[]|StructureTower[]
 */
module.exports.targets = function(context)
{
	// the nearest extension without energy into the current room
	var target = context.pos.findClosestByRange(FIND_STRUCTURES, { filter: structure =>
		(structure.structureType == STRUCTURE_EXTENSION) && needsEnergy(structure)
	});
	if (target) return [target];
	// the nearest spawn without energy into the current room
	target = context.pos.findClosestByRange(FIND_STRUCTURES, { filter: structure =>
		(structure.structureType == STRUCTURE_SPAWN) && needsEnergy(structure)
	});
	if (target) return [target];
	// next target : towers with less than 70% of energy
	target = context.pos.findClosestByRange(
		FIND_MY_STRUCTURES,
		{ filter: structure => (structure.structureType == STRUCTURE_TOWER) && (objects.energyRatio(structure) < .8) }
	);
	if (target) return [target];
	// next target : builder and upgrader creeps
	for (let ratio in [.2, .8]) {
		target = context.pos.findClosestByRange(FIND_MY_CREEPS, { filter: creep =>
			(creep.memory.role == 'builder') && (objects.energyRatio(creep) < ratio)
		});
		if (target) return [target];
		target = context.pos.findClosestByRange(FIND_MY_CREEPS, { filter: creep =>
			(creep.memory.role == 'repairer') && (objects.energyRatio(creep) < ratio)
		});
		if (target) return [target];
	}
	// towers with less than 100% of energy
	target = context.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: structure =>
		(structure.structureType == STRUCTURE_TOWER) && needsEnergy(structure)
	});
	if (target) return [target];
	// container and storage with available energy
	target = context.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: structure =>
		((structure.structureType == STRUCTURE_CONTAINER) || (structure.structureType == STRUCTURE_STORAGE))
		&& needsEnergy(structure)
	});
	return target ? [target] : [];
};
