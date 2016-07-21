/**
 * The creep library : how to manage creeps with basic features that you can override
 */

var body    = require('./body');
var names   = require('./names');
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
 * Move to source / fill of energy
* *
 * @param creep            Creep
 * @param find_next_target boolean if false, the target stays the same
 * @return boolean true if the creeps needs to fill, false if it is full
 **/
module.exports.fill = function(creep, find_next_target)
{
	if (!this.isFull(creep, find_next_target)) {
		var source = Game.getObjectById(creep.memory.source);
		if (!source) {
			source = this.findSource(creep);
		}
		if (source) {
			if (this.sourceJob(creep, source) == ERR_NOT_IN_RANGE) {
				creep.moveTo(source);
			}
		}
		return true;
	}
	return false;
};

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
		if (typeof source == 'string') {
			source = Game.getObjectById(source);
		}
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
	return undefined;
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
	return source ? source.id : undefined;
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
		if (creep instanceof Creep) {
			creep.say('target');
			creep.memory.target = targets[0].id;
		}
		return targets[0];
	}
	if (creep instanceof Creep) {
		creep.say('no target');
		delete creep.memory.target;
	}
	return undefined;
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
	return target ? target.id : undefined;
};

/**
 * Return true if the creep is full of energy
 * Store the full information into its memory
 *
 * @param creep            Creep
 * @param find_next_target boolean if false, the target stays the same
 * @return boolean
 */
module.exports.isFull = function(creep, find_next_target)
{
	if (creep.memory.full) {
		if (!creep.carry.energy) {
			delete creep.memory.full;
			if (find_next_target) {
				creep.memory.target = this.findTarget(creep);
			}
		}
	}
	else if (creep.carry.energy == creep.carryCapacity) {
		creep.memory.full = true;
	}
	return creep.memory.full;
};

/**
 * The work the creep must do at its source
 * Or how it gets its energy from source
 *
 * @param creep  Creep
 * @param source Source
 * @return number
 */
module.exports.sourceJob = function(creep, source)
{
	return creep.harvest(source);
};

/**
 * A simple sources selector :
 * Default is energy sources.
 * This dispatches creeps to available sources access terrains.
 * You may return sources id or sources object here.
 *
 * @return string[] Sources id
 */
module.exports.sources = function()
{
	var source = sources.availableSourceId();
	// no available source id ? they must be at least one affected to a dead creep : cleanup
	if (!source) {
		sources.memorize(true);
		source = sources.availableSourceId(true);
	}
	return [source];
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
		if (!options.source) options.source = this.findSource();
		if (!options.target) options.target = this.findTarget();
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
 * @param creep  Creep
 * @param target object
 * @return number
 */
module.exports.targetJob = function(creep, target)
{
	return creep.transfer(target, RESOURCE_ENERGY);
};

/**
 * Job is done when the target is filled with energy
 *
 * @param creep  Creep
 * @param target object
 * @return boolean
 */
module.exports.targetJobDone = function(creep, target)
{
	if (!creep.carry.energy) return true;
	return (target instanceof Creep)
		? (target.carry.energy / target.carryCapacity > .8)
		: (target.energy / target.energyCapacity > .8);
};

/**
 * Find an available target for the harvester : the first not filled-in spawn
 *
 * @param [creep] Creep
 * @return StructureSpawn[]
 **/
module.exports.targets = function(creep)
{
	var targets;
	if (creep) {
		targets = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: structure =>
			(structure.energy < structure.energyCapacity)
			&& (structure.structureType == STRUCTURE_EXTENSION)
		});
		targets = targets ? [targets] : [];
	}
	else {
		targets = _.filter(Game.spawns.Spawn.room.find(FIND_STRUCTURES), structure =>
			(structure.energy < structure.energyCapacity)
			&& (structure.structureType == STRUCTURE_EXTENSION)
		);
	}
	if (targets.length) return targets;
	// the default target is the first spawn without energy into the current room
	var room = creep ? creep.room : Game.spawns.Spawn.room;
	targets = _.filter(room.find(FIND_STRUCTURES), structure =>
		(structure.energy < structure.energyCapacity)
		&& (structure.structureType == STRUCTURE_SPAWN)
	);
	return targets;
};

/**
 * The default work for a creep : fill in, move to target, do the work
 *
 * @param creep Creep
 **/
module.exports.work = function(creep)
{
	if (creep.memory.task !== undefined) this.workTask(creep);
	else if (creep.memory.room_role)     work.work(this, creep);
	else                                 this.workBasic(creep);
};

/**
 * Basic not planned work : search source, fill, search target, target work, then loop
 *
 * @param creep Creep
 */
module.exports.workBasic = function(creep)
{
	if (!this.fill(creep, this.find_next_target)) {
		let target = Game.getObjectById(creep.memory.target);
		if (!target || this.targetJobDone(creep, target)) {
			target = this.findTarget(creep);
		}
		if (this.targetJob(creep, target) == ERR_NOT_IN_RANGE) {
			creep.moveTo(target);
		}
	}
};

/**
 * Task-planned work : depends on tasks steps
 *
 * @deprecated
 * @param creep
 */
module.exports.workTask = function(creep)
{
	if (this.DEBUG) console.log(creep.name + ' task ' + creep.memory.task);
	var task = Memory.tasks[creep.memory.task];
	// prepare to go to init start point or start init sequence in already in start point
	if (!creep.memory.step) {
		creep.memory.step = 'go';
		creep.memory.path = path.shift(path.calculate(creep, path.startRoomPosition(task.init)), creep.pos);
		if (this.DEBUG) console.log('- go ' + creep.memory.path);
		creep.memory.step_pos = 4;
		if (creep.memory.step_pos >= creep.memory.path) {
			delete creep.memory.path;
			creep.memory.step = 'init';
			if (this.DEBUG) console.log('- init instead of go ' + task.init);
		}
	}
	// go to init start point
	if (creep.memory.step == 'go') {
		if (this.DEBUG) console.log('- go ' + creep.memory.path + ' step ' + creep.memory.step_pos);
		if (!creep.move(creep.memory.path[creep.memory.step_pos])) {
			if (this.DEBUG) console.log('- next step');
			creep.memory.step_pos ++;
			if (creep.memory.step_pos >= creep.memory.path.length) {
				delete creep.memory.path;
				creep.memory.step = 'init';
				creep.memory.step_pos = 4;
				if (this.DEBUG) console.log('- init ' + task.init);
			}
		}
		else {
			creep.say('wait');
		}
	}
	// initialization path
	else if (creep.memory.step == 'init') {
		if (this.DEBUG) console.log('- init ' + task.init + ' step ' + creep.memory.step_pos);
		if (!creep.move(task.init[creep.memory.step_pos])) {
			if (this.DEBUG) console.log('- next step');
			creep.memory.step_pos ++;
			if (creep.memory.step_pos >= task.init.length) {
				creep.memory.step = 'work';
				if (task.path) creep.memory.step_pos = task.path.length;
				else delete creep.memory.step_pos;
				if (this.DEBUG) console.log('- work ' + task.path);
			}
		}
		else {
			creep.say('wait');
		}
	}
	// work path
	else if (creep.memory.step == 'work') {
		if (task.path) {
			if (this.DEBUG) console.log('- work ' + task.path + ' step ' + creep.memory.step_pos);
			// - start point : source job (fill)
			if (creep.memory.step_pos >= task.path.length) {
				if (this.DEBUG) console.log('- fill');
				if (!this.fill(creep)) {
					if (this.DEBUG) console.log('- loop');
					creep.memory.step_pos = 4;
				}
			}
			// - arrival point : target job
			if (task.path[creep.memory.step_pos] == path.WAYPOINT) {
				if (this.DEBUG) console.log('- waypoint');
				let target = Game.getObjectById(creep.memory.target);
				if (!target) {
					target = this.findTarget(creep);
				}
				if (this.targetJobDone(creep, target)) {
					if (this.DEBUG) console.log('- target job done : next step');
					creep.memory.step_pos ++;
				}
				else {
					if (this.DEBUG) console.log('- execute target job');
					let error = this.targetJob(creep, target);
					if (error) {
						creep.say(error.toString());
					}
				}
			}
			// - move
			else if (!creep.move(task.path[creep.memory.step_pos])) {
				creep.memory.step_pos ++;
				if (creep.memory.step_pos >= task.path.length) {
					creep.memory.step_pos = 4;
				}
			}
			else {
				creep.say('wait');
			}
		}
		else {
			if (this.DEBUG) console.log('- work');
			if (!this.fill(creep)) {
				let error;
				let target = Game.getObjectById(creep.memory.target);
				if (!target || this.targetJobDone(creep, target)) {
					target = this.findTarget(creep);
				}
				if (error = this.targetJob(creep, target)) {
					creep.say(error.toString());
				}
			}
		}
	}
};
