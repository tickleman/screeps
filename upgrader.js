
var harvester = require('harvester');

module.exports = require('creep');

/**
 * Simple upgraders work like harvesters : their target are the main room controller
 */
module.exports.spawn = function()
{
	return harvester.spawn('upgrader', Game.spawns.Spawn.room.controller.id);
};

/**
 * @param creep Creep
 **/
module.exports.work = function(creep)
{
	if (!this.fill(creep)) {
		var controller = Game.getObjectById(creep.memory.target);
		if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
			creep.moveTo(controller);
		}
	}
};
