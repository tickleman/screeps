var Creep = require('creep');

var builder   = require('role.builder');
var harvester = require('role.harvester.simple');
var repairer  = require('role.repairer');
var upgrader  = require('role.upgrader');

module.exports.run = function()
{
	for (var name in Game.creeps) {
		var creep = Game.creeps[name];
		if (!Creep.fill(creep, creep.memory.role == 'repairer')) {
			if (
				   (creep.memory.role == 'builder'   && !builder.run(creep))
				|| (creep.memory.role == 'harvester' && !harvester.run(creep))
				|| (creep.memory.role == 'repairer'  && !repairer.run(creep))
				|| (creep.memory.role == 'upgrader'  && !upgrader.run(creep))
			) {
				//spawner.findWork(creep);
			}
		}
	}
};
