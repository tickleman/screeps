/**
 * Room preparation. Call these, one after each other :
 * - prepareSourcesToSpawn
 * - prepareSourcesToController
 * - prepareSpawnToSources
 * - prepareCreeps
 */

var Path = require('./path');

module.exports.room = Game.spawns.Spawn.room;

/**
 * Init
 */
module.exports.init = function()
{
	if (!this.controller && !this.sources) {
		this.controller = null;
		this.sources    = this.room.find(FIND_SOURCES_ACTIVE);
		for (let structure of this.room.find(FIND_STRUCTURES)) {
			if      (structure.structureType == STRUCTURE_CONTROLLER)  this.controller = structure;
			else if (structure.structureType === STRUCTURE_SPAWN)      this.spawn      = structure;
		}
	}

	if (!Memory.room)       Memory.room = {};
	if (!Memory.room.paths) Memory.room.paths = {};

	if (Memory.room.nearest_to_controller && !this.nearest_to_controller) {
		this.nearest_to_controller = Game.getObjectById(Memory.room.nearest_to_controller);
	}
	if (Memory.room.nearest_to_spawn && !this.nearest_to_spawn) {
		this.nearest_to_spawn = Game.getObjectById(Memory.room.nearest_to_spawn);
		console.log('- load nearest_to_spawn ' + Memory.room.nearest_to_spawn);
	}
};

/**
 * Prepare everything (beware of your cpu !)
 */
module.exports.prepare = function()
{
	Memory.room = {};
	this.init();
	this.prepareSourcesToSpawn();
	this.prepareSourcesToController();
	this.prepareSpawnToSources();
	this.prepareCreeps();
};

/**
 * Prepare creeps
 */
module.exports.prepareCreeps = function()
{
	this.init();
	var creeps = [];

	// harvester : source-to-spawn
	creeps.push({
		role: 'harvester',
		init: Memory.room.paths[this.spawn.id][this.nearest_to_spawn.id]
	});
	// harvester : source-to-controller (if not the same)
	if (this.nearest_to_spawn.id != this.nearest_to_controller.id) {
		creeps.push({
			role: 'harvester',
			init: Memory.room.paths[this.spawn.id][this.nearest_to_controller.id]
		});
	}
	// upgrader
	console.log('- ' + this.spawn.pos.x + ', ' + this.spawn.pos.y + ' @ ' + this.spawn.pos.roomName);
	var way = Path.waypointRoomPosition(Memory.room.paths[this.nearest_to_controller.id][this.controller.id]);
	console.log('- ' + way.x + ', ' + way.y + ' @ ' + way.roomName);
	creeps.push({
		role: 'upgrader',
		init: Path.calculate(
			this.spawn, Path.waypointRoomPosition(Memory.room.paths[this.nearest_to_controller.id][this.controller.id])
		)
	});
	// carrier : source-to-spawn
	creeps.push({
		role: 'carrier',
		init: Path.calculate(
			this.spawn, Path.startRoomPosition(Memory.room.paths[this.nearest_to_spawn.id][this.spawn.id])
		),
		path: Path.unshift(Memory.room.paths[this.nearest_to_spawn.id][this.spawn.id])
	});
	// carrier : source-to-controller
	creeps.push({
		role: 'carrier',
		init: Path.calculate(
			this.spawn, Path.startRoomPosition(Memory.room.paths[this.nearest_to_controller.id][this.controller.id])
		),
		path: Path.unshift(Memory.room.paths[this.nearest_to_controller.id][this.controller.id])
	});

	// memorize creeps as tasks
	Memory.tasks = creeps;
};

/**
 * Sources to controller (upgrader position) : the nearest too
 */
module.exports.prepareSourcesToController = function()
{
	this.init();
	var nearest_to_controller = null;
	var nearest_distance = 999999;
	var path;
	for (let source of this.sources) {
		path = Path.calculateTwoWay(source, this.controller, 3);
		Path.unshift(path);
		if (!Memory.room.paths[source.id]) Memory.room.paths[source.id] = {};
		Memory.room.paths[source.id][this.controller.id] = path;
		console.log('source ' + source.id + ' to controller ' + this.controller.id + ' = ' + Path.length(path));
		if (!nearest_to_controller || (path.length < nearest_distance)) {
			nearest_distance      = path.length;
			nearest_to_controller = source;
		}
	}
	Memory.room.nearest_to_controller = nearest_to_controller.id;
};

/**
 * Sources to spawn (harvester position) : keep only the nearest
 */
module.exports.prepareSourcesToSpawn = function()
{
	this.init();
	var nearest_to_spawn = null;
	var nearest_distance = 999999;
	var path;
	for (let source of this.sources) {
		path = Path.calculateTwoWay(source, this.spawn, 1);
		Path.unshift(path);
		if (!Memory.room.paths[source.id]) Memory.room.paths[source.id] = {};
		Memory.room.paths[source.id][this.spawn.id] = path;
		console.log('source ' + source.id + ' to spawn ' + this.spawn.id + ' = ' + Path.length(path));
		if (!nearest_to_spawn || (path.length < nearest_distance)) {
			nearest_distance = path.length;
			nearest_to_spawn = source;
		}
	}
	Memory.room.nearest_to_spawn = nearest_to_spawn.id;
};

/**
 * Spawn to sources (harvester position)
 */
module.exports.prepareSpawnToSources = function()
{
	this.init();
	console.log(this.nearest_to_spawn);
	var path;
	path = Path.calculate(this.spawn, this.nearest_to_spawn, 1);
	if (!Memory.room.paths[this.spawn.id]) Memory.room.paths[this.spawn.id] = {};
	Memory.room.paths[this.spawn.id][this.nearest_to_spawn.id] = path;
	console.log('spawn ' + this.spawn.id + ' to spawn source ' + this.nearest_to_spawn.id + ' = ' + Path.length(path));
	if (this.nearest_to_controller.id !== this.nearest_to_spawn.id) {
		path = Path.calculate(this.spawn, this.nearest_to_controller, 1);
		Memory.room.paths[this.spawn.id][this.nearest_to_controller.id] = path;
		console.log(
			'spawn ' + this.spawn.id + ' to controller source ' + this.nearest_to_controller.id + ' = ' + Path.length(path)
		);
	}
};
