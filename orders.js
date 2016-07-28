/**
 * Give orders to you creeps using flags
 */

var creeps = require('./creeps');

/**
 * @param flag Flag
 */
module.exports.give = function(flag)
{
	let order = true;
	if (flag.name.substr(0, 5) == 'step=') {
		let creep = flag.pos.findClosestByRange(FIND_MY_CREEPS);
		if (creep) {
			creeps.nextStep(creep, flag.name.substr(5));
			this.log(creep, flag.name);
		}
	}
	else {
		order = false;
	}
	if (order) flag.remove();
};

/**
 * @param object RoomObject
 * @param order  string
 */
module.exports.log = function(object, order)
{
	console.log('> ORDER', object, order);
};
