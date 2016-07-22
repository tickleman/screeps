/**
 * The fast carrier :
 * - is as fast as it can (outside of swamps)
 * - goes to energy dropped on the ground by heavy harvesters
 * - bring this energy to extensions and spawn
 */

var objects = require('./objects');

module.exports.__proto__ = require('./creep');

/**
 * Body parts for a fast carrier
 * CARRY x 5, MOVE x5, consumes 500 energy units, moves 250 energy / tick
 */
module.exports.body_parts = [CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];

/**
 * Its role : specialized in energy transportation
 */
module.exports.role = 'carrier';

/**
 * The carrier source work is to pickup the dropped energy
 *
 * @param creep Creep
 */
module.exports.sourceJob = function(creep)
{
	let source = objects.get(creep, creep.memory.source);
	//noinspection JSCheckFunctionSignatures
	return source ? creep.pickup(source) : this.NO_SOURCE;
};

/**
 * The carrier source is the nearest dropped energy
 *
 * @param context RoomObject
 */
module.exports.sources = function(context)
{
	var source = context.pos.findClosestByRange(FIND_DROPPED_ENERGY);
	return source ? [source] : [];
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
	// priority to extensions, then spawn, that need energy
	var targets = this.__proto__.targets(context);
	if (targets.length) return targets;
	// next target : towers with less than 90% energy
	var target = context.pos.findClosestByRange(
		FIND_MY_STRUCTURES,
		{ filter: structure => (structure.structureType == STRUCTURE_TOWER) && ((structure.hits / structure.hitsMax) < .9) }
	);
	if (target) return [target];
	for (let ratio in [.5, .7, .9]) {
		// next target : builder creeps
		target = context.pos.findClosestByRange(
			FIND_MY_CREEPS,
			{ filter: creep => (creep.memory.role == 'builder') && (creep.carry.energy / creep.carryCapacity < ratio) }
		);
		if (target) break;
		// next target : upgrader creeps
		target = context.pos.findClosestByRange(
			FIND_MY_CREEPS,
			{ filter: creep => (creep.memory.role == 'upgrader') && (creep.carry.energy / creep.carryCapacity < ratio) }
		);
		if (target) break;
	}
	// the creep that have the less energy first
	/*
	targets.sort(function(creep1, creep2) {
		var fill1 = creep1.carry.energy / creep1.carryCapacity;
		var fill2 = creep2.carry.energy / creep2.carryCapacity;
		if (fill1 < fill2) return -1;
		if (fill1 > fill2) return 1;
		return 0;
	});
	*/
	return target ? [target] : [];
};
