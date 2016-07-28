
var messages = require('./messages');
var objects  = require('./objects');

/**
 * Source work : if source job is not done, then move to source, then do the job
 *
 * @param creepjs
 * @param creep Creep
 */
module.exports.sourceWork = function(creepjs, creep)
{
	let error = creepjs.sourceWork(creep);
	if (error == creepjs.NEXT_STEP) creepjs.nextStep(creep, 'targetWork');
	if (error == ERR_NOT_IN_RANGE)  creep.moveTo(objects.get(creep, creep.memory.source));
	else if (error)                 creep.say('s:' + messages.error(error));
};

/**
 * Target work : if target work is not done, then move to target, then do the job
 *
 * @param creepjs
 * @param creep Creep
 */
module.exports.targetWork = function(creepjs, creep)
{
	let error = creepjs.targetWork(creep);
	if (error == creepjs.NEXT_STEP)     creepjs.nextStep(creep, 'sourceWork');
	else if (error == ERR_NOT_IN_RANGE) creep.moveTo(objects.get(creep, creep.memory.target));
	else if (error)                     creep.say('t:' + messages.error(error));
};

/**
 * Basic not planned work : search source, fill, search target, target work, then loop
 *
 * @param creepjs
 * @param creep Creep
 */
module.exports.work = function(creepjs, creep)
{
	if (!creep.memory.step) creepjs.nextStep(creep, 'spawning');
	switch (creep.memory.step) {
		case 'spawning':   if (!creep.spawning) creepjs.nextStep(creep, 'sourceWork'); break;
		case 'goToSource': creepjs.nextStep(creep, 'sourceWork'); break;
		case 'goToTarget': creepjs.nextStep(creep, 'targetWork'); break;
	}
	switch (creep.memory.step) {
		case 'sourceWork': this.sourceWork(creepjs, creep); break;
		case 'targetWork': this.targetWork(creepjs, creep); break;
		default: creepjs.nextStep(creep, 'spawning');
	}
};
