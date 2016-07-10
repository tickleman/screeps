
var carrier   = require('creep.carrier.light');
var harvester = require('creep.harvester.heavy');
var upgrader  = require('creep.upgrader');
var sources   = require('sources');

/**
 * The specialization phase :
 * - spawns an unique heavy harvester per source
 * - spawns carriers that will carry energy from harvesters to the spawner / extensions / upgraders
 * - spawns specialized upgraders, depending on carriers speed (begin with one unique)
 */
module.exports.run = function()
{
	var creeps = _.filter(Game.creeps, creep => (
		(creep.memory.role == 'carrier') || (creep.memory.role == 'harvester') || (creep.memory.role == 'upgrader')
	));
	var count = { carrier: 0, harvester: 0, upgrader: 0 };

	// make creeps work, and count them
	for (var name in creeps) {
		var creep = creeps[name];
		if (creep.memory.role == 'carrier')   carrier.work(creep);
		if (creep.memory.role == 'harvester') harvester.work(creep);
		if (creep.memory.role == 'upgrader')  upgrader.work(creep);
		count[creep.memory.role] ++;
	}

	// priority : 1 harvester
	if (!count['harvester']) {
		harvester.spawn();
	}
	// then : 1 carrier
	else if (!count['carrier']) {
		carrier.spawn();
	}
	// then : 1 upgrader
	else if (!count['upgrader']) {
		upgrader.spawn();
	}
	// then : 1 builder per construction site, if needed
	else {
		var construction_sites = Game.spawns.Spawn.room.find(FIND_CONSTRUCTION_SITES);
		if (count['builder'] < construction_sites.length) {
			builder.spawn(Game.spawns.Spawn.room.find(FIND_CONSTRUCTION_SITES)[count['builder']].id);
		}
	}

};
