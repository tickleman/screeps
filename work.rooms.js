/**
 * Work from rooms configuration module
 */

var objects = require('./objects');
var path    = require('./path');
var rooms   = require('./rooms');

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
	var position = rooms.getRoomPosition(creep.room, creep.memory.room_role);
	if (position) {
		let ignore_creeps = path.ignore_creeps;
		path.ignore_creeps = false;
		path.calculate(creep, position, { source_range: 0 });
		path.ignore_creeps = ignore_creeps;
		creep.memory.step = 'goToStart';
		creep.memory.source = objects.get(creep, rooms.get(creep.memory.room, creep.memory.room_role, 'source'));
		creep.memory.target = objects.get(creep, rooms.get(creep.memory.room, creep.memory.room_role, 'target'));
		path.move(creep);
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
	if (moved == path.ARRIVED) {
		let room_memory = rooms.get(creep.memory.room, creep.memory.room_role, rooms.MEMORY);
		if (room_memory.path) {
			creep.memory.path = room_memory.path;
			creep.memory.path_step = 4;
		}
		else {
			delete creep.memory.path;
			delete creep.memory.path_step;
		}
		creep.memory.step = 'sourceWork';
	}
	else if (moved) {
		creep.say('move:' + moved);
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
	if (!creepjs.fill(creep)) {
		if (creep.memory.path) {
			creep.memory.step_pos = 4;
			creep.memory.step = 'goToTarget';
		}
		else {
			creep.say('path missing');
		}
	}
};

/**
 * #4 : GO TO TARGET
 *
 * @param creepjs object
 * @param creep   Creep
 */
module.exports.goToTarget = function(creepjs, creep)
{
	let moved = path.move(creep);
	if ((moved == path.ARRIVED) || (moved == path.WAYPOINT)) {
		creep.memory.step = 'targetWork';
	}
	else if (moved) {
		creep.say('move:' + moved);
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
	let target = objects.get(creep, creep.memory.target);
	if (target.id != creep.memory.target) {
		creep.memory.target = target.id;
	}
	if (this.targetJobDone(creep, target)) {
		creep.memory.step = 'goToSource';
		creep.memory.path_step ++;
	}
	else {
		let error = creepjs.targetJob(creep, target);
		if (error) {
			creep.say(error.toString());
		}
	}
};

/**
 * #6 : GO TO SOURCE
 * Go to source step
 *
 * @param creeps
 * @param creep Creep
 */
module.exports.goToSource = function(creeps, creep)
{
	let moved = path.move(creep);
	if (moved == path.ARRIVED) {
		creep.memory.step = 'sourceWork';
	}
	else if (moved) {
		creep.say('move:' + moved);
	}
};
