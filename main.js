var myCreep       = require('my.creep');
var roleBuilder   = require('role.builder');
var roleHarvester = require('role.harvester');
var roleRepairer  = require('role.repairer');
var roleUpgrader  = require('role.upgrader');
var spawner       = require('my.spawner');
var tower         = require('tower');

module.exports.loop = function ()
{
	if (_.filter(Game.creeps, (creep) => true).length < spawner.population) {
	spawner.autoSpawn();
}

	for (var name in Game.creeps) {
		var creep = Game.creeps[name];
		if (!myCreep.fill(creep, creep.memory.role == 'repairer')) {
			if (
				(creep.memory.role == 'builder'   && !roleBuilder.run(creep))
				|| (creep.memory.role == 'harvester' && !roleHarvester.run(creep))
				|| (creep.memory.role == 'repairer'  && !roleRepairer.run(creep))
				|| (creep.memory.role == 'upgrader'  && !roleUpgrader.run(creep))
			) {
				spawner.findWork(creep);
			}
		}
	}

	for (var structure_id in Game.structures) {
		var structure = Game.structures[structure_id];
		if (structure.structureType == STRUCTURE_TOWER) {
			tower.run(structure);
		}
	}

};
