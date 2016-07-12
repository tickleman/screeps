/**
 * The base harvester creep :
 * - CARRY, MOVE, WORK body parts
 * - associated to an energy source access terrain
 * - targets extensions then spawn that need energy
 *
 * It will go to the source, get energy, go to the target and transfer the energy, until it dies.
 * This is the first creep that starts the colony.
 */

module.exports.__proto__ = require('./creep');

/**
 * @type string
 */
module.exports.role = 'harvester';

/**
 * Targets are the not filled-in extensions, or the spawn if there are none of them
 *
 * @param creep Creep
 * @return StructureExtension[]|StructureSpawn[]
 **/
module.exports.targets = function(creep)
{
	var room = creep ? creep.room : Game.spawns.Spawn.room;
	// priority to extensions
	var targets = room.find(FIND_STRUCTURES, { filter: structure =>
		(structure.energy < structure.energyCapacity)
		&& (structure.structureType == STRUCTURE_EXTENSION)
	});
	// if no extensions or all extensions are already filled in : go to spawn
	if (!targets.length) {
		targets = this.__proto__.targets(creep);
	}
	return targets;
};
