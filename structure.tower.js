module.exports =
{

	/**
	 * @param tower Structure
	 **/
	run: function(tower)
	{
		if (tower.energy) {
			if (!Memory.towers) {
				Memory.towers = {};
			}
			// find target
			if (!Memory.towers[tower.id] || !Memory.towers[tower.id].target) {
				// priority to hostile creeps
				var closest_hostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
				if (closest_hostile) {
					Memory.towers[tower.id] = { action: 'attack', target: closest_hostile.id };
				}
				// then, repair damaged structures
				else {
					var closest_damaged = tower.pos.findClosestByRange(FIND_STRUCTURES, { filter: structure => structure.hits < structure.hitsMax });
					if (closest_damaged) {
						Memory.towers[tower.id] = { action: 'repair', target: closest_damaged.id };
					}
				}
			}
			else {
				var target = Game.getObjectById(Memory.towers[tower.id].target);
				// target was destroyed
				if (!target) {
					delete Memory.towers[tower.id];
				}
				// attack
				else if (Memory.towers[tower.id].action == 'attack') {
					tower.attack(target);
				}
				// repair
				else if (Memory.towers[tower.id].action == 'repair') {
					tower.repair(target);
					// repaired
					if (target.hits == target.hitsMax) {
						delete Memory.towers[tower.id];
					}
				}
			}
		}
	}

};
