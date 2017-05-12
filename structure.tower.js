
/**
 * @param tower Structure
 **/
module.exports.run = function(tower)
{
	if (tower.energy) {
		if (!Memory.towers) {
			Memory.towers = {};
		}
		// find target
		if (!Memory.towers[tower.id] || !Memory.towers[tower.id].target) {
			// priority to the nearest hostile creep
			let closest_hostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
			if (closest_hostile) {
				Memory.towers[tower.id] = { action: 'attack', target: closest_hostile.id };
			}
			// then, repair most damaged structures (but keep enough energy in case of attack
			else if ((tower.energy / tower.energyCapacity) > .85) {
				let most_damaged_percent = 1;
				let most_damaged_structure = null;
				let secondary_damaged_percent = 1;
				tower.room.find(FIND_STRUCTURES, { filter: function(structure) {
					let percent = structure.hits / structure.hitsMax;
					if (percent < most_damaged_percent) {
						if (most_damaged_percent) {
							secondary_damaged_percent = most_damaged_percent;
						}
						most_damaged_percent = percent;
						most_damaged_structure = structure;
					}
					else if (percent < secondary_damaged_percent) {
						secondary_damaged_percent = percent;
					}
				}});
				if (most_damaged_structure) {
					Memory.towers[tower.id] = {
						action: 'repair',
						target: most_damaged_structure.id,
						until:  secondary_damaged_percent
					};
				}
			}
		}
		else {
			let memory = Memory.towers[tower.id];
			let target = Game.getObjectById(memory.target);
			// target was destroyed
			if (!target) {
				delete Memory.towers[tower.id];
			}
			// attack
			else if (memory.action === 'attack') {
				tower.attack(target);
			}
			// repair
			else if (memory.action === 'repair') {
				tower.repair(target);
				// repaired or not the most damaged structure
				if (
					(target.hits === target.hitsMax)
					|| ((target.hits / target.hitsMax) > memory.until)
					|| ((tower.energy / tower.energyCapacity) <= .8)
				) {
					delete Memory.towers[tower.id];
				}
			}
		}
	}
};
