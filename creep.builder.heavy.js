/**
 * The heavy builder :
 * - goes (slowly) to the construction site
 * - stays near it until it is built
 * - it builds the construction site as fast as it cans
 */

module.exports.__proto__ = require('creep.builder');

/**
 * Body parts for a heavy builder
 * MOVE, WORK x 5
 * - consume 550 energy units
 */
module.exports.body_parts = [MOVE, WORK, WORK, WORK, WORK, WORK];

/**
 * Always full : we never fill the heavy builder : a carrier will bring him energy
 *
 * @return boolean true
 **/
module.exports.isFull = function()
{
	return true;
};

/**
 * This creep has no source
 *
 * @returns array []
 */
module.exports.sources = function()
{
	return [];
};
