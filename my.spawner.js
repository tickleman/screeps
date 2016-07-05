var roleBuilder   = require('role.builder');
var roleHarvester = require('role.harvester');
var roleRepairer  = require('role.repairer');
var roleUpgrader  = require('role.upgrader');

module.exports =
{

	builders:   1,
	harvesters: 4,
	population: 9,
	repairers:  2,
	upgraders:  2,

	autoSpawn: function()
	{
		// spawn creeps
		if (this.needs('harvester') && roleHarvester.targets(_.filter(Game.creeps)[0]).length) {
			Game.spawns.Spawn.createCreep([WORK, CARRY, MOVE], undefined, { role: 'harvester', source: '576a9c4757110ab231d88cc0' });
		}
		else if (this.needs('repairer') && roleRepairer.targets(_.filter(Game.creeps)[0]).length) {
			Game.spawns.Spawn.createCreep([WORK, CARRY, MOVE], undefined, { role: 'repairer', source: '576a9c4757110ab231d88cc0' });
		}
		else if (this.needs('builder') && roleBuilder.targets(_.filter(Game.creeps)[0]).length) {
			Game.spawns.Spawn.createCreep([WORK, CARRY, MOVE], undefined, { role: 'builder', source: '576a9c4757110ab231d88cbf' });
		}
		else if (this.needs('upgrader')) {
			Game.spawns.Spawn.createCreep([WORK, CARRY, MOVE], undefined, { role: 'upgrader', source: '576a9c4757110ab231d88cc0' });
		}
		// free memory
		for (var creep in Memory.creeps) {
			if (Memory.creeps[creep]._move && !Game.creeps[creep]) {
				delete Memory.creeps[creep];
				console.log('prune creep ' + creep);
			}
		}
	},

	/** @param {Creep} creep **/
	findWork: function(creep)
	{
		// assign creep
		if (this.needs('repairer') && roleRepairer.targets(creep).length) {
			creep.memory.role = 'repairer';
		}
		else if (this.needs('harvester') && roleHarvester.targets(creep).length) {
			creep.memory.role = 'harvester';
		}
		else if (this.needs('builder') && roleBuilder.targets(creep).length) {
			creep.memory.role = 'builder';
		}
		else if (this.needs('upgrader')) {
			creep.memory.role = 'upgrader';
		}
		creep.memory.target = 0;
		console.log(creep.name + ' finds a new role : ' + creep.memory.role);
	},

	needs: function(role)
	{
		return _.filter(Game.creeps, (creep) => (creep.memory.role == role)).length < this[role + 's']
	}

};
