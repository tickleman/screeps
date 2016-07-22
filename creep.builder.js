
var objects = require('./objects');

module.exports.__proto__ = require('./creep');

/**
 * Body parts for a heavy builder
 * CARRY x 2, MOVE, WORK x 4
 * - consume 550 energy units
 */
module.exports.body_parts = [CARRY, CARRY, MOVE, WORK, WORK, WORK, WORK];

/**
 * @type string
 */
module.exports.role = 'builder';

/**
 * Always full : we never fill the heavy builder : a carrier will bring him energy
 *
 * @return boolean true
 **/
module.exports.sourceJobDone = function()
{
	return true;
};

/**
 * This creep has no source
 *
 * @returns array []
 */
module.exports.sources = function()
{
	return [];
};

/**
 * The target job is to build the target
 *
 * @param creep Creep
 * @return number
 */
module.exports.targetJob = function(creep)
{
	if (creep.carry.energy) {
		let target = objects.get(creep, creep.memory.target);
		if (target) creep.build(target);
	}
	return 0;
};

/**
 * Job is done when the target does not exist anymore : so it is not done until it is replaced with the built structure
 *
 * @return boolean
 */
module.exports.targetJobDone = function()
{
	return false;
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
	var target = context.findClosestByRange(FIND_CONSTRUCTION_SITES);
	return target ? [target] : [];
};
