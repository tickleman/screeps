
module.exports.__proto__ = require('creep');

/**
 * @type string
 */
module.exports.role = 'builder';

/**
 * The target job is to build the target
 *
 * @param creep  Creep
 * @param target StructureController
 * @return integer
 */
module.exports.targetJob = function(creep, target)
{
	return creep.build(target);
};

/**
 * Targets are construction sites
 * If there are no construction sites : the builder becomes an upgrader
 *
 * @param creep Creep
 * @return ConstructionSite[]
 **/
module.exports.targets = function(creep)
{
	var room = creep ? creep.room : Game.spawns.Spawn.room;
	var targets = room.find(FIND_CONSTRUCTION_SITES);
	if (!targets.length) {
		creep.memory.role = 'upgrader';
	}
	return targets;
};