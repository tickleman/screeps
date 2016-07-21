
/**
 * @param context RoomObject|RoomPosition
 * @param target RoomObject|RoomPosition|string|number
 * @return RoomObject|RoomPosition|null
 */
module.exports.get = function(context, target)
{
	// already a room object or position
	if ((target instanceof RoomObject) || (target instanceof RoomPosition)) {
		return target;
	}
	// a number : may be some kind of FIND_RESOURCE, FIND_STRUCTURE, or what
	if (!isNaN(target)) {
		if (context instanceof RoomObject) context = context.pos;
		let object = context.findClosestByRange(target);
		if (object instanceof RoomObject) {
			return object;
		}
	}
	// a 24 characters long string : it is probably an id
	if (target.length == 24) {
		let object = Game.getObjectById(target);
		if (object instanceof RoomObject) {
			return object;
		}
	}
	// the name of a creep ?
	if (Game.creeps[target]) {
		return Game.creeps[target];
	}
	// the name of a flag ?
	if (Game.flags[target]) {
		return Game.flags[target];
	}
	// the name of a spawn ?
	if (Game.spawns[target]) {
		return Game.spawns[target];
	}
	return null;
};
