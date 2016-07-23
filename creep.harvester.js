/**
 * The heavy harvester :
 * - goes (slowly) to a free source
 * - stays near it for its all its life
 * - it harvests the energy (10 / tick) and throw it on the ground
 */

module.exports.__proto__ = require('./creep');

/**
 * Body parts for a heavy harvester
 * MOVE, WORK x 5
 * - consume 550 energy units
 */
module.exports.body_parts = [MOVE, WORK, WORK, WORK, WORK, WORK];

module.exports.role          = 'harvester';
module.exports.single_source = true;
module.exports.target_work   = false;
