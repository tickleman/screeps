
var constants = require('./constants');

/**
 * Body parts costs
 *
 * @type int[]
 */
module.exports.COST = [];
module.exports.COST[ATTACK]        = 80;
module.exports.COST[CARRY]         = 50;
module.exports.COST[CLAIM]         = 50;
module.exports.COST[HEAL]          = 150;
module.exports.COST[MOVE]          = 50;
module.exports.COST[RANGED_ATTACK] = 150;
module.exports.COST[TOUGH]         = 10;
module.exports.COST[WORK]          = 100;

/**
 * Calculate the energy cost to spawn a creep with these body parts
 *
 * @param body_parts int[] if not set, this.body_parts will be used for this calculation
 * @return int energy cost
 */
module.exports.cost = function(body_parts)
{
	if (!body_parts) {
		body_parts = this.body_parts;
	}
	var cost = 0;
	for (let body_part of body_parts) {
		cost += this.COST[body_part];
	}
	return cost;
};

/**
 * Calculate body parts you can build immediately
 *
 * @param from_parts integer[] @default this.body_parts
 * @param available_energy integer @default Game.spawns[constants.spawn].room.energyAvailable
 * @return integer[] null if the minimum body parts count costs too much energy
 */
module.exports.parts = function(from_parts, available_energy)
{
	if (from_parts == undefined) {
		from_parts = this.body_parts;
	}
	if (available_energy == undefined) {
		available_energy = Game.spawns[constants.spawn].room.energyAvailable;
	}
	var cost = this.cost(from_parts);
	if (available_energy >= cost) {
		return from_parts;
	}
	// parts count and ratio = 1 for each body part type
	var body_parts = [];
	var can_remove = 0;
	var parts = [];
	var ratios = [];
	for (let body_part of from_parts) {
		body_parts.push(body_part);
		if (parts[body_part]) {
			can_remove ++;
			parts[body_part] ++;
		}
		else {
			parts[body_part] = 1;
		}
		ratios[body_part] = 1;
	}
	// remove body parts until there is enough available energy to spawn the creep
	while (can_remove && (this.cost(body_parts) > available_energy)) {
		// choose the body part with quantity > 1 and with the greater ratio
		let chosen;
		for (let body_part in parts) if (parts.hasOwnProperty(body_part)) {
			let quantity = parts[body_part];
			if ((quantity > 1) && (!chosen || (ratios[body_part] > ratios[chosen]))) {
				chosen = body_part;
			}
		}
		// remove the chosen body part
		for (let i in body_parts) if (body_parts.hasOwnProperty(i) && (body_parts[i] === chosen)) {
			body_parts.splice(i, 1);
			break;
		}
		parts[chosen] --;
		ratios[chosen] = ratios[chosen] * parts[chosen] / (parts[chosen] + 1);
		can_remove --;
	}
	// got it
	return (available_energy >= this.cost(body_parts)) ? body_parts : null;
};
