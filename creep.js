/**
 * The creep library : how to manage creeps with basic features that you can override
 */

var basic_work = require('./work.basic');
var body       = require('./body');
var messages   = require('./messages');
var names      = require('./names');
var objects    = require('./objects');
var path       = require('./path');
var rooms      = require('./rooms');
var rooms_work = require('./work.rooms');
var sources    = require('./sources');

/**
 * Use sources() / targets() to find its initial source / target
 *
 * @type string
 */
module.exports.AUTO = 'AUTO';

/**
 * @type boolean
 */
module.exports.DEBUG = false;

/**
 * This value for spawn() enables the automatic available source terrain finder
 *
 * @type string
 */
module.exports.ENERGY = 'ENERGY';

/**
 * This is returned by targetWork() when job is done
 *
 * @type string
 */
module.exports.JOB_DONE = 'JOB_DONE';

/**
 * @type number
 */
module.exports.NO_SOURCE = 1;

/**
 * @type number
 */
module.exports.NO_TARGET = 2;

/**
 * Body parts for a starter creep
 * CARRY, MOVE, WORK
 * - consume 200 energy units
 * - harvests 2 energy units per tick
 * - carrie 25 energy units per tick
 *
 * @type string[]
 */
module.exports.body_parts = [CARRY, MOVE, WORK];

/**
 * When true, find a new target each time the creep finishes filling in
 *
 * @type boolean
 */
module.exports.find_next_target = false;

/**
 * The default role when this creep is spawned
 *
 * @type string
 */
module.exports.role = 'creep';

/**
 * @type boolean If true, do not find another source when source job is done
 */
module.exports.single_source = false;

/**
 * @type boolean If true, do not find another target when target job is done
 */
module.exports.single_target = false;

/**
 * If false, disable source work :
 * sourceJobDone always returns true, targetJobDone always returns false, sources always returns []
 *
 * @type boolean
 */
module.exports.source_work = true;

/**
 * If false, disable target work :
 * sourceJobDone always returns false, targetJobDone always returns true, targets always returns []
 *
 * @type boolean
 */
module.exports.target_work = true;

/**
 * @type boolean If true, stays near target and wait for energy instead of going to source to get some
 */
module.exports.wait_for_energy = false;

/**
 * Set the source of the creep and return the source.
 * If no available source, delete the source from memory and returns null.
 *
 * @param creep Creep
 * @return object source
 */
module.exports.findSource = function(creep)
{
	var sources = this.sources(creep);
	if (sources.length) {
		var source = sources[0];
		if (creep instanceof Creep) {
			creep.say('source');
			creep.memory.source = source.id;
		}
		return source;
	}
	if (creep instanceof Creep) {
		creep.say('no source');
		delete creep.memory.source;
	}
	return null;
};

/**
 * Set the source of the creep and returns the source id.
 * If no available source, delete the source from memory and returns null.
 *
 * @param creep Creep
 * @return string
 */
module.exports.findSourceId = function(creep)
{
	var source = this.findSource(creep);
	return source ? source.id : null;
};

/**
 * Set the target of the creep and returns the target.
 * If no available target, delete the target from memory and return null.
 *
 * @param creep Creep
 * @return object target
 */
module.exports.findTarget = function(creep)
{
	var targets = this.targets(creep);
	if (targets.length) {
		var target = targets[0];
		if (creep instanceof Creep) {
			creep.say('target');
			creep.memory.target = target.id;
		}
		return target;
	}
	if (creep instanceof Creep) {
		creep.say('no target');
		delete creep.memory.target;
	}
	return null;
};

/**
 * Set the target of the creep and returns the target id.
 * If no available target, delete the target from memory and return null.
 *
 * @param creep Creep
 * @return string
 */
module.exports.findTargetId = function(creep)
{
	var target = this.findTarget(creep);
	return target ? target.id : null;
};

/**
 * Returns the next source, or null if keep the same source or no source available (current source is kept)
 *
 * @param creep Creep
 * @return RoomObject|null
 */
module.exports.nextSource = function(creep)
{
	return (!creep.memory.source || (creep.carry.energy / creep.carryCapacity < .5))
		? this.findSource(creep)
		: null;
};

/**
 * Returns the next source, or null if keep the same target or no target available (current target is kept)
 *
 * @param creep Creep
 * @return RoomObject|null
 */
module.exports.nextTarget = function(creep)
{
	return (!creep.memory.target || (creep.carry.energy / creep.carryCapacity > .4))
		? this.findTarget(creep)
		: null;
};

/**
 * Returns true if creep has only one source
 *
 * @param creep
 * @returns boolean
 */
module.exports.singleSource = function(creep)
{
	return (creep.memory['single_source'] !== undefined)
		? creep.memory.single_source
		: this.single_source;
};

/**
 * Returns true if creep has only one target
 *
 * @param creep
 * @returns boolean
 */
module.exports.singleTarget = function(creep)
{
	return (creep.memory['single_target'] !== undefined)
		? creep.memory.single_target
		: this.single_target;
};

/**
 * Source number of creeps into the source
 * If context is a creep, don't count this creep as creeps affected to the source
 *
 * @param source  Source
 * @param [context] RoomObject
 * @returns number
 */
module.exports.sourceCount = function(source, context)
{
	var count = 0;
	for (let creep_name in Memory.creeps) if (Memory.creeps.hasOwnProperty(creep_name)) {
		let creep = Memory.creeps[creep_name];
		if ((creep.source == source.id) && (!context || !context.name || (context.name != creep_name))) {
			count ++;
		}
	}
	return count;
};

/**
 * The work the creep must do at its source
 * Or how it gets its energy from source
 *
 * @param creep  Creep
 * @return number 0 if no error, error code if error during the job
 */
module.exports.sourceJob = function(creep)
{
	let source = objects.get(creep, creep.memory.source);
	if (this.DEBUG) console.log('s: source =', source);
	//noinspection JSCheckFunctionSignatures
	let result = source ? objects.getEnergy(creep, source) : (this.singleSource(creep) ? OK : this.NO_SOURCE);
	if (this.DEBUG) console.log('s: result =', messages.error(result));
	return result;
};

/**
 * Return true if the creep is full of energy
 * Store the full information into its memory
 *
 * @param creep Creep
 * @return boolean
 */
module.exports.sourceJobDone = function(creep)
{
	if (!this.source_work) {
		if (this.DEBUG) console.log('s: source job always done (no source work)');
		return true;
	}
	if (!this.target_work) {
		if (this.DEBUG) console.log('s: source job always continue (no target work');
		return false;
	}
	let source = objects.get(creep, creep.memory.source);
	if (this.DEBUG) console.log('s: source =', source);
	if (!source || objects.energyFull(creep)) {
		if (this.DEBUG) console.log(source ? 's: source job done (energy full)' : 's: source job done (no source)');
		return true;
	}
	let result = (objects.energy(source) < 10) && (objects.energyRatio(creep) > .5);
	if (this.DEBUG) console.log(
		result ? 's: source job done (source energy empty)' : 's: source job continue (need more energy)'
	);
	return result;
};

/**
 * A simple sources selector :
 * Default is energy sources : dropped energy, and if not container / storage energy
 *
 * @param context RoomObject
 * @return string[] Sources id
 */
module.exports.sources = function(context)
{
	if (!this.source_work) return [];
	var source = context.pos.findClosestByRange(FIND_DROPPED_ENERGY);
	if (!source) source = context.pos.findClosestByRange(FIND_STRUCTURES, { filter: structure =>
		(structure.structureType == STRUCTURE_CONTAINER) || (structure.structureType == STRUCTURE_STORAGE)
	});
	if (!source) source = context.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
	return source ? [source] : [];
};

/**
 * Spawn a creep, giving it a role, source and target (optionals)
 *
 * @param [options] {{ target: RoomObject|RoomPosition|string, source: RoomObject|RoomPosition|string, role: string,
 *                     name: string }}
 * @return Creep|null
 */
module.exports.spawn = function(options)
{
	if (!options) options = {};
	// spawn
	if (!options.spawn && options.source) options.spawn = rooms.get(rooms.nameOf(options.source), 'spawn');
	if (!options.spawn && options.target) options.spawn = rooms.get(rooms.nameOf(options.target), 'spawn');
	// body parts
	var body_parts = this.body_parts;
	if (options.accept_little && options.spawn.canCreateCreep(body_parts)) {
		body_parts = body.parts(body_parts, options.spawn.room.energyAvailable);
	}
	// create creep
	if (body_parts && !options.spawn.canCreateCreep(body_parts)) {
		if (!options.name)   options.name   = names.chooseName();
		if (!options.role)   options.role   = this.role;
		if (!options.source) options.source = this.findSource(options.spawn);
		if (!options.target) options.target = this.findTarget(options.spawn);
		// source / target id
		if (options.source && (options.source instanceof RoomObject)) options.source = options.source.id;
		if (options.target && (options.target instanceof RoomObject)) options.target = options.target.id;
		// prepare creep memory
		var memory = { role: options.role };
		if (options.source) memory.source = options.source;
		if (options.target) memory.target = options.target;
		// spawn a new creep
		var creep_name = options.spawn.createCreep(body_parts, options.name, memory);
		console.log('spawns ' + options.role + ' ' + creep_name);
		return Game.creeps[creep_name];
	}
	return null;
};

/**
 * The work the creep must do at its target
 * The default is to transfer its energy to the target
 *
 * @param creep Creep
 * @return number
 */
module.exports.targetJob = function(creep)
{
	if (!creep.carry.energy) {
		if (this.DEBUG) {
			console.log(this.wait_for_energy ? 't: job OK (wait for energy)' : 't: job NOT_ENOUGH_ENERGY');
		}
		return this.wait_for_energy ? OK : ERR_NOT_ENOUGH_ENERGY;
	}
	let target = objects.get(creep, creep.memory.target);
	if (this.DEBUG) console.log('t: target =', target);
	let result = target ? objects.putEnergy(creep, target) : (this.singleTarget(creep) ? OK : this.NO_TARGET);
	if (this.DEBUG) console.log('t: result =', messages.error(result));
	return result;
};

/**
 * Job is done when the target is filled with energy
 *
 * @param creep Creep
 * @return boolean
 */
module.exports.targetJobDone = function(creep)
{
	if (!this.target_work) {
		if (this.DEBUG) console.log('t: target job always done (no target work)');
		return true;
	}
	if (!this.source_work) {
		if (this.DEBUG) console.log('t: target job always continue (no source work)');
		return false;
	}
	let target = objects.get(creep, creep.memory.target);
	if (this.DEBUG) console.log('t: target =', target);
	if (!target || !creep.carry.energy) {
		if (this.DEBUG) console.log(target ? 't: target job done (no energy)' : 't: target job done (no target)');
		return true;
	}
	let result = objects.energyFull(target);
	if (this.DEBUG) console.log(
		result ? 't: target job done (target energy full)' : 't: target job continue (target energy not full)'
	);
	return result;
};

/**
 * Find an available target for the harvester : the first not filled-in spawn
 *
 * @param context RoomObject
 * @return StructureSpawn[]
 **/
module.exports.targets = function(context)
{
	if (!this.target_work) return [];
	// the nearest extension without energy into the current room
	let target = context.pos.findClosestByRange(FIND_STRUCTURES, { filter: structure =>
		(structure.structureType == STRUCTURE_EXTENSION) && !objects.energyFull(structure)
	});
	if (target) return [target];
	// the nearest spawn without energy into the current room
	target = context.pos.findClosestByRange(FIND_STRUCTURES, { filter: structure =>
		(structure.structureType == STRUCTURE_SPAWN) && !objects.energyFull(structure)
	});
	if (target) return [target];
	// the nearest container or storage
	target = context.pos.findClosestByRange(FIND_STRUCTURES, { filter: structure =>
		((structure.structureType == STRUCTURE_CONTAINER) || (structure.structureType == STRUCTURE_STORAGE))
		&& !objects.energyFull(structure)

	});
	return target ? [target] : [];
};

/**
 * Let's work ! work depends on creep role and work mode
 *
 * @param creep Creep
 **/
module.exports.work = function(creep)
{
	if (this.DEBUG) {
		console.log(
			'WORK',
			creep.name,
			creep.memory.role,
			creep.memory.room_role ? creep.memory.room_role : 'basic',
			creep.memory.step ? creep.memory.step : 'no-step'
		);
		console.log('w: single source =', this.singleSource(creep), ', single target =', this.singleTarget(creep));
		console.log('w: source work =',   this.source_work, ', target work =', this.target_work);
	}
	if (creep.memory.room_role) rooms_work.work(this, creep);
	else                        basic_work.work(this, creep);
};
