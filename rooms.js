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

module.exports.MEMORY = 'MEMORY';

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
 * @param [property]  string if set, the property to read from memory
 * @return RoomObject|RoomPosition
 */
module.exports.get = function(room, object_name, property)
{
	var room_name = (room instanceof Room) ? room.name : room;
	if (property == this.MEMORY) {
		return Memory.rooms[room_name][object_name];
	}
	if (property) {
		return Memory.rooms[room_name][object_name][property];
	}

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
 * Gets the position (x, y only) where the object is assigned to
 *
 * @param room        Room|string
 * @param object_name string
 * @returns {{ x: number, y: number }}
 */
module.exports.getPos = function(room, object_name)
{
	var room_name = (room instanceof Room) ? room.name : room;
	var pos = Memory.rooms[room_name][object_name];
	if (pos.path && ((pos.x === undefined) || (pos.y === undefined))) pos = Path.start(pos.path);
	return pos;
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
 * Returns true if the room has an existing creep affected to the object name
 *
 * @param room        Room|string
 * @param object_name string @example spawn_harvester
 * @returns boolean
 */
module.exports.has = function(room, object_name)
{
	var room_name = (room instanceof Room) ? room.name : room;
	return (Memory.rooms[room_name][object_name] && Memory.rooms[room_name][object_name].creep) ? true : false;
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
	if (reset ||!Memory.rooms) {
		Memory.rooms = {};
	}
	// memorize new rooms
	this.forEach(function(room) {
		Path.room = room;
		if (!Memory.rooms[room.name]) {
			let save_cost = Path.cost(1, 1, 1);
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
				cache.spawn_source            = cache.spawn.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
				memory.spawn_source           = toMemoryObject(cache.spawn_source);
				memory.spawn_carrier          = { path: Path.calculate(cache.spawn_source, cache.spawn, { range: 1 }) };
				memory.spawn_harvester        = Path.start(memory.spawn_carrier.path);
				memory.spawn_harvester.role   = 'harvester';
				memory.spawn_harvester.source = memory.spawn_source.id;
				cache.spawn_harvester         = Path.toRoomPosition(memory.spawn_harvester);
			}
			// controller information
			if (cache.controller) {
				cache.controller_source  = cache.controller.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
				memory.controller_source = toMemoryObject(cache.controller_source);
				// controller source is the same than spawn source
				if (cache.controller_source.id == cache.spawn_source.id) {
					cache.controller_harvester  = cache.spawn_harvester;
					memory.controller_harvester = memory.spawn_harvester;
					memory.controller_carrier = {
						path: Path.shift(
							Path.calculate(cache.spawn_harvester, cache.controller, { range: 2 }), memory.controller_harvester
						)
					};
				}
				// controller source is another one than the spawn source
				else {
					memory.controller_carrier =  {
						path: Path.calculate(cache.controller_source, cache.controller, { range: 2 })
					};
					memory.controller_harvester = Path.start(memory.controller_carrier.path);
					cache.controller_harvester  = Path.toRoomPosition(memory.controller_harvester);
				}
				memory.controller_harvester.role   = 'harvester';
				memory.controller_harvester.source = memory.controller_source.id;
				memory.controller_upgrader = Path.last(memory.controller_carrier.path);
				cache.controller_upgrader  = Path.toRoomPosition(memory.controller_upgrader);
				memory.controller_upgrader.role = 'upgrader';
			}

			// finalise carriers : remove creeps position from carriers paths
			memory.spawn_carrier = {
				path:   Path.calculateTwoWay(cache.spawn_harvester, cache.spawn, { range : 1 }),
				role:   'carrier',
				source: FIND_DROPPED_ENERGY,
				target: STRUCTURE_SPAWN
			};
			memory.controller_carrier = {
				path:   Path.calculateTwoWay(cache.controller_harvester, cache.controller_upgrader, {range: 1}),
				role:   'carrier',
				source: FIND_DROPPED_ENERGY,
				target: STRUCTURE_CONTROLLER
			};

			rooms[room.name]        = cache;
			Memory.rooms[room.name] = memory;
			Path.cost(save_cost);
		}
	});
	// re-affect existing creeps
	if (reset) {
		for (let creep_name in Game.creeps) if (Game.creeps.hasOwnProperty(creep_name)) {
			let creep = Memory.creeps[creep_name];
			if (creep.room && creep.room_role) {
				Memory.rooms[creep.room][creep.room_role].creep = creep_name;
			}
		}
	}
	// remove lost rooms
	for (let room_name in Memory.rooms) if (Memory.rooms.hasOwnProperty(room_name)) {
		if (!Game.rooms[room_name]) {
			delete Memory.rooms[room_name];
		}
	}
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
 * Returns the name of the room where the RoomObject / RoomPosition / object id is
 *
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
 * Returns the room where the RoomObject / RoomPosition / object id is
 *
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
