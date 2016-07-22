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
		creep.memory.source = rooms.get(creep.memory.room, creep.memory.room_role, 'source');
		creep.memory.target = rooms.get(creep.memory.room, creep.memory.room_role, 'target');
		this.goToStart(creepjs, creep);
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
		if (room_memory.path) creep.memory.path = room_memory.path;
		else delete creep.memory.path;
		delete creep.memory.path_step;
		creep.memory.step = 'sourceWork';
		this.sourceWork(creepjs, creep);
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
	if (creepjs.sourceJobDone(creep) || creepjs.sourceJob(creep)) {
		if (creep.memory.path) {
			creep.memory.step_pos = 4;
			creep.memory.step = 'goToTarget';
			this.goToTarget(creepjs, creep);
		}
		else {
			creep.memory.step = 'targetWork';
			this.targetWork(creepjs, creep);
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
		this.targetWork(creepjs, creep);
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
	let error;
	if (creepjs.targetJobDone(creep) || (error = creepjs.targetJob(creep))) {
		if (error) creep.say('work:' + error);
		creep.memory.step = 'goToSource';
		this.goToSource(creepjs, creep);
	}
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
	let moved = path.move(creep);
	if (moved == path.ARRIVED) {
		delete creep.memory.path_step;
		creep.memory.step = 'sourceWork';
		this.sourceWork(creepjs, creep);
	}
	else if (moved) {
		creep.say('move:' + moved);
	}
};
