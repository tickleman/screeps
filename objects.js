
var rooms = require('./rooms');

var cache = {};

/**
 * @param context RoomObject|RoomPosition
 * @param target RoomObject|RoomPosition|string|number
 * @return RoomObject|RoomPosition|null
 */
module.exports.get = function(context, target)
{
	// already a room object or position
	if ((target instanceof RoomObject) || (target instanceof RoomPosition) || !target) {
		return target;
	}
	if (cache[target]) return cache[target];
	if (context instanceof RoomObject) context = context.pos;
	if (cache[context.roomName] && cache[context.roomName][target]) return cache[context.roomName][target];
	// a number : may be some kind of FIND_RESOURCE, FIND_STRUCTURE, or what
	if (!isNaN(target)) {
		let object = context.findClosestByRange(target);
		if (object instanceof RoomObject) {
			return cache[target] = object;
		}
	}
	// a 24 characters long string : it is probably an id
	if (target.length == 24) {
		let object = Game.getObjectById(target);
		if (object instanceof RoomObject) {
			return cache[target] = object;
		}
	}
	// a room role ?
	if (Memory.rooms[context.roomName][target]) {
		if (!cache[context.roomName]) cache[context.roomName] = {};
		return cache[context.roomName][target] = rooms.get(context.roomName, target);
	}
	// the name of a creep ?
	if (Game.creeps[target]) {
		return cache[target] = Game.creeps[target];
	}
	// the name of a flag ?
	if (Game.flags[target]) {
		return cache[target] = Game.flags[target];
	}
	// the name of a spawn ?
	if (Game.spawns[target]) {
		return cache[target] = Game.spawns[target];
	}
	return null;
};
