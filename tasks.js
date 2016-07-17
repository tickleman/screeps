
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
 * Returns unaffected tasks
 */
module.exports.unaffected = function()
{
	var unaffected = {};
	var affected = {};
	for (let creep in Memory.creeps) if (Memory.creeps.hasOwnProperty(creep)) {
		creep = Memory.creeps[creep];
		if (creep.task) {
			affected[creep.task] = true;
		}
	}
	for (let task in Memory.tasks) if (Memory.tasks.hasOwnProperty(task)) {
		if (!affected[task]) {
			unaffected[task] = Memory.tasks[task];
		}
	}
	return unaffected;
};
