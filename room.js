
var Path = require('./path');

module.exports.room = Game.spawns.Spawn.room;

/**
 * Prepare routes and store them into memory
 */
module.exports.prepareRoutes = function()
{
	var controller = null;
	var spawn      = null;
	var sources    = this.room.find(FIND_SOURCES_ACTIVE);
	for (let structure of this.room.find(FIND_STRUCTURES)) {
		if (structure.structureType === STRUCTURE_SPAWN) {
			spawn = structure;
		}
		else if (structure.structureType == STRUCTURE_CONTROLLER) {
			controller = structure;
		}
	}

	var nearest_distance;
	var paths = {};
	var path;

	// sources to spawn : keep only the nearest
	var nearest_to_spawn = null;
	nearest_distance = 999999;
	for (let source of sources) {
		path = Path.calculateTwoWay(source, spawn);
		path.splice(0, 1);
		path.splice(-1);
		paths[source.id] = {};
		paths[source.id][spawn.id] = path;
		console.log('source ' + source.id + ' to spawn ' + spawn.id + ' = ' + path.length);
		if (!nearest_to_spawn || (paths.length < nearest_distance)) {
			nearest_distance = paths.length;
			nearest_to_spawn = source;
		}
	}

	// sources to upgrader : the nearest too
	var nearest_to_controller = null;
	nearest_distance = 999999;
	for (let source of sources) {
		path = Path.calculateTwoWay(source, controller, 1);
		path.splice(0, 1);
		path.splice(-1);
		paths[source.id][controller.id] = path;
		console.log('source ' + source.id + ' to controller ' + controller.id + ' = ' + path.length);
		if (!nearest_to_controller || (paths.length < nearest_distance)) {
			nearest_distance      = paths.length;
			nearest_to_controller = source;
		}
	}

	// spawn to sources
	{
		path = Path.calculate(spawn, nearest_to_spawn);
		paths[spawn.id] = {};
		paths[spawn.id][nearest_to_spawn.id] = path;
		console.log('spawn ' + spawn.id + ' to spawn source ' + nearest_to_spawn.id + ' = ' + path.length);
		if (nearest_to_controller.id !== nearest_to_spawn.id) {
			path = Path.calculate(spawn, nearest_to_controller);
			console.log('spawn ' + spawn.id + ' to controller source ' + nearest_to_controller.id + ' = ' + path.length);
			paths[spawn.id][nearest_to_controller.id] = path;
		}
	}

	// memorize routes
	Memory.routes = {};
	Memory.routes[spawn.id] = {};
	for (let source of sources) {
		Memory.routes[source.id] = {};
	}

	console.log('controller = ' + controller.id);
	console.log('nearest_to_controller = ' + nearest_to_controller.id);
	console.log('nearest_to_spawn = ' + nearest_to_spawn.id);
	console.log('spawn = ' + spawn.id);

	Memory.routes[nearest_to_spawn.id][spawn.id]           = paths[nearest_to_spawn.id][spawn.id];
	Memory.routes[nearest_to_controller.id][controller.id] = paths[nearest_to_controller.id][controller.id];
	Memory.routes[spawn.id][nearest_to_spawn.id]           = paths[spawn.id][nearest_to_spawn.id];
	Memory.routes[spawn.id][nearest_to_controller.id]      = paths[spawn.id][nearest_to_controller.id];
};
