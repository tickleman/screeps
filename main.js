
let base_creep      = require('./creep');
let builder         = require('./creep.builder');
let carrier         = require('./creep.carrier');
let harvester       = require('./creep.harvester');
let creeps          = require('./creeps');
let objects         = require('./objects');
let orders          = require('./orders');
let repairer        = require('./creep.repairer');
let rooms           = require('./rooms');
let spawner         = require('./spawner');
let tower           = require('./structure.tower');
let trans_carrier   = require('./creep.trans_carrier');
let trans_harvester = require('./creep.trans_harvester');
let upgrader        = require('./creep.upgrader');

/**
 * @type object|base_creep[]
 */
module.exports.creep_of = {
	base_creep:      base_creep,
	builder:         builder,
	carrier:         carrier,
	harvester:       harvester,
	repairer:        repairer,
	trans_carrier:   trans_carrier,
	trans_harvester: trans_harvester,
	upgrader:        upgrader
};

/**
 * @type {{ string: Flag }}
 */
module.exports.flags = {};

/**
 * @type object|tower[]
 */
module.exports.structure_of = {
	'tower': tower
};

module.exports.loop = function ()
{
	let main = this;

	// reset caches
	creeps.cache  = undefined;
	objects.cache = {};
	rooms.rooms   = {};
	this.flags    = {};

	// count, memorize
	this.count = creeps.count();
	if (!rooms.memorized()) rooms.memorize();

	// free dead creeps
	creeps.freeDeadCreeps();

	// structures work
	for (let structure in Game.structures) if (Game.structures.hasOwnProperty(structure)) {
		structure = Game.structures[structure];
		if (structure.my && this.structure_of[structure.structureType]) {
			this.structure_of[structure.structureType].run(structure);
		}
	}

	// give orders using flags position and name
	for (let flag in Game.flags) if (Game.flags.hasOwnProperty(flag)) {
		flag = Game.flags[flag];
		if (!orders.give(flag)) {
			this.flags[flag.name] = flag;
		}
	}

	// spawn creeps
	rooms.forEach(function(room) {
		spawner.room(main, room);
	});

	// creeps work
	creeps.forEach(function(creep) {
		if (!creep.spawning && main.creep_of[creep.memory.role]) {
			main.creep_of[creep.memory.role].work(creep);
		}
	});

};
