
var base_creep = require('./creep');
var builder    = require('./creep.builder');
var carrier    = require('./creep.carrier');
var harvester  = require('./creep.harvester');
var creeps     = require('./creeps');
var objects    = require('./objects');
var orders     = require('./orders');
var repairer   = require('./creep.repairer');
var rooms      = require('./rooms');
var tower      = require('./structure.tower');
var upgrader   = require('./creep.upgrader');

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
	'tower': tower
};

module.exports.loop = function ()
{
	var main = this;

	// reset caches
	creeps.cache  = undefined;
	objects.cache = {};
	rooms.rooms   = {};

	this.count = creeps.count();
	if (!rooms.memorized()) rooms.memorize();

	// free dead creeps
	creeps.freeDeadCreeps();

	// structures work
	for (let structure in Game.structures) if (Game.structures.hasOwnProperty(structure)) {
		structure = Game.structures[structure];
		if (structure.my && structure_of[structure.structureType]) {
			structure_of[structure.structureType].run(structure);
		}
	}

	// give orders using flags position and name
	for (let flag in Game.flags) if (Game.flags.hasOwnProperty(flag)) orders.give(Game.flags[flag]);

	// spawn creeps
	rooms.forEach(function(room) {
		let spawn = rooms.get(room, 'spawn');
		if (spawn && !spawn.spawning) {
			// spawn the first needed creep
			if (!main.count[room.name]) {
				main.spawnSimpleCreep(room, { accept_little: true, count: 1, role: 'carrier' });
			}
			// spawn other creeps
			else if (
				   main.spawnRoleCreep(room, 'spawn_harvester', { accept_little: true })
				|| main.spawnSpawnCarrier(room)
				|| main.spawnRoleCreep(room, 'controller_upgrader', { accept_little: true })
				|| main.spawnRoleCreep(room, 'controller_harvester', { accept_little: true })
				|| main.spawnRoleCreep(room, 'controller_carrier', { accept_little: true })
				|| main.spawnSimpleCreep(room, { accept_little: true, count: 3, role: 'carrier' })
				|| main.spawnSimpleCreep(room, { count: 1, role: 'builder' })
				|| main.spawnSimpleCreep(room, { count: 1, role: 'repairer' })
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

};

/**
 * @param room
 * @returns boolean
 */
module.exports.spawnSpawnCarrier = function(room)
{
	return (this.count[room.name].carrier < 2)
		? this.spawnRoleCreep(room, 'spawn_carrier', { accept_little: true })
		: false;
};

/**
 * @param room      Room
 * @param room_role string @example 'spawn_harvester'
 * @param [opts]    object spawn options
 * @returns boolean
 */
module.exports.spawnRoleCreep = function(room, room_role, opts)
{
	if (!opts) opts = {};
	if (room.controller.level == 1) {
		opts.accept_little = true;
	}
	if (!rooms.has(room, room_role)) {
		console.log('wish to spawn a ', room_role);
		let role  = rooms.get(room, room_role, 'role');
		let spawn = opts.spawn ? opts.spawn : rooms.get(room, 'spawn');
		if (role && spawn) {
			if (!opts.role)  opts.role  = role;
			if (!opts.spawn) opts.spawn = spawn;
			let creep = creep_of[role].spawn(opts);
			if (creep) {
				creep.memory.room          = room.name;
				creep.memory.room_role     = room_role;
				if (rooms.get(room, room_role, 'source')) creep.memory.single_source = true;
				if (rooms.get(room, room_role, 'target')) creep.memory.single_target = true;
				rooms.setCreep(room, room_role, creep);
				return true;
			}
		}
	}
	return false;
};

/**
 * @param room   Room
 * @param [opts] object spawn options
 * @returns boolean
 */
module.exports.spawnSimpleCreep = function(room, opts)
{
	if (!opts) opts = {};
	if (this.count[room.name] && this.count[room.name][opts.role] && (this.count[room.name][opts.role] >= opts.count)) {
		return false;
	}
	let spawn = opts.spawn ? opts.spawn : rooms.get(room, 'spawn');
	console.log(opts.role, 'targets ?');
	if (creep_of[opts.role].targets(spawn).length) {
		console.log('> wish to spawn a ', opts.role);
		if (!opts.spawn) opts.spawn = spawn;
		let creep = creep_of[opts.role].spawn(opts);
		if (creep) {
			return true;
		}
	}
	return false;
};
