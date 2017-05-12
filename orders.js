/**
 * Give orders to you creeps using flags
 */

let creep = require('./creep');

/**
 * @param flag Flag
 * @returns boolean true if was an order, else false
 */
module.exports.give = function(flag)
{
	let order = true;
	if (flag.name.substr(0, 5) === 'step=') {
		let closest_creep = flag.pos.findClosestByRange(FIND_MY_CREEPS);
		if (closest_creep) {
			creep.nextStep(closest_creep, flag.name.substr(5));
			this.log(closest_creep, flag.name);
		}
	}
	else {
		order = false;
	}
	if (order) flag.remove();
	return order;
};

/**
 * @param object RoomObject
 * @param order  string
 */
module.exports.log = function(object, order)
{
	console.log('> ORDER', object, order);
};
