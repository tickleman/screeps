
var harvester = require('creep.harvester');

module.exports.__proto__ = require('creep');

/**
 * Simple upgraders work like harvesters : their target are the main room controller
 *
 * @param construction_site string constrictuion site id
 */
module.exports.spawn = function(construction_site)
{
	return harvester.spawn('builder', construction_site);
};

/**
 * @param creep Creep
 **/
module.exports.targets = function(creep)
{
	return creep.room.find(FIND_CONSTRUCTION_SITES);
};

/**
 * @param creep Creep
 **/
module.exports.work = function(creep)
{
	if (!this.fill(creep, true)) {
		var target = Game.getObjectById(creep.memory.target);
		// build
		if (target) {
			if (creep.build(target) == ERR_NOT_IN_RANGE) {
				creep.moveTo(target);
			}
		}
		// find target
		else {
			var targets = this.targets(creep);
			if (targets.length) {
				creep.memory.target = targets[0].id;
			}
			// nothing more to build : become an upgrader
			else {
				creep.memory.role = 'upgrader';
				creep.memory.target = creep.room.controller;
			}
		}
	}
};
