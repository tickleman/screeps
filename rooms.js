/**
 * Functions on Game.rooms
 */

var Path = require('./path');

module.exports =
{

	/**
	 * @returns number
	 */
	get length()
	{
		if (this.length_ == undefined) {
			this.length_ = Object.keys(Game.rooms).length;
		}
		return this.length_;
	}

};

/**
 * Rooms cache (filled-in from memory only when needed)
 */
var rooms = {};

/**
 * Gets an object from memory (use cache)
 *
 * @param room_name   string
 * @param object_name string eg controller, controller_source, spawn, spawn_source
 * @return RoomObject|RoomPosition
 */
var fromMemory = function(room_name, object_name)
{
	if (!rooms[room_name]) {
		rooms[room_name] = {};
	}
	if (!rooms[room_name][object_name]) {
		if (Memory.rooms[room_name][object_name].id) {
			rooms[room_name][object_name] = Game.getObjectById(Memory.rooms[room_name][object_name].id);
		}
		else {
			rooms[room_name][object_name] = Game.rooms[room_name].getPositionAt(
				Memory.rooms[room_name][object_name].x,
				Memory.rooms[room_name][object_name].y
			);
		}
	}
	return rooms[room_name][object_name];
};

/**
 * Changes an object to something we can store in memory : only its id and position
 *
 * @var object RoomObject
 * @return object { id, x, y }
 */
var toMemoryObject = function(object)
{
	return { id : object.id, x: object.pos.x, y: object.pos.y };
};

/**
 * @param room_name string
 * @returns StructureController
 */
module.exports.controller = function(room_name)
{
	//noinspection JSValidateTypes
	return fromMemory(room_name, 'controller');
};

/**
 * @param room_name
 * @returns Creep|RoomPosition
 */
module.exports.controllerHarvester = function(room_name)
{
	return fromMemory(room_name, 'controller_harvester');
};

/**
 * @param room_name
 * @returns string
 */
module.exports.controllerPath = function(room_name)
{
	return Memory.rooms[room_name].controller_path;
};

/**
 * @param room_name string
 * @returns Source
 */
module.exports.controllerSource = function(room_name)
{
	//noinspection JSValidateTypes
	return fromMemory(room_name, 'spawn_source');
};

/**
 * @param room_name string
 * @returns Creep|RoomPosition
 */
module.exports.controllerUpgrader = function(room_name)
{
	return fromMemory(room_name, 'controller_upgrader');
};

/**
 * @param callback callable
 * @returns Creep[]
 */
module.exports.filter = function(callback)
{
	return _.filter(Game.rooms, callback);
};

/**
 * @param callback
 * @param [thisArg] object
 */
module.exports.forEach = function(callback, thisArg)
{
	if (thisArg == undefined) thisArg = this;
	for (var key in Game.rooms) if (Game.rooms.hasOwnProperty(key)) {
		callback.call(thisArg, Game.rooms[key], key, Game.rooms);
	}
};

/**
 * Refresh rooms memory :
 * - get new rooms main information
 * - remove lost rooms
 *
 * @param reset boolean if true, resets all rooms data (use this when you build a new structure in a room)
 */
module.exports.memorize = function(reset)
{
	var save_cost = Path.cost(1, 1, 1);
	if (reset ||!Memory.rooms) {
		Memory.rooms = {};
	}
	// memorize new rooms
	this.forEach(function(room) {
		Path.room = room;
		if (!Memory.rooms[room.name]) {
			let cache  = {};
			let memory = {};
			room.find(FIND_MY_STRUCTURES).forEach(function(structure) {
				switch (structure.structureType) {
					case STRUCTURE_CONTROLLER: memory.controller = toMemoryObject(cache.controller = structure); break;
					case STRUCTURE_SPAWN:      memory.spawn      = toMemoryObject(cache.spawn = structure);      break;
				}
			});
			// spawn information
			if (cache.spawn) {
				cache.spawn_source     = cache.spawn.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
				memory.spawn_source    = toMemoryObject(cache.spawn_source);
				memory.spawn_path      = Path.calculateTwoWay(cache.spawn_source, cache.spawn, 1);
				memory.spawn_harvester = Path.start(memory.spawn_path);
				cache.spawn_harvester  = Path.toRoomPosition(memory.spawn_harvester);
			}
			// controller information
			if (cache.controller) {
				cache.controller_source  = cache.controller.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
				memory.controller_source = toMemoryObject(cache.controller_source);
				// controller source is the same than spawn source
				if (cache.controller_source.id == cache.spawn_source.id) {
					cache.controller_harvester  = cache.spawn_harvester;
					memory.controller_harvester = memory.spawn_harvester;
					memory.controller_path = Path.shift(
						Path.calculate(cache.spawn_harvester, cache.controller, 2), memory.controller_harvester
					);
				}
				// controller source is another one than the spawn source
				else {
					memory.controller_path      = Path.calculate(cache.controller_source, cache.controller, 2);
					memory.controller_harvester = Path.start(memory.controller_path);
					cache.controller_harvester  = Path.toRoomPosition(memory.controller_harvester);
				}
				memory.controller_upgrader = Path.last(memory.controller_path);
				cache.controller_upgrader  = Path.toRoomPosition(memory.controller_upgrader);
			}
			// remove creeps position from paths (paths are here for carriers needs
			memory.spawn_path      = Path.unshift(memory.spawn_path);
			memory.controller_path = Path.calculateTwoWay(cache.controller_harvester, cache.controller_upgrader, 1);
			rooms[room.name]        = cache;
			Memory.rooms[room.name] = memory;
		}
	});
	// remove lost rooms
	for (let room_name in Memory.rooms) if (Memory.rooms.hasOwnProperty(room_name)) {
		if (!Game.rooms[room_name]) {
			delete Memory.rooms[room_name];
		}
	}
	Path.cost(save_cost);
};

/**
 * @param room_name string
 * @returns StructureSpawn
 */
module.exports.spawn = function(room_name)
{
	//noinspection JSValidateTypes
	return fromMemory(room_name, 'spawn');
};

/**
 * @param room_name
 * @returns Creep|RoomPosition
 */
module.exports.spawnHarvester = function(room_name)
{
	return fromMemory(room_name, 'spawn_harvester');
};

/**
 * @param room_name
 * @returns string
 */
module.exports.spawnPath = function(room_name)
{
	return Memory.rooms[room_name].spawn_path;
};

/**
 * @param room_name string
 * @returns Source
 */
module.exports.spawnSource = function(room_name)
{
	//noinspection JSValidateTypes
	return fromMemory(room_name, 'spawn_source');
};
