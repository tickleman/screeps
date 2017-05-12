/**
 * Unit tests
 *
 * Run them from the console with :
 * require('tests').run()
 */

/**
 * Tests with errors counter
 *
 * @type number
 */
module.exports.errors = 0;

/**
 * Passed tests counter
 *
 * @type number
 */
module.exports.passed = 0;

/**
 * Test prefix for display
 *
 * @type string
 */
module.exports.prefix = 'test';

/**
 * Unit test assert
 *
 * @param name   the unique identifier for the test
 * @param test   the tested value
 * @param assume the assumed value
 */
module.exports.assert = function(name, test, assume)
{
	if (this.equals(test, assume)) {
		this.passed ++;
	}
	else {
		console.log('! ' + this.prefix + '.' + name + ' : ' + this.dump(test) + ' / ' + this.dump(assume));
		this.errors ++;
	}
};

/**
 * @param value mixed
 * @return string
 */
module.exports.dump = function(value)
{
	if (typeof value === 'undefined') return 'undefined';
	if (typeof value !== 'object')    return value.toString();

	let result = Array.isArray(value) ? '[' : '{';
	let already = false;
	for (let i in value) if (value.hasOwnProperty(i)) {
		if (already) result = result.concat(', '); else already = true;
		result = result.concat(i.toString(), ': ', this.dump(value[i]));
	}
	return result.concat(Array.isArray(value) ? ']' : '}');
};

/**
 * Test if two values / objects are equal
 *
 * @param test
 * @param assume
 * @returns boolean
 */
module.exports.equals = function(test, assume)
{
	if (
		((typeof test) !== (typeof assume))
		|| ((test === null) && (assume !== null))
		|| ((test !== null) && (assume === null))
	) {
		return false;
	}
	if (typeof test === 'object') {
		for (let i in test) if (test.hasOwnProperty(i)) {
			if (!this.equals(test[i], assume[i])) {
				return false;
			}
		}
		for (let i in assume) if (assume.hasOwnProperty(i)) {
			if (!this.equals(test[i], assume[i])) {
				return false;
			}
		}
	}
	else if (test !== assume) {
		return false;
	}
	return true;
};

/**
 * Run tests
 *
 * @return string '100%' if ok, '50%' if 5 of 10 tests pass, etc.
 */
module.exports.run = function()
{
	this.body();
	this.path();
	console.log(
		(this.errors + this.passed) + ' tests'
		+ ' - ' + this.passed + ' passed'
		+ (this.errors ? (' - ' + this.errors + ' errors') : '')
	);
	return Math.ceil(this.passed / (this.errors + this.passed) * 100) + '%';
};

//--------------------------------------------------------------------------------------------------------------- body

/**
 * Body unit tests
 */
let body = require('./body');
module.exports.body = function()
{
	this.prefix = 'body.cost';
	this.assert('initial',       body.cost([CARRY, MOVE, WORK]), 200);
	this.assert('harvester',     body.cost([MOVE, WORK, WORK, WORK, WORK, WORK]), 550);
	this.assert('carrier.plain', body.cost([CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE]), 500);
	this.assert('carrier.road',  body.cost([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]), 500);

	this.prefix = 'body.parts';
	this.assert('initial',       body.parts([CARRY, MOVE, WORK], 200), [CARRY, MOVE, WORK]);
	this.assert('notEnough',     body.parts([CARRY, MOVE, WORK], 199), null);
	this.assert('reduce',        body.parts([CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, WORK, WORK, WORK], 200), [CARRY, MOVE, WORK]);
	this.assert('equilibrium',   body.parts([CARRY, MOVE, MOVE, WORK, WORK, WORK, WORK], 300), [CARRY, MOVE, WORK, WORK]);
	this.assert('harvester',     body.parts([MOVE, WORK, WORK, WORK, WORK, WORK], 300), [MOVE, WORK, WORK]);
	this.assert('carrier.plain',
		body.parts([CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], 300),
		[CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]
	);
	let body_parts = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
	this.assert('carrier.road',  body.parts(body_parts, 300), [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE]);
	this.assert('noLoose',       body_parts, [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]);
};

//--------------------------------------------------------------------------------------------------------------- path

/**
 * Path calculation tests
 */
let path = require('./path');
module.exports.path = function()
{
	let source = {x: 1, y: 1};
	let test = '101033w8';

	this.prefix = 'path.direction';
	this.assert('top-left',     path.direction(source, {x: 0, y: 0}), TOP_LEFT);
	this.assert('left',         path.direction(source, {x: 0, y: 1}), LEFT);
	this.assert('bottom-left',  path.direction(source, {x: 0, y: 2}), BOTTOM_LEFT);
	this.assert('top-right',    path.direction(source, {x: 2, y: 0}), TOP_RIGHT);
	this.assert('right',        path.direction(source, {x: 2, y: 1}), RIGHT);
	this.assert('bottom-right', path.direction(source, {x: 2, y: 2}), BOTTOM_RIGHT);
	this.assert('top',          path.direction(source, {x: 1, y: 0}), TOP);
	this.assert('bottom',       path.direction(source, {x: 1, y: 2}), BOTTOM);

	this.prefix = 'path.move';
	this.assert('top-left',     path.movePos(source, TOP_LEFT),     {x: 0, y: 0});
	this.assert('left',         path.movePos(source, LEFT),         {x: 0, y: 1});
	this.assert('bottom-left',  path.movePos(source, BOTTOM_LEFT),  {x: 0, y: 2});
	this.assert('top-right',    path.movePos(source, TOP_RIGHT),    {x: 2, y: 0});
	this.assert('right',        path.movePos(source, RIGHT),        {x: 2, y: 1});
	this.assert('bottom-right', path.movePos(source, BOTTOM_RIGHT), {x: 2, y: 2});
	this.assert('top',          path.movePos(source, TOP),          {x: 1, y: 0});
	this.assert('bottom',       path.movePos(source, BOTTOM),       {x: 1, y: 2});

	this.prefix = 'path.step';
	this.assert('0',  path.step(test, 0),       {x: 10, y: 10});
	this.assert('1',  path.step(test, 1),       {x: 11, y: 10});
	this.assert('2',  path.step(test, 2),       {x: 12, y: 10});
	this.assert('3',  path.step(test, 3),       path.WAYPOINT);
	this.assert('3p', path.step(test, 3, true), {x: 12, y: 10});
	this.assert('4',  path.step(test, 4),       {x: 11, y: 9});
	this.assert('5',  path.step(test, 5),       {x: 11, y: 9});
	this.assert('6',  path.step(test, 6),       {x: 11, y: 9});

	this.prefix = 'path';
	this.assert('last',      path.last(test),              {x: 11, y: 9});
	this.assert('length',    path.length(test),            4);
	this.assert('move',      path.movePos(source, TOP_RIGHT), {x: 2, y: 0});
	this.assert('pop',       path.pop(test),               '101033w');
	this.assert('pop2',      path.pop(test, 2),            '101033');
	this.assert('pop3',      path.pop(test, 3),            '10103');
	this.assert('push',      path.push(test,               {x: 11, y: 10}), test + '5');
	this.assert('serialize',
		path.serialize([{x: 10, y: 10}, {x: 11, y: 10}, {x: 12, y: 10}, path.WAYPOINT, {x: 11, y: 9}]), test
	);
	this.assert('shift',     path.shift(test,  {x: 10, y: 9}), '1009533w8');
	this.assert('start',     path.start(test), {x: 10, y: 10});
	this.assert('unserialize',
		path.unserialize(test), [{x: 10, y: 10}, {x: 11, y: 10}, {x: 12, y: 10}, path.WAYPOINT, {x: 11, y: 9}]
	);
	this.assert('unshift1', path.unshift(test),    '11103w8');
	this.assert('unshift0', path.unshift(test, 0), test);
	this.assert('unshift1', path.unshift(test, 1), '11103w8');
	this.assert('unshift2', path.unshift(test, 2), '1210w8');
	this.assert('unshift3', path.unshift(test, 3), '12108');
	this.assert('waypoint', path.waypoint(test), {x: 12, y: 10});
};
