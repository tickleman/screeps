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
 * CARRY x 5, MOVE x5, consumes 500 energy units, moves 250 energy / tick
 */
module.exports.body_parts = [CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];

module.exports.role = 'carrier';

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
		(structure.structureType == STRUCTURE_EXTENSION) && !objects.energyFull(structure)
	});
	if (target) return [target];
	// the nearest spawn without energy into the current room
	target = context.pos.findClosestByRange(FIND_STRUCTURES, { filter: structure =>
		(structure.structureType == STRUCTURE_SPAWN) && !objects.energyFull(structure)
	});
	if (target) return [target];
	// next target : towers with less than 90% energy
	target = context.pos.findClosestByRange(
		FIND_MY_STRUCTURES,
		{ filter: structure => (structure.structureType == STRUCTURE_TOWER) && (objects.energyRatio(structure) < .9) }
	);
	if (target) return [target];
	// next target : builder and upgrader creeps
	for (let ratio in [.5, .7, .9]) {
		target = context.pos.findClosestByRange(FIND_MY_CREEPS, { filter: creep =>
			(creep.memory.role == 'builder') && (objects.energyRatio(creep) < ratio)
		});
		if (target) return [target];
		target = context.pos.findClosestByRange(FIND_MY_CREEPS, { filter: creep =>
			(creep.memory.role == 'repairer') && (objects.energyRatio(creep) < ratio)
		});
		if (target) return [target];
	}
	target = context.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: structure =>
		(structure.structureType == STRUCTURE_TOWER) && !objects.energyFull(structure)
	});
	if (target) return [target];
	target = context.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: structure =>
		((structure.structureType == STRUCTURE_CONTAINER) || (structure.structureType == STRUCTURE_STORAGE))
		&& !objects.energyFull(structure)
	});
	return target ? [target] : [];
};
