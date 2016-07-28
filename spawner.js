
var objects      = require('./objects');
var rooms        = require('./rooms');
var shorter_path = require('./shorter_path');

module.exports.room = function(main, room)
{
	let spawn = rooms.get(room, 'spawn');
	if (spawn && !spawn.spawning) {
		// spawn the first needed creep
		if (!main.count[room.name]) {
			this.simpleCreep(main, room, { accept_little: true, count: 1, role: 'carrier' });
		}
		// spawn other creeps
		else if (
			this.spawnHarvester (main, room)
			|| this.spawnCarrier(main, room)
			|| this.roleCreep   (main, room, 'controller_upgrader',  { accept_little: true })
			|| this.roleCreep   (main, room, 'controller_harvester', { accept_little: true })
			|| this.roleCreep   (main, room, 'controller_carrier',   { accept_little: true })
			|| this.simpleCreep (main, room, { accept_little: true, count: 3, role: 'carrier' })
			|| this.simpleCreep (main, room, { count: 1, role: 'builder' })
			|| this.simpleCreep (main, room, { count: 1, role: 'repairer' })
		) {
			return true;
		}
	}
};

/**
 * @param main object
 * @param room Room
 * @returns boolean
 */
module.exports.spawnCarrier = function(main, room)
{
	return (main.count[room.name].carrier < 2)
		? this.roleCreep(main, room, 'spawn_carrier', { accept_little: true })
		: false;
};

/**
 * @param main object
 * @param room Room
 * @returns boolean
 */
module.exports.spawnHarvester = function(main, room)
{
	let opts = { accept_little: true };
	// rooms has two STRUCTURE_LINK ? harvester must have a CARRY body part to store energy before transfer into link
	let links;
	if (!rooms.has(room, 'spawn_harvester') && ((links = room.find(STRUCTURE_LINK)).length >= 2)) {
		let role = rooms.get(room, 'spawn_harvester', 'role');
		if (role) {
			opts.body_parts = main.creep_of[role].body_parts;
			opts.body_parts.push(CARRY);
		}
	}
	let creep = this.roleCreep(main, room, 'spawn_harvester', opts);
	if (creep && opts.body_parts) {
		creep.memory.link = shorter_path.sort(objects.get(creep, 'spawn_source'), links).shift().id;
	}
	return creep;
};

/**
 * @param main      object
 * @param room      Room
 * @param room_role string @example 'spawn_harvester'
 * @param [opts]    object spawn options
 * @returns boolean
 */
module.exports.roleCreep = function(main, room, room_role, opts)
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
			let creep = main.creep_of[role].spawn(opts);
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
 * @param main   object
 * @param room   Room
 * @param [opts] object spawn options
 * @returns boolean
 */
module.exports.simpleCreep = function(main, room, opts)
{
	if (!opts) opts = {};
	if (main.count[room.name] && main.count[room.name][opts.role] && (main.count[room.name][opts.role] >= opts.count)) {
		return false;
	}
	let spawn = opts.spawn ? opts.spawn : rooms.get(room, 'spawn');
	console.log(opts.role, 'targets ?');
	if (main.creep_of[opts.role].targets(spawn).length) {
		console.log('> wish to spawn a ', opts.role);
		if (!opts.spawn) opts.spawn = spawn;
		let creep = main.creep_of[opts.role].spawn(opts);
		if (creep) {
			return true;
		}
	}
	return false;
};
