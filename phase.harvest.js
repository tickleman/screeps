
var builder   = require('builder');
var harvester = require('harvester');
var upgrader  = require('upgrader');
var sources   = require('sources');

/**
 * The harvest phase :
 * - needs at least initialized sources (phase.start)
 * - spawn harvesters and upgraders until all the sources access terrains capacity is used
 * - harvesters work on sources and bring the energy back to the spawn
 * - upgraders work on sources and bring the energy to the room controller
 */
module.exports.run = function()
{
	var count = { builder: 0, harvester: 0, upgrader: 0 };
	var creeps = _.filter(Game.creeps, creep => (
		(creep.memory.role == 'builder') || (creep.memory.role == 'harvester') || (creep.memory.role == 'upgrader')
	));
	for (var name in creeps) {
		var creep = creeps[name];
		if (creep.memory.role == 'harvester') harvester.work(creep);
		if (creep.memory.role == 'upgrader')  upgrader.work(creep);
		count[creep.memory.role] ++;
	}
	if (count['harvester'] < Math.min(sources.terrainsCount(), 2)) {
		harvester.spawn();
	}
	else if (count['upgrader'] < (sources.terrainsCount() - count['harvester']) * 1.5) {
		upgrader.spawn();
	}
	else if (count['builder'] < Game.spawns.Spawn.room.find(FIND_CONSTRUCTION_SITES).length) {
		builder.spawn(Game.spawns.Spawn.room.find(FIND_CONSTRUCTION_SITES)[count['builder']].id);
	}
};
