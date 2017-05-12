/**
 * Work from rooms configuration module
 */

let messages = require('./messages');
let objects  = require('./objects');
let path     = require('./path');
let rooms    = require('./rooms');

/**
 * Room-role-planned work : depends on work step
 *
 * @param creepjs object
 * @param creep   Creep
 */
module.exports.work = function(creepjs, creep)
{
	switch (creep.memory.step) {
		case 'spawning':   if (!creep.spawning) this.spawning(creepjs, creep); break;
		case 'goToStart':  this.goToStart (creepjs, creep); break;
		case 'goToSource': this.goToSource(creepjs, creep); break;
		case 'sourceWork': this.sourceWork(creepjs, creep); break;
		case 'goToTarget': this.goToTarget(creepjs, creep); break;
		case 'targetWork': this.targetWork(creepjs, creep); break;
		default: creepjs.nextStep(creep, 'spawning');
	}
};

/**
 * #1 : SPAWN
 * Called when creep has just spawned
 *
 * @param creepjs object
 * @param creep   Creep
 */
module.exports.spawning = function(creepjs, creep)
{
	let position = rooms.getRoomPosition(creep.room, creep.memory.room_role);
	if (position) {
		if (!(position.x - creep.pos.x) && !(position.y - creep.pos.y)) {
			creepjs.nextStep(creep, 'sourceWork');
			this.sourceWork(creepjs, creep);
		}
		else {
			path.calculate(creep, position, { ignore_creeps: false, source_range: 0 });
			creepjs.nextStep(creep, 'goToStart');
			creep.memory.source = rooms.get(creep.memory.room, creep.memory.room_role, 'source');
			creep.memory.target = rooms.get(creep.memory.room, creep.memory.room_role, 'target');
			this.goToStart(creepjs, creep);
		}
	}
	else {
		creep.say('no pos');
	}
};

/**
 * #2 : GO TO START POSITION
 * Initial go to start position
 *
 * @param creepjs object
 * @param creep   Creep
 */
module.exports.goToStart = function(creepjs, creep)
{
	let moved = path.move(creep);
	if (moved === path.ARRIVED) {
		let room_memory = rooms.get(creep.memory.room, creep.memory.room_role, rooms.MEMORY);
		if (room_memory.path) creep.memory.path = room_memory.path;
		else delete creep.memory.path;
		delete creep.memory.path_step;
		creepjs.nextStep(creep, 'sourceWork');
		this.sourceWork(creepjs, creep);
	}
	else if (moved) {
		creep.say('m:' + messages.error(moved));
	}
};

/**
 * #3 : SOURCE WORK
 *
 * @param creepjs object
 * @param creep   Creep
 */
module.exports.sourceWork = function(creepjs, creep)
{
	let error = creepjs.sourceWork(creep);
	if (error === creepjs.NEXT_STEP) creepjs.nextStep(creep, 'goToTarget');
	else if (error)                  creep.say('s:' + messages.error(error));
};

/**
 * #4 : GO TO TARGET
 *
 * @param creepjs object
 * @param creep   Creep
 */
module.exports.goToTarget = function(creepjs, creep)
{
	let moved = creep.memory.path ? path.move(creep) : path.ARRIVED;
	if ((moved === path.ARRIVED) || (moved === path.WAYPOINT)) {
		creepjs.nextStep(creep, 'targetWork');
		this.targetWork(creepjs, creep);
	}
	else if (moved) {
		creep.say('m:' + messages.error(moved));
	}
};

/**
 * #5 : TARGET WORK
 *
 * @param creepjs object
 * @param creep   Creep
 */
module.exports.targetWork = function(creepjs, creep)
{
	let error = creepjs.targetWork(creep);
	if (error === creepjs.NEXT_STEP) creepjs.nextStep(creep, 'goToSource');
	else if (error)                  creep.say('t:' + messages.error(error));
};

/**
 * #6 : GO TO SOURCE
 * Go to source step
 *
 * @param creepjs
 * @param creep Creep
 */
module.exports.goToSource = function(creepjs, creep)
{
	let moved = creep.memory.path ? path.move(creep) : path.ARRIVED;
	if (moved === path.ARRIVED) {
		delete creep.memory.path_step;
		creepjs.nextStep(creep, 'sourceWork');
		this.sourceWork(creepjs, creep);
	}
	else if (moved) {
		creep.say('m:' + messages.error(moved));
	}
};
