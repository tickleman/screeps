/*
var roleBuilder   = require('role.builder');
var roleHarvester = require('role.harvester');
var roleRepairer  = require('role.repairer');
var roleUpgrader  = require('role.upgrader');
var spawner       = require('my.spawner');
var tower         = require('tower');
*/

var start   = require('phase.start');
var harvest = require('harvest.start');

module.exports.loop = function ()
{
	if (!_.filter(Game.creeps))    Memory.phase = 'start';
	if (Memory.phase == 'start')   start.run();
	if (Memory.phase == 'harvest') harvest.run();

	/*
	if (_.filter(Game.creeps, (creep) => true).length < spawner.population) {
		spawner.autoSpawn();
	}

	for (var structure_id in Game.structures) {
		var structure = Game.structures[structure_id];
		if (structure.structureType == STRUCTURE_TOWER) {
			tower.run(structure);
		}
	}
	*/
};
