
var base_creep = require('./creep');
var builder    = require('./creep.builder');
var carrier    = require('./creep.carrier');
var harvester  = require('./creep.harvester');
var creeps     = require('./creeps');
var repairer   = require('./creep.repairer');
var start      = require('./phase.start');
var tasks      = require('./tasks');
var tower      = require('./structure.tower');
var upgrader   = require('./creep.upgrader');

module.exports.loop = function ()
{
	// start phase
	if (!Memory.phase) {
		start.run();
	}

	// count existing creeps
	var count = creeps.count();

	// spawn a base creep to start the map
	if (!count.creep && (!count.carrier || !count.harvester)) {
		base_creep.spawn(Game.spawns.Spawn.id);
	}

	// creeps work
	creeps.forEach(function(creep) {
		if (!creep.spawning) {
			switch (creep.memory.role) {
				case 'builder':   builder.work(creep);    break;
				case 'carrier':   carrier.work(creep);    break;
				case 'creep':     base_creep.work(creep); break;
				case 'harvester': harvester.work(creep);  break;
				case 'repairer':  repairer.work(creep);   break;
				case 'upgrader':  upgrader.work(creep);   break;
			}
		}
	});

	for (var structure_id in Game.structures) if (Game.structures.hasOwnProperty(structure_id)) {
		var structure = Game.structures[structure_id];
		if (structure.my) {
			// towers work
			if ((structure.structureType == STRUCTURE_TOWER)) {
				tower.run(structure);
			}
		}
	}

};
