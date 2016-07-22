
var path = require('./path');

/**
 * Task-planned work : depends on tasks steps
 *
 * @deprecated
 * @param creepjs
 * @param creep Creep
 */
module.exports.workTask = function(creepjs, creep)
{
	if (creepjs.DEBUG) console.log(creep.name + ' task ' + creep.memory.task);
	var task = Memory.tasks[creep.memory.task];
	// prepare to go to init start point or start init sequence in already in start point
	if (!creep.memory.step) {
		creep.memory.step = 'go';
		creep.memory.path = path.shift(path.calculate(creep, path.startRoomPosition(task.init)), creep.pos);
		if (creepjs.DEBUG) console.log('- go ' + creep.memory.path);
		creep.memory.step_pos = 4;
		if (creep.memory.step_pos >= creep.memory.path) {
			delete creep.memory.path;
			creep.memory.step = 'init';
			if (creepjs.DEBUG) console.log('- init instead of go ' + task.init);
		}
	}
	// go to init start point
	if (creep.memory.step == 'go') {
		if (creepjs.DEBUG) console.log('- go ' + creep.memory.path + ' step ' + creep.memory.step_pos);
		if (!creep.move(creep.memory.path[creep.memory.step_pos])) {
			if (creepjs.DEBUG) console.log('- next step');
			creep.memory.step_pos ++;
			if (creep.memory.step_pos >= creep.memory.path.length) {
				delete creep.memory.path;
				creep.memory.step = 'init';
				creep.memory.step_pos = 4;
				if (creepjs.DEBUG) console.log('- init ' + task.init);
			}
		}
		else {
			creep.say('wait');
		}
	}
	// initialization path
	else if (creep.memory.step == 'init') {
		if (creepjs.DEBUG) console.log('- init ' + task.init + ' step ' + creep.memory.step_pos);
		if (!creep.move(task.init[creep.memory.step_pos])) {
			if (creepjs.DEBUG) console.log('- next step');
			creep.memory.step_pos ++;
			if (creep.memory.step_pos >= task.init.length) {
				creep.memory.step = 'work';
				if (task.path) creep.memory.step_pos = task.path.length;
				else delete creep.memory.step_pos;
				if (creepjs.DEBUG) console.log('- work ' + task.path);
			}
		}
		else {
			creep.say('wait');
		}
	}
	// work path
	else if (creep.memory.step == 'work') {
		if (task.path) {
			if (creepjs.DEBUG) console.log('- work ' + task.path + ' step ' + creep.memory.step_pos);
			// - start point : source job (fill)
			if (creep.memory.step_pos >= task.path.length) {
				if (creepjs.DEBUG) console.log('- fill');
				if (creepjs.sourceJobDone(creep) || creepjs.sourceJob(creep)) {
					if (creepjs.DEBUG) console.log('- loop');
					creep.memory.step_pos = 4;
				}
			}
			// - arrival point : target job
			if (task.path[creep.memory.step_pos] == path.WAYPOINT) {
				if (creepjs.DEBUG) console.log('- waypoint');
				let target = Game.getObjectById(creep.memory.target);
				if (!target) {
					target = creepjs.findTarget(creep);
				}
				if (creepjs.targetJobDone(creep)) {
					if (creepjs.DEBUG) console.log('- target job done : next step');
					creep.memory.step_pos ++;
				}
				else {
					if (creepjs.DEBUG) console.log('- execute target job');
					let error = creepjs.targetJob(creep);
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
			if (creepjs.DEBUG) console.log('- work');
			if (creepjs.sourceJobDone(creep) || creepjs.sourceJob(creep)) {
				let error;
				let target = Game.getObjectById(creep.memory.target);
				if (!target || creepjs.targetJobDone(creep, target)) {
					target = creepjs.findTarget(creep);
				}
				if (error = creepjs.targetJob(creep, target)) {
					creep.say(error.toString());
				}
			}
		}
	}
};
