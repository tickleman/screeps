/**
 * The creep library : how to manage creeps with basic features that you can override
 */

var names   = require('./names');
var sources = require('./sources');

/**
 * Use sources() / targets() to find its initial source / target
 *
 * @type string
 */
module.exports.AUTO = 'AUTO';

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
 * Body parts for a simple creep
 * CARRY, MOVE, WORK
 * - consume 200 energy units
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
 * Remove dead creeps from memory
 */
module.exports.freeMemory = function()
{
	for (let creep_name in Memory.creeps) if (Memory.creeps.hasOwnProperty(creep_name)) {
		if (Memory.creeps[creep_name].hasOwnProperty('_move') && !Game.creeps[creep_name]) {
			delete Memory.creeps[creep_name];
			console.log('prune creep ' + creep_name);
		}
	}
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
 * @param target string if set : a given target id. If undefined, will automatically found a target using targets()
 * @param source string if set : a given source id. If undefined, will automatically found a source using sources()
 * @param role   string @default 'harvester'
 * @param name   string if set : the name of the creep
 * @return Creep
 */
module.exports.spawn = function(target, source, role, name)
{
	if (!Game.spawns.Spawn.canCreateCreep(this.body_parts)) {
		if (!name) name = names.chooseName();
		// prepare creep memory
		var memory = { role: role ? role : this.role };
		if (source === undefined) source = this.findSourceId();
		if (target === undefined) target = this.findTargetId();
		if (source) memory.source = source;
		if (target) memory.target = target;
		// spawn a new creep
		var creep_name = Game.spawns.Spawn.createCreep(this.body_parts, name, memory);
		console.log('spawns ' + role + ' ' + creep_name);
		// cleanup memory (remove dead creeps, add newly spawned creep)
		sources.memorize(true);
		this.freeMemory();
		return Game.creeps[creep_name];
	}
	return undefined;
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
	var energy = (target instanceof Creep) ? target.carry.energy : target.energy;
	return energy == target.energyCapacity;
};

/**
 * Find an available target for the harvester : the first not filled-in spawn
 *
 * @param [creep] Creep
 * @return StructureSpawn[]
 **/
module.exports.targets = function(creep)
{
	var room = creep ? creep.room : Game.spawns.Spawn.room;
	// the default target is the first spawn without energy into the current room
	return _.filter(room.find(FIND_STRUCTURES), structure =>
		(structure.energy < structure.energyCapacity)
		&& (structure.structureType == STRUCTURE_SPAWN)
	);
};

/**
 * The default work for a creep : fill in, move to target, do the work
 *
 * @param creep Creep
 **/
module.exports.work = function(creep)
{
	if (!this.fill(creep, this.find_next_target)) {
		var target = Game.getObjectById(creep.memory.target);
		if (!target || this.targetJobDone(creep, target)) {
			this.findTarget(creep);
		}
		else if (this.targetJob(creep, target) == ERR_NOT_IN_RANGE) {
			creep.moveTo(target);
		}
	}
};
