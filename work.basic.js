
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
	let source = creepjs.nextSource(creep);
	if (source) creep.memory.source = source.id ? source.id : source;
	if (!creepjs.sourceJobDone(creep)) {
		let error = creepjs.sourceJob(creep);
		if (error == ERR_NOT_IN_RANGE) creep.moveTo(objects.get(creep, creep.memory.source));
		else if (error) creep.say('s:' + messages.error(error));
	}
	else {
		creep.memory.step = 'targetWork';
	}
};

/**
 * Target work : if target work is not done, then move to target, then do the job
 *
 * @param creepjs
 * @param creep Creep
 */
module.exports.targetWork = function(creepjs, creep)
{
	let target = creepjs.nextTarget(creep);
	if (target) creep.memory.target = target.id ? target.id : target;
	if (!creepjs.targetJobDone(creep)) {
		let error = creepjs.targetJob(creep);
		if (error == ERR_NOT_IN_RANGE) creep.moveTo(objects.get(creep, creep.memory.target));
		else if (error) creep.say('t:' + messages.error(error));
	}
	else {
		creep.memory.step = 'sourceWork';
	}
};

/**
 * Basic not planned work : search source, fill, search target, target work, then loop
 *
 * @param creepjs
 * @param creep Creep
 */
module.exports.work = function(creepjs, creep)
{
	if (!creep.memory.step) creep.memory.step = 'sourceWork';
	switch (creep.memory.step) {
		case 'sourceWork': this.sourceWork(creepjs, creep); break;
		case 'targetWork': this.targetWork(creepjs, creep); break;
	}
};
