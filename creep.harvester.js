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
 * @type boolean
 */
var DEBUG = true;

/**
 * @type string
 */
module.exports.role = 'harvester';

/**
 * Targets are the not filled-in extensions, or the spawn if there are none of them
 *
 * @param [creep] Creep
 * @return StructureExtension[]|StructureSpawn[]
 **/
module.exports.targets = function(creep)
{
	if (DEBUG) console.log('creep.harvester.targets :');
	// priority to the nearest extension
	var targets;
	if (creep) {
		if (DEBUG) console.log('creep.harvester.targets.extension(' + creep.name + ')');
		targets = [creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: structure =>
			(structure.energy < structure.energyCapacity)
			&& (structure.structureType == STRUCTURE_EXTENSION)
		})];
	}
	else {
		if (DEBUG) console.log('creep.harvester.targets.extension(Spawn)');
		targets = _.filter(Game.spawns.Spawn.room.find(FIND_STRUCTURES), structure =>
			(structure.energy < structure.energyCapacity)
			&& (structure.structureType == STRUCTURE_EXTENSION)
		);
	}
	// if no extensions or all extensions are already filled in : go to spawn
	if (!targets.length) {
		targets = this.__proto__.targets(creep);
	}
	if (DEBUG) console.log('creep.harvester.targets.find ?');
	if (DEBUG) console.log(targets.length);
	return targets;
};
