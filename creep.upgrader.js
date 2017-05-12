/**
 * The base controller upgrader creep :
 * - CARRY, MOVE, WORK body parts
 * - associated to an energy source access terrain
 * - targets extensions then spawn that need energy
 *
 * It will go to the source, get energy, go to the target and transfer the energy, until it dies.
 * This is the first creep that starts the colony.
 */

let objects = require('./objects');

module.exports.__proto__ = require('./creep');

/**
 * Body parts for a heavy harvester
 * CARRY x 3, MOVE, WORK x 5
 * - consumes 700 energy units
 */
module.exports.body_parts = [CARRY, CARRY, CARRY, MOVE, WORK, WORK, WORK, WORK, WORK];

module.exports.role          = 'upgrader';
module.exports.single_target = true;
module.exports.source_work   = false;

/**
 * Target job is never true
 *
 * @returns boolean We can always upgrade a controller
 */
module.exports.targetJobDone = function()
{
	return false;
};

/**
 * Targets are the room controller
 *
 * @param context RoomObject
 * @return StructureController[]
 */
module.exports.targets = function(context)
{
	return context.room.controller ? [context.room.controller] : [];
};
