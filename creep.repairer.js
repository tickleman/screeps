
module.exports.__proto__ = require('./creep');

module.exports.body_parts = [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, WORK, WORK, WORK];

/**
 * @type string
 */
module.exports.role = 'repairer';

/**
 * The carrier source work is to pickup the dropped energy
 *
 * @param creep  Creep
 * @param source energy
 */
module.exports.sourceJob = function(creep, source)
{
	return creep.pickup(source);
};

/**
 * The carrier source is the nearest dropped energy
 *
 * @param creep Creep optional
 */
module.exports.sources = function(creep)
{
	var position = creep ? creep.pos : Game.spawns.Spawn.pos;
	var source = position.findClosestByRange(FIND_DROPPED_ENERGY);
	return (source ? [source] : []);
};

/**
 * The target job is to build the target
 *
 * @param creep  Creep
 * @param target StructureController
 * @return integer
 */
module.exports.targetJob = function(creep, target)
{
	return creep.repair(target);
};

/**
 * Job is done each time the creep energy is zero (new target) and if the target is fully repaired
 *
 * @param creep  Creep
 * @param target Structure
 * @return boolean
 */
module.exports.targetJobDone = function(creep, target)
{
	return (target.hits == target.hitsMax) || !creep.carry.energy;
};

/**
 * Targets are construction sites
 * If there are no construction sites : the builder becomes an upgrader
 *
 * @param [creep] Creep
 * @return ConstructionSite[]
 **/
module.exports.targets = function(creep)
{
	var room = creep ? creep.room : Game.spawns.Spawn.room;
	var targets = _.filter(
		room.find(FIND_STRUCTURES),
		structure => structure.hits < structure.hitsMax
	);
	targets.sort(function(s1, s2) {
		let r1 = s1.hits / s1.hitsMax;
		let r2 = s2.hits / s2.hitsMax;
		if (r1 < r2) return -1;
		if (r1 > r2) return 1;
		return 0;
	});
	return targets;
};
