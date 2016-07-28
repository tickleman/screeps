
var objects = require('./objects');

/**
 * Sort targets :
 * - begins with the target nearest from the context
 * - then the target nearest from this target
 * - etc.
 *
 * @param context RoomObject|RoomPosition
 * @param targets RoomObject[]|RoomPosition[]
 * @returns RoomObject[] sorted targets
 */
module.exports.sort = function(context, targets)
{
	let count = Object.keys(targets).length;
	let sorted = [];
	while (count) {
		let nearest_key = this.nearest(context, targets);
		sorted.push(context = targets[nearest_key]);
		delete targets[nearest_key];
		count--;
	}
	return sorted;
};

/**
 * Find the nearest target from the context
 *
 * @param context RoomObject
 * @param targets RoomObject[]|RoomPosition[]
 * @returns {*}
 */
module.exports.nearest = function(context, targets)
{
	let nearest_key   = null;
	let nearest_range = 1000;
	for (let target_key in targets) if (targets.hasOwnProperty(target_key)) {
		let target = targets[target_key];
		let range  = objects.range(context, target);
		if (range < nearest_range) {
			nearest_key   = target_key;
			nearest_range = range;
		}
	}
	return nearest_key;
};
