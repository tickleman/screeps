
var roads   = require('./roads');
var room    = require('./room');
var sources = require('./sources');

/**
 * Initial start phase :
 * Create the first creep : a harvest that will work at the nearest source
 */
module.exports.run = function()
{
	if (!Memory.step) {
		sources.memorize();
		room.prepareSourcesToSpawn();
		Memory.step = 1;
	}
	else if (Memory.step == 1) {
		room.prepareSourcesToController();
		Memory.step = 2;
	}
	else if (Memory.step == 2) {
		room.prepareSpawnToSources();
		Memory.step = 3;
	}
	else if (Memory.step == 3) {
		room.prepareCreeps();
		Memory.step = 4;
	}
	else if (Memory.step == 4) {
		roads.build();
		delete Memory.step;
		Memory.phase = 'harvest';
	}
};
