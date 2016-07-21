
var base_creep = require('./creep');
var builder    = require('./creep.builder');
var carrier    = require('./creep.carrier');
var harvester  = require('./creep.harvester');
var creeps     = require('./creeps');
var repairer   = require('./creep.repairer');
var rooms      = require('./rooms');
var tower      = require('./structure.tower');
var upgrader   = require('./creep.upgrader');

/**
 * count existing creeps
 *
 * @var object number[] key is the creep role
 */
var count = creeps.count();

/**
 * @type object|base_creep[]
 */
var creep_of = {
	base_creep: base_creep,
	builder:    builder,
	carrier:    carrier,
	harvester:  harvester,
	repairer:   repairer,
	upgrader:   upgrader
};

/**
 * @type object|tower[]
 */
var structure_of = {
	STRUCTURE_TOWER: tower
};

module.exports.loop = function ()
{
	var main = this;

	if (!rooms.memorized()) rooms.memorize();

	// free dead creeps
	creeps.freeDeadCreeps();

	// spawn the first needed creep
	rooms.forEach(function(room) {
		let spawn = rooms.get(room, 'spawn');
		if (spawn && !spawn.spawning) {
			if (
				   main.spawnRoleCreep(room, 'spawn_harvester', true)
				|| main.spawnRoleCreep(room, 'spawn_carrier', true)
		    || main.spawnRoleCreep(room, 'controller_upgrader', true)
				|| main.spawnRoleCreep(room, 'controller_harvester', true)
				|| main.spawnRoleCreep(room, 'controller_carrier', true)
				|| main.needBuilder(room)
				|| main.needRepairer(room)
				|| main.needCarrier(room)
			) {
				return true;
			}
		}
	});

	// creeps work
	creeps.forEach(function(creep) {
		if (!creep.spawning && creep_of[creep.memory.role]) {
			creep_of[creep.memory.role].work(creep);
		}
	});

	// structures work
	for (let structure in Game.structures) if (Game.structures.hasOwnProperty(structure)) {
		structure = Game.structures[structure];
		if (structure.my && structure_of[structure.structureType]) {
			structure_of[structure.structureType].run(structure);
		}
	}

};

/**
 * Returns true if needs and spawns a builder
 *
 * @param room Room
 * @returns {boolean}
 */
module.exports.needBuilder = function(room)
{
	if (!count['builder'] && _.filter(room.find(FIND_CONSTRUCTION_SITES)).length) {
		return this.spawnSimpleCreep(room, 'builder', true)
	}
	return false;
};

/**
 * Returns true if needs and spawns a builder
 *
 * @param room Room
 * @returns {boolean}
 */
module.exports.needCarrier = function(room)
{
	if (
		(count['carrier'] < 4)
		&& _.filter(
			room.find(FIND_MY_CREEPS),
			creep => (creep.memory.role == 'builder') || (creep.memory.role == 'repairer')
		).length
	) {
		return this.spawnSimpleCreep(room, 'carrier', true)
	}
	return false;
};

/**
 * Returns true if needs and spawns a builder
 *
 * @param room Room
 * @returns {boolean}
 */
module.exports.needRepairer = function(room)
{
	if (
		!count['repairer']
		&& _.filter(room.find(FIND_MY_STRUCTURES), structure => structure.hits < structure.hitsMax).length
	) {
		return this.spawnSimpleCreep(room, 'repairer', true)
	}
	return false;
};

/**
 * @param room            Room
 * @param room_role       string @example 'spawn_harvester'
 * @param [accept_little] boolean @default false
 * @returns boolean
 */
module.exports.spawnRoleCreep = function(room, room_role, accept_little)
{
	if (room.controller.level == 1) {
		accept_little = true;
	}
	if (!rooms.has(room, room_role)) {
		let role  = rooms.get(room, room_role, 'role');
		let spawn = rooms.get(room, 'spawn');
		if (role && spawn) {
			let creep = creep_of[role].spawn({ accept_little: accept_little, role: role, spawn: spawn });
			if (creep) {
				creep.memory.room      = room.name;
				creep.memory.room_role = room_role;
				creep.memory.step      = 'spawning';
				rooms.setCreep(room, room_role, creep);
				return true;
			}
		}
	}
	return false;
};

/**
 * @param room            Room
 * @param role            string @example 'builder'
 * @param [accept_little] boolean @default false
 * @returns boolean
 */
module.exports.spawnSimpleCreep = function(room, role, accept_little)
{
	let creep = creep_of[role].spawn({ accept_little: accept_little, role: role, spawn: rooms.get(room, 'spawn') });
	if (creep) {
		return true;
	}
	return false;
};
