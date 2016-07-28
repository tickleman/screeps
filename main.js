
var base_creep      = require('./creep');
var builder         = require('./creep.builder');
var carrier         = require('./creep.carrier');
var harvester       = require('./creep.harvester');
var creeps          = require('./creeps');
var objects         = require('./objects');
var orders          = require('./orders');
var repairer        = require('./creep.repairer');
var rooms           = require('./rooms');
var spawner         = require('./spawner');
var tower           = require('./structure.tower');
var trans_carrier   = require('./trans_carrier');
var trans_harvester = require('./trans_harvester');
var upgrader        = require('./creep.upgrader');

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
	var main = this;

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
		if (!orders.give(Game.flags[flag])) {
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
