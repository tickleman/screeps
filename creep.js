/**
 * The creep library : how to manage creeps with basic features that you can override
 */

var basic   = require('./work.basic');
var body    = require('./body');
var names   = require('./names');
var objects = require('./objects');
var path    = require('./path');
var rooms   = require('./rooms');
var sources = require('./sources');
var work    = require('./work.rooms');

/**
 * Use sources() / targets() to find its initial source / target
 *
 * @type string
 */
module.exports.AUTO = 'AUTO';

/**
 * @type boolean
 */
module.exports.DEBUG = true;

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
 * Set the source of the creep and return the source.
 * If no available source, delete the source from memory and return undefined.
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
 * If no available source, delete the source from memory and return undefined.
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
 * If no available target, delete the target from memory and return undefined.
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
 * If no available target, delete the target from memory and return undefined.
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
 * The work the creep must do at its source
 * Or how it gets its energy from source
 *
 * @param creep  Creep
 * @return number 0 if no error, error code if error during the job
 */
module.exports.sourceJob = function(creep)
{
	let source = objects.get(creep, creep.memory.source);
	//noinspection JSCheckFunctionSignatures
	return source ? creep.harvest(source) : this.NO_SOURCE;
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
	return (creep.carry.energy / creep.carryCapacity > .8);
};

/**
 * A simple sources selector :
 * Default is energy sources.
 * This dispatches creeps to available sources access terrains.
 * You may return sources id or sources object here.
 *
 * @param context RoomObject
 * @return string[] Sources id
 */
module.exports.sources = function(context)
{
	let source = rooms.get(context.room, 'spawn');
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
	let target = objects.get(creep, creep.memory.target);
	return target ? creep.transfer(target, RESOURCE_ENERGY) : this.NO_TARGET;
};

/**
 * Job is done when the target is filled with energy
 *
 * @param creep Creep
 * @return boolean
 */
module.exports.targetJobDone = function(creep)
{
	let target = objects.get(creep, creep.memory.target);
	if (!target || !creep.carry.energy) return true;
	return (target instanceof Creep)
		? (target.carry.energy / target.carryCapacity > .8)
		: (target.energy / target.energyCapacity > .8);
};

/**
 * Find an available target for the harvester : the first not filled-in spawn
 *
 * @param context RoomObject
 * @return StructureSpawn[]
 **/
module.exports.targets = function(context)
{
	// the nearest extension without energy into the current room
	let target = context.pos.findClosestByRange(FIND_STRUCTURES, { filter:
		structure => (structure.energy < structure.energyCapacity)
		&& (structure.structureType == STRUCTURE_EXTENSION)
	});
	if (target) return [target];
	// the nearest spawn without energy into the current room
	target = context.pos.findClosestByRange(FIND_STRUCTURES, { filter:
		structure => (structure.energy < structure.energyCapacity) && (structure.structureType == STRUCTURE_SPAWN)
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
	if (creep.memory.room_role) work.work(this, creep);
	else                        basic.work(this, creep);
};
