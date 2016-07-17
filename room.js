/**
 * Room preparation. Call these, one after each other :
 * - prepareSourcesToSpawn
 * - prepareSourcesToController
 * - prepareSpawnToSources
 * - prepareCreeps
 */

var Path  = require('./path');
var tasks = require('./tasks');

/**
 * @type boolean
 */
module.exports.DEBUG = true;

/**
 * @type RoomObject
 */
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

	// harvester : source-to-spawn
	tasks.add({
		role: 'harvester',
		init: Memory.room.paths[this.spawn.id][this.nearest_to_spawn.id]
	});
	// harvester : source-to-controller (if not the same)
	if (this.nearest_to_spawn.id != this.nearest_to_controller.id) {
		tasks.add({
			role: 'harvester',
			init: Memory.room.paths[this.spawn.id][this.nearest_to_controller.id]
		});
	}
	// upgrader
	var arrival = Path.lastRoomPosition(Memory.room.paths[this.nearest_to_controller.id][this.controller.id]);
	tasks.add({
		role: 'upgrader',
		init: Path.calculate(this.spawn, arrival)
	});
	// carrier 1 : source-to-spawn
	tasks.add({
		role: 'carrier',
		init: Path.calculate(
			this.spawn, Path.stepRoomPosition(Memory.room.paths[this.nearest_to_spawn.id][this.spawn.id], 1)
		),
		path: Path.calculateTwoWay(
			Path.startRoomPosition(Memory.room.paths[this.nearest_to_spawn.id][this.spawn.id]), this.spawn, 1
		)
	});
	// carrier 2 : source-to-upgrader
	tasks.add({
		role: 'carrier',
		init: Path.calculate(
			this.spawn, Path.stepRoomPosition(Memory.room.paths[this.nearest_to_controller.id][this.controller.id], 1)
		),
		path: Path.calculateTwoWay(
			Path.startRoomPosition(Memory.room.paths[this.nearest_to_controller.id][this.controller.id]),
			Path.lastRoomPosition(Memory.room.paths[this.nearest_to_controller.id][this.controller.id]),
			1
		)
	});
};

/**
 * Sources to controller
 * Start point is the position of the harvester.
 * Arrival point is the position of the upgrader.
 * Carriers will need to unshift + pop.
 */
module.exports.prepareSourcesToController = function()
{
	this.init();
	var nearest_to_controller = null;
	var nearest_distance = 999999;
	var path;
	for (let source of this.sources) {
		if (source.id == this.nearest_to_spawn.id) {
			var start = Path.startRoomPosition(Memory.room.paths[source.id][this.spawn.id]);
			path = Path.shift(Path.calculate(start, this.controller, 2), start);
		}
		else {
			path = Path.calculate(source, this.controller, 2);
		}
		if (!Memory.room.paths[source.id]) Memory.room.paths[source.id] = {};
		Memory.room.paths[source.id][this.controller.id] = path;
		if (this.DEBUG) console.log('source ' + source.id + ' to controller ' + this.controller.id + ' = ' + path);
		if (!nearest_to_controller || (path.length < nearest_distance)) {
			nearest_distance      = path.length;
			nearest_to_controller = source;
		}
	}
	Memory.room.nearest_to_controller = nearest_to_controller.id;
};

/**
 * Sources to spawn
 * Start point is the position of the harvester.
 * Carriers will need to unshift.
 */
module.exports.prepareSourcesToSpawn = function()
{
	this.init();
	var nearest_to_spawn = null;
	var nearest_distance = 999999;
	var path;
	for (let source of this.sources) {
		path = Path.calculate(source, this.spawn, 1);
		if (!Memory.room.paths[source.id]) Memory.room.paths[source.id] = {};
		Memory.room.paths[source.id][this.spawn.id] = path;
		if (this.DEBUG) console.log('source ' + source.id + ' to spawn ' + this.spawn.id + ' = ' + path);
		if (!nearest_to_spawn || (path.length < nearest_distance)) {
			nearest_distance = path.length;
			nearest_to_spawn = source;
		}
	}
	Memory.room.nearest_to_spawn = nearest_to_spawn.id;
};

/**
 * Spawn to sources : from spawn to harvester position
 * Arrival point is the position of the harvester.
 */
module.exports.prepareSpawnToSources = function()
{
	this.init();
	var path;
	path = Path.calculate(this.spawn, Path.startRoomPosition(Memory.room.paths[this.nearest_to_spawn.id][this.spawn.id]));
	if (!Memory.room.paths[this.spawn.id]) Memory.room.paths[this.spawn.id] = {};
	Memory.room.paths[this.spawn.id][this.nearest_to_spawn.id] = path;
	if (this.DEBUG) console.log('spawn ' + this.spawn.id + ' to spawn source ' + this.nearest_to_spawn.id + ' = ' + path);
	if (this.nearest_to_controller.id != this.nearest_to_spawn.id) {
		path = Path.calculate(
			this.spawn, Path.startRoomPosition(Memory.room.paths[this.nearest_to_controller.id][this.spawn.id])
		);
		Memory.room.paths[this.spawn.id][this.nearest_to_controller.id] = path;
		if (this.DEBUG) console.log(
			'spawn ' + this.spawn.id + ' to controller source ' + this.nearest_to_controller.id + ' = ' + path
		);
	}
};
