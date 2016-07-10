
var builder   = require('creep.builder.heavy');
var carrier   = require('creep.carrier.fast');
var harvester = require('creep.harvester.heavy');
var upgrader  = require('creep.upgrader.heavy');
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
		(creep.memory.role == 'builder')
		|| (creep.memory.role == 'carrier')
		|| (creep.memory.role == 'harvester')
		|| (creep.memory.role == 'upgrader')
	));
	var count = { builder: 0, carrier: 0, harvester: 0, upgrader: 0 };

	// make creeps work, and count them
	for (var name in creeps) {
		var creep = creeps[name];
		if      (creep.memory.role == 'builder')   builder.work(creep);
		else if (creep.memory.role == 'carrier')   carrier.work(creep);
		else if (creep.memory.role == 'harvester') harvester.work(creep);
		else if (creep.memory.role == 'upgrader')  upgrader.work(creep);
		// don't count initial builders / harvesters
		if ((creep.body.length > 3) || (creep.memory.role == 'upgrader')) {
			count[creep.memory.role]++;
		}
	}

	// priority : 1 heavy harvester
	if (!count['harvester']) {
		// if there is not enough energy, we need a light harvester :
		// - cost 250 energy units only instead of 550
		// - harvests 4 energy units per tick instead of 10
		if (Game.spawns.Spawn.room.energyAvailable < 550) {
			harvester.body_parts = [MOVE, WORK, WORK];
		}
		harvester.spawn();
	}
	// then : 1 light carrier
	else if (!count['carrier']) {
		// if there is not enough energy, we need a light carrier :
		// - costs 300 energy units only instead of 550
		// - moves 150 energy units per tick instead of 250
		if (Game.spawns.Spawn.room.energyAvailable < 550) {
			carrier.body_parts = [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
		}
		carrier.spawn();
	}
	// then : 1 standard upgrader
	else if (!count['upgrader']) {
		upgrader.spawn();
	}
	// then : 1 builder per construction site, if needed
	else {
		var construction_sites = Game.spawns.Spawn.room.find(FIND_CONSTRUCTION_SITES);
		if (count['builder'] < construction_sites.length) {
			builder.spawn();
		}
	}

};
