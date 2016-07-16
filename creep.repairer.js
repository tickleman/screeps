
module.exports.__proto__ = require('./creep');

module.exports.body_parts = [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, WORK, WORK, WORK];

/**
 * @type string
 */
module.exports.role = 'repairer';

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
 * Job is done when the target is repaired
 *
 * @param creep  Creep
 * @param target Structure
 * @return boolean
 */
module.exports.targetJobDone = function(creep, target)
{
	return target.hits == target.hitsMax;
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
	var targets = room.find(FIND_MY_STRUCTURES, { filter:
		structure => structure.hits < structure.hitsMax
	});
	return targets;
};
