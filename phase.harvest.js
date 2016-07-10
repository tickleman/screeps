
var builder   = require('creep.builder');
var harvester = require('creep.harvester');
var upgrader  = require('creep.upgrader');
var sources   = require('sources');

/**
 * The harvest phase :
 * - needs at least initialized sources (phase.start)
 * - spawn harvesters and upgraders until all the sources access terrains capacity is used
 * - harvesters work on sources and bring the energy back to the spawn
 * - upgraders work on sources and bring the energy to the room controller
 *
 * TODO Phase specialization if 5 built and filled-in extensions
 */
module.exports.run = function()
{
	var creeps = _.filter(Game.creeps, creep => (
		(creep.memory.role == 'builder') || (creep.memory.role == 'harvester') || (creep.memory.role == 'upgrader')
	));
	var count = { builder: 0, harvester: 0, upgrader: 0 };

	// make creeps work, and count them
	for (var name in creeps) {
		var creep = creeps[name];
		if (creep.memory.role == 'builder')   builder.work(creep);
		if (creep.memory.role == 'harvester') harvester.work(creep);
		if (creep.memory.role == 'upgrader')  upgrader.work(creep);
		count[creep.memory.role] ++;
	}

	// priority : 2 harvesters
	if (count['harvester'] < Math.min(sources.terrainsCount(), 2)) {
		harvester.spawn();
	}

	else {

		// if there are construction sites : builders : 1 per construction site
		var construction_sites = Game.spawns.Spawn.room.find(FIND_CONSTRUCTION_SITES);
		if (count['builder'] < construction_sites.length) {
			builder.spawn(Game.spawns.Spawn.room.find(FIND_CONSTRUCTION_SITES)[count['builder']].id);
		}

		// and last, upgraders : at least 1, more if they are not replaced by builders
		else {
			// if there is no construction sites : 1.5x more upgraders than free construction sites
			var more_upgraders = !construction_sites.length ? 1.5 : 1;
			var need_upgraders = Math.max(1, sources.terrainsCount() - count['harvester'] - count['builder']) * more_upgraders;
			if (count['upgrader'] < need_upgraders) {
				upgrader.spawn();
			}
			else {

				// if there is at least 1 harvester and 1 upgrader, and if there are 5 filled in extensions : next phase
				var extensions = Game.spawns.Spawn.room.find(FIND_MY_STRUCTURES, { filter: structure =>
					(structure.structureType == STRUCTURE_EXTENSION)
					&& (structure.energy == structure.energyCapacity)
				});
				if (extensions.length >= 5) {
					Memory.phase = 'specialization';
				}
			}
		}

	}
};
