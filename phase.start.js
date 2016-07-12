
var harvester = require('./creep.harvester');
var sources   = require('./sources');

/**
 * Initial start phase :
 * Create the first creep : a harvest that will work at the nearest source
 */
module.exports.run = function()
{
	if (Game.spawns.Spawn) {
		if (!_.filter(Game.creeps).length) {
			harvester.spawn(undefined, undefined, undefined, 'Dawn');
		}
		Memory.phase = 'harvest';
	}
};
