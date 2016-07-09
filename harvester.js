
var names   = require('names');
var sources = require('sources');

module.exports.__proto__ = require('creep');

/**
 * The base harvester creep :
 * - must have at least CARRY, MOVE, WORK body parts
 * - must be associated to a source
 *
 * It will go to the source, get energy, go to the target and transfer the energy, until it dies.
 * This is the first creep that starts the colony.
 */

/**
 * Spawns a simple harvester
 * - has CARRY, MOVE, WORK
 * - go to a source with an available terrain
 * - fills the spawn (or target)
 *
 * @param role   string @default 'harvester'
 * @param target string @default Game.spawns.Spawn.id
 */
module.exports.spawn = function(role, target)
{
	if (!Game.spawns.Spawn.canCreateCreep([CARRY, MOVE, WORK])) {
		var source = sources.availableSourceId();
		// no available source id ? they must be at least one affected to a dead creep : cleanup
		if (!source) {
			sources.memorize(true);
			source = sources.availableSourceId(true);
		}
		// spawn a new harvester
		var creep_name = Game.spawns.Spawn.createCreep([CARRY, MOVE, WORK], names.chooseName(), {
			role:   role ? role : 'harvester',
			source: source,
			target: target ? target : Game.spawns.Spawn.id
		});
		console.log('spawns ' + role + ' ' + creep_name);
		// cleanup memory (remove dead harvesters, add new harvester)
		sources.memorize(true);
		this.freeMemory();
	}
};

/**
 * Finds an available target for the harvester : the first not filled-in extension / spawn
 *
 * @param creep Creep
 **/
module.exports.targets = function(creep)
{
	// priority to extensions
	var targets = creep.room.find(FIND_STRUCTURES, { filter: structure =>
		structure.energy < structure.energyCapacity
		&& structure.structureType == STRUCTURE_EXTENSION
	});
	// if no extensions or all extensions are already filled in : go to spawn
	if (!targets.length) {
		targets = creep.room.find(FIND_STRUCTURES, { filter: structure =>
			structure.energy < structure.energyCapacity
			&& structure.structureType == STRUCTURE_SPAWN
		});
	}
	return targets;
};

/**
 * Let the creep work
 *
 * @param creep Creep
 **/
module.exports.work = function(creep)
{
	if (!this.fill(creep)) {
		var target = Game.getObjectById(creep.memory.target);
		// transfer to structure
		if (target) {
			if (target.energy >= target.energyCapacity) {
				delete creep.memory.target;
			}
			else if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				creep.moveTo(target);
			}
		}
		// find target
		else {
			var targets = this.targets(creep);
			if (targets.length) creep.memory.target = targets[0].id;
			else delete creep.memory.target;
		}
	}
};
