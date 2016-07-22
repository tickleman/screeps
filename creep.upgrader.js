/**
 * The base controller upgrader creep :
 * - CARRY, MOVE, WORK body parts
 * - associated to an energy source access terrain
 * - targets extensions then spawn that need energy
 *
 * It will go to the source, get energy, go to the target and transfer the energy, until it dies.
 * This is the first creep that starts the colony.
 */

var objects = require('./objects');

module.exports.__proto__ = require('./creep');

/**
 * Body parts for a heavy harvester
 * CARRY x 2, MOVE, WORK x 5
 * - consume 550 energy units
 */
module.exports.body_parts = [CARRY, CARRY, MOVE, WORK, WORK, WORK, WORK];

/**
 * @type string
 */
module.exports.role = 'upgrader';

/**
 * Always full : we never fill the heavy upgrader : a carrier will bring him energy
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
 * The target job is to upgrade the controller
 *
 * @param creep Creep
 * @returns number
 */
module.exports.targetJob = function(creep)
{
	let target = objects.get(creep, creep.memory.target);
	//noinspection JSCheckFunctionSignatures
	return target ? creep.upgradeController(target) : this.NO_TARGET;
};

/**
 * The job is never done : controllers can always be upgraded
 *
 * @return boolean false
 */
module.exports.targetJobDone = function()
{
	return false;
};

/**
 * Targets are the room controller
 *
 * @param creep Creep
 * @return StructureController[]
 */
module.exports.targets = function(creep)
{
	return [creep.room.controller];
};
