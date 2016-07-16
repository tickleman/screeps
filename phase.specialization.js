
var builder   = require('./creep.builder.heavy');
var carrier   = require('./creep.carrier.fast');
var harvester = require('./creep.harvester.heavy');
var repairer  = require('./creep.repairer');
var upgrader  = require('./creep.upgrader.heavy');

/**
 * The specialization phase :
 * - spawns an unique heavy harvester per source
 * - spawns carriers that will carry energy from harvesters to the spawner / extensions / upgraders
 * - spawns specialized upgraders, depending on carriers speed (begin with one unique)
 */
module.exports.run = function()
{
	var creeps = _.filter(Game.creeps, creep => (
		(creep.memory.role == 'builder')
		|| (creep.memory.role == 'carrier')
		|| (creep.memory.role == 'harvester')
		|| (creep.memory.role == 'repairer')
		|| (creep.memory.role == 'upgrader')
	));
	var count = { builder: 0, carrier: 0, harvester: 0, repairer: 0, upgrader: 0 };

	// make creeps work, and count them
	for (let creep of creeps) {
		if      (creep.memory.role == 'builder')   builder.work(creep);
		else if (creep.memory.role == 'carrier')   carrier.work(creep);
		else if (creep.memory.role == 'harvester') harvester.work(creep);
		else if (creep.memory.role == 'repairer')  repairer.work(creep);
		else if (creep.memory.role == 'upgrader')  upgrader.work(creep);
		// don't count initial builders / harvesters
		count[creep.memory.role]++;
	}

	// priority : 1 heavy harvester
	if (!count['harvester']) {
		// if there is not enough energy, we need one light harvester :
		// - cost 250 energy units only instead of 550
		// - harvests 4 energy units per tick instead of 10
		if (!count['harvester'] && (Game.spawns.Spawn.room.energyAvailable < 550)) {
			harvester.body_parts = (Game.spawns.Spawn.room.energyAvailable >= 250)
				? [MOVE, WORK, WORK]
				: [MOVE, WORK];
		}
		harvester.spawn();
	}
	// then : 2 light carriers
	else if (count['carrier'] < 2) {
		// if there is not enough energy, we need one light carrier :
		// - costs 300 energy units only instead of 550
		// - moves 150 energy units per tick instead of 250
		if (!count['carrier'] && (Game.spawns.Spawn.room.energyAvailable < 550)) {
			carrier.body_parts = (Game.spawns.Spawn.room.energyAvailable >= 300)
				? [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]
				: [CARRY, MOVE];
		}
		carrier.spawn();
	}
	// then : 1 repairer (if needed)
	else if (!count['repairer'] && repairer.targets().length) {
		repairer.spawn();
	}
	// then : 1 builder per construction site, if needed (limit to 2)
	else if ((count['builder'] < 2) && (count['builder'] < builder.targets().length)) {
		builder.spawn();
	}
	// then : 1 standard upgrader
	else if (!count['upgrader']) {
		upgrader.spawn();
	}

};
