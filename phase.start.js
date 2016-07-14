
var roads   = require('./roads');
var room    = require('./room');
var sources = require('./sources');

/**
 * Initial start phase :
 * Prepare fix paths cache
 * Prepare creeps plan
 */
module.exports.run = function()
{
	if (!Memory.phase_step) {
		sources.memorize();
		room.prepareSourcesToSpawn();
		Memory.phase_step = 1;
	}
	else if (Memory.phase_step == 1) {
		room.prepareSourcesToController();
		Memory.phase_step = 2;
	}
	else if (Memory.phase_step == 2) {
		room.prepareSpawnToSources();
		Memory.Memory.phase_step = 3;
	}
	else if (Memory.phase_step == 3) {
		room.prepareCreeps();
		Memory.phase_step = 4;
	}
	else if (Memory.phase_step == 4) {
		roads.build();
		delete Memory.phase_step;
		Memory.phase = 'harvest';
	}
};
