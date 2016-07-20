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
 * Changes an object to something we can store in memory : only its id and position
 *
 * @var object RoomObject
 * @return object { creep, id, x, y }
 */
var toMemoryObject = function(object)
{
	var result = { x: object.pos.x, y: object.pos.y };
	if (object.creep) {
		result.creep = object.name;
	}
	else if (object.id) {
		result.id = object.id;
	}
	return result;
};

/**
 * @param room Room|string
 * @returns StructureController
 */
module.exports.controller = function(room)
{
	//noinspection JSValidateTypes
	return this.get(room, 'controller');
};

/**
 * @param room Room|string
 * @returns Creep|RoomPosition
 */
module.exports.controllerHarvester = function(room)
{
	return this.get(room, 'controller_harvester');
};

/**
 * @param room Room|string
 * @returns string
 */
module.exports.controllerPath = function(room)
{
	return Memory.rooms[(room instanceof Room) ? room.name : room].controller_path;
};

/**
 * @param room Room|string
 * @returns Source
 */
module.exports.controllerSource = function(room)
{
	//noinspection JSValidateTypes
	return this.get(room, 'spawn_source');
};

/**
 * @param room Room|string
 * @returns Creep|RoomPosition
 */
module.exports.controllerUpgrader = function(room)
{
	return this.get(room, 'controller_upgrader');
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
		if (callback.call(thisArg, Game.rooms[key], key, Game.rooms)) break;
	}
};

/**
 * Gets an object from memory (use cache)
 *
 * @param room        Room|string
 * @param object_name string eg controller, controller_source, spawn, spawn_source
 * @return RoomObject|RoomPosition
 */
module.exports.get = function(room, object_name)
{
	var room_name = (room instanceof Room) ? room.name : room;
	if (!rooms[room_name]) {
		rooms[room_name] = {};
	}
	if (!rooms[room_name][object_name]) {
		if (Memory.rooms[room_name][object_name].creep) {
			rooms[room_name][object_name] = Game.creeps[Memory.rooms[room_name][object_name].creep];
		}
		else if (Memory.rooms[room_name][object_name].id) {
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
 * Gets the id of an object
 *
 * @param room        Room|string
 * @param object_name string
 * @returns string
 */
module.exports.getId = function(room, object_name)
{
	var room_name = (room instanceof Room) ? room.name : room;
	return Memory.rooms[room_name][object_name].id;
};

/**
 * Gets the position (x, y only) where the object is assigned to
 *
 * @param room        Room|string
 * @param object_name string
 * @return {{ x: number, y: number }}
 */
module.exports.getPos = function(room, object_name)
{
	var room_name = (room instanceof Room) ? room.name : room;
	return Memory.rooms[room_name][object_name];
};

/**
 * Gets the planned role of a creep
 *
 * @param room
 * @param object_name
 */
module.exports.getRole = function(room, object_name)
{
	var room_name = (room instanceof Room) ? room.name : room;
	return Memory.rooms[room_name][object_name].role;
};

/**
 * Gets the room position where the object is assigned to
 *
 * @param room        Room|string
 * @param object_name string
 * @return RoomPosition
 */
module.exports.getRoomPosition = function(room, object_name)
{
	if (!(room instanceof Room)) room = Game.rooms[room];
	var pos = this.getPos(room, object_name);
	return room.getPositionAt(pos.x, pos.y);
};

/**
 * @param room        Room|string
 * @param object_name string
 * @returns boolean
 */
module.exports.has = function(room, object_name)
{
	var room_name = (room instanceof Room) ? room.name : room;
	return (Memory.rooms[room_name][object_name] && Memory.rooms[room_name][object_name].creep) ? true : false;
};

/**
 * Returns true if rooms is memorized
 *
 * @returns boolean
 */
module.exports.memorized = function()
{
	return Memory.rooms !== undefined;
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
				memory.spawn_path      = Path.calculateTwoWay(cache.spawn_source, cache.spawn, { range: 1 });
				memory.spawn_harvester = Path.start(memory.spawn_path);
				cache.spawn_harvester  = Path.toRoomPosition(memory.spawn_harvester);
				memory.spawn_harvester.role = 'harvester';
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
						Path.calculate(cache.spawn_harvester, cache.controller, { range: 2 }), memory.controller_harvester
					);
				}
				// controller source is another one than the spawn source
				else {
					memory.controller_path      = Path.calculate(cache.controller_source, cache.controller, { range: 2 });
					memory.controller_harvester = Path.start(memory.controller_path);
					cache.controller_harvester  = Path.toRoomPosition(memory.controller_harvester);
					memory.controller_harvester.role = 'harvester';
				}
				memory.controller_upgrader = Path.last(memory.controller_path);
				cache.controller_upgrader  = Path.toRoomPosition(memory.controller_upgrader);
				memory.controller_upgrader.role = 'upgrader';
			}
			// remove creeps position from paths (paths are here for carriers needs
			memory.spawn_path      = Path.unshift(memory.spawn_path);
			memory.controller_path = Path.calculateTwoWay(cache.controller_harvester, cache.controller_upgrader, { range: 1 });
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
 * @param object RoomObject|RoomPosition|string an object or object id
 * @return string|null
 */
module.exports.nameOf = function(object)
{
	if (typeof object == 'string')      object = Game.getObjectById(object);
	if (object instanceof RoomObject)   return object.room.name;
	if (object instanceof RoomPosition) return object.roomName;
	return null;
};

/**
 * @param object RoomObject|RoomPosition|string an object or object id
 * @return Room
 */
module.exports.of = function(object)
{
	if (typeof object == 'string')      object = Game.getObjectById(object);
	if (object instanceof RoomObject)   return object.room;
	if (object instanceof RoomPosition) return Game.rooms[object.roomName];
	return null;
};

/**
 * Sets a creep object
 *
 * @param room        Room|string
 * @param object_name string @values controller_harvester, controller_upgrader, spawn_harvester
 * @param creep       Creep
 */
module.exports.setCreep = function(room, object_name, creep)
{
	var room_name = (room instanceof Room) ? room.name : room;
	Memory.rooms[room_name][object_name].creep = creep.name;
	rooms[room_name][object_name] = creep;
};

/**
 * @param room Room|string
 * @returns StructureSpawn
 */
module.exports.spawn = function(room)
{
	//noinspection JSValidateTypes
	return this.get(room, 'spawn');
};

/**
 * @param room Room|string
 * @returns Creep|RoomPosition
 */
module.exports.spawnHarvester = function(room)
{
	return this.get(room, 'spawn_harvester');
};

/**
 * @param room Room|string
 * @returns string
 */
module.exports.spawnPath = function(room)
{
	return Memory.rooms[(room instanceof Room) ? room.name : room].spawn_path;
};

/**
 * @param room Room|string
 * @returns Source
 */
module.exports.spawnSource = function(room)
{
	//noinspection JSValidateTypes
	return this.get(room, 'spawn_source');
};
