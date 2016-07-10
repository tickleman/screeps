/**
 * The base controller upgrader creep :
 * - CARRY, MOVE, WORK body parts
 * - associated to an energy source access terrain
 * - targets extensions then spawn that need energy
 *
 * It will go to the source, get energy, go to the target and transfer the energy, until it dies.
 * This is the first creep that starts the colony.
 */

module.exports.__proto__ = require('creep');

/**
 * @type string
 */
module.exports.role = 'upgrader';

/**
 * The target job is to upgrade the controller
 *
 * @param creep  Creep
 * @param target StructureController
 * @returns integer
 */
module.exports.targetJob = function(creep, target)
{
	return creep.upgradeController(target);
};

/**
 * Targets are the room controller
 *
 * @return StructureController[]
 */
module.exports.targets = function()
{
	return [Game.spawns.Spawn.room.controller];
};
