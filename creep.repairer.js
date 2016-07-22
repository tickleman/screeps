
var objects = require('./objects');

module.exports.__proto__ = require('./creep');

module.exports.body_parts = [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, WORK, WORK, WORK];

module.exports.role = 'repairer';

/**
 * The carrier source work is to pickup the dropped energy
 *
 * @param creep Creep
 * @return number
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
 * The target job is to build the target
 *
 * @param creep Creep
 * @return number
 */
module.exports.targetJob = function(creep)
{
	var target = objects.get(creep, creep.memory.target);
	return target ? creep.repair(target) : this.NO_TARGET;
};

/**
 * Job is done each time the creep energy is zero (new target) and if the target is fully repaired
 *
 * @param creep Creep
 * @return boolean
 */
module.exports.targetJobDone = function(creep)
{
	var target = objects.get(creep, creep.memory.target);
	return !target || (target.hits == target.hitsMax) || !creep.carry.energy;
};

/**
 * Targets are construction sites
 * If there are no construction sites : the builder becomes an upgrader
 *
 * @param context RoomObject
 * @return ConstructionSite[]
 **/
module.exports.targets = function(context)
{
	var targets = _.filter(context.room.find(FIND_STRUCTURES), structure => structure.hits < structure.hitsMax);
	targets.sort(function(s1, s2) {
		let r1 = s1.hits / s1.hitsMax;
		let r2 = s2.hits / s2.hitsMax;
		if (r1 < r2) return -1;
		if (r1 > r2) return 1;
		return 0;
	});
	return targets;
};
