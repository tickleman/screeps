
module.exports.__proto__ = require('creep.harvester');

/**
 * Body parts for a heavy harvester
 * MOVE, WORK x 9, consume 550 energy units
 */
module.exports.body_parts = [MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK];

/**
 * Fill returns always false (no carry part : energy is thrown on the ground)
 *
 * @param creep Creep
 **/
module.exports.fill = function(creep)
{
	var source = Game.getObjectById(creep.memory.source);
	if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
		creep.moveTo(source);
	}
	return false;
};
