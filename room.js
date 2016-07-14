
var Path = require('./path');

module.exports.room = Game.spawns.Spawn.room;

/**
 * Prepare routes and creeps and store them into memory
 */
module.exports.prepare = function()
{
	// init
	var controller = null;
	var sources    = this.room.find(FIND_SOURCES_ACTIVE);
	for (let structure of this.room.find(FIND_STRUCTURES)) {
		if (structure.structureType == STRUCTURE_CONTROLLER) {
			controller = structure;
		}
		else if (structure.structureType === STRUCTURE_SPAWN) {
			spawn = structure;
		}
	}

	var nearest_distance;
	var paths = {};
	var path;

	// sources to spawn (harvester position) : keep only the nearest
	var nearest_to_spawn = null;
	nearest_distance = 999999;
	for (let source of sources) {
		path = Path.calculateTwoWay(source, spawn, 1);
		Path.unshift(path);
		paths[source.id] = {};
		paths[source.id][spawn.id] = path;
		console.log('source ' + source.id + ' to spawn ' + spawn.id + ' = ' + path.length);
		if (!nearest_to_spawn || (paths.length < nearest_distance)) {
			nearest_distance = paths.length;
			nearest_to_spawn = source;
		}
	}

	// sources to controller (upgrader position) : the nearest too
	var nearest_to_controller = null;
	nearest_distance = 999999;
	for (let source of sources) {
		path = Path.calculateTwoWay(source, controller, 3);
		Path.unshift(path);
		paths[source.id][controller.id] = path;
		console.log('source ' + source.id + ' to controller ' + controller.id + ' = ' + path.length);
		if (!nearest_to_controller || (paths.length < nearest_distance)) {
			nearest_distance      = paths.length;
			nearest_to_controller = source;
		}
	}

	// spawn to sources (harvester position)
	{
		path = Path.calculate(spawn, nearest_to_spawn, 1);
		paths[spawn.id] = {};
		paths[spawn.id][nearest_to_spawn.id] = path;
		console.log('spawn ' + spawn.id + ' to spawn source ' + nearest_to_spawn.id + ' = ' + path.length);
		if (nearest_to_controller.id !== nearest_to_spawn.id) {
			path = Path.calculate(spawn, nearest_to_controller, 1);
			console.log('spawn ' + spawn.id + ' to controller source ' + nearest_to_controller.id + ' = ' + path.length);
			paths[spawn.id][nearest_to_controller.id] = path;
		}
	}

	// creeps
	var creeps = [];

	// harvester : source-to-spawn
	creeps.push({
		role: 'harvester',
		init: paths[spawn.id][nearest_to_spawn.id]
	});
	// harvester : source-to-controller (if not the same)
	if (nearest_to_spawn.id != nearest_to_controller.id) {
		creeps.push({
			role: 'harvester',
			init: paths[spawn.id][nearest_to_controller.id]
		});
	}
	// upgrader
	creeps.push({
		role: 'upgrader',
		init: Path.last(Path.calculate(spawn, paths[nearest_to_controller.id][controller.id]))
	});
	// carrier : source-to-spawn
	creeps.push({
		role: 'carrier',
		init: path.pop(paths[spawn.id][nearest_to_spawn.id]),
		path: path.unshift(paths[nearest_to_spawn.id][spawn.id])
	});
	// carrier : source-to-controller
	creeps.push({
		role: 'carrier',
		init: path.pop(paths[spawn.id][nearest_to_controller.id]),
		path: Path.unshift(paths[nearest_to_controller.id][controller.id])
	});

	// memorize creeps
	Memory.creeps = creeps;

};
