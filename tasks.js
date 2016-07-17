
var creeps = require('./creeps');

/**
 * Adds a task
 *
 * @param task
 */
module.exports.add = function(task)
{
	if (!Memory.tasks) Memory.tasks = [];
	Memory.tasks.push(task);
};

/**
 * @param callback
 * @param [thisArg] object
 */
module.exports.forEach = function(callback, thisArg)
{
	if (thisArg == undefined) thisArg = 0;
	for (let key in Memory.tasks) if (Memory.tasks.hasOwnProperty(key)) {
		callback.call(thisArg, Memory.tasks[key], key, Memory.tasks);
	}
};

/**
 * @param callback
 * @param [thisArg] object
 */
module.exports.forEachUnaffected = function(callback, thisArg)
{
	if (thisArg == undefined) thisArg = 0;
	var unaffected = this.unaffected();
	for (let key in unaffected) if (unaffected.hasOwnProperty(key)) {
		callback.call(thisArg, unaffected[key], key, unaffected);
	}
};

/**
 * Returns unaffected tasks
 */
module.exports.unaffected = function()
{
	var affected = {};
	creeps.forEach(function(creep) {
		if (creep.memory.task !== undefined) {
			affected[creep.memory.task] = true;
		}
	});

	var unaffected = {};
	for (let task in Memory.tasks) if (Memory.tasks.hasOwnProperty(task)) {
		if (!affected[task]) {
			unaffected[task] = Memory.tasks[task];
		}
	}

	return unaffected;
};
