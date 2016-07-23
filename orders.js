/**
 * Give orders to you creeps using flags
 */

/**
 * @param flag Flag
 */
module.exports.give = function(flag)
{
	if (flag.name.substr(0, 5) == 'step=') {
		let creep = flag.pos.findClosestByRange(FIND_MY_CREEPS);
		if (creep) {
			creep.memory.step = flag.name.substr(5);
			console.log(creep, ' step = ', creep.memory.step);
		}
	}
	flag.remove();
};
