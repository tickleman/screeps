
module.exports.bappli = [
	'Baptiste', 'Benoit', 'David', 'Geraldine', 'Gilles', 'Hoel', 'Michel', 'Olivier', 'Philippe', 'Pierrick', 'Remi',
	'Sebastien', 'Thomas', 'Zhuo'
];

module.exports.fightclub = [
	'Brad', 'David', 'Edward', 'Eion', 'Jared', 'Helena', 'Marla', 'Meat', 'Richard', 'Ricky', 'Robert', 'Tyler', 'Zach'
];

module.exports.use_names = ['bappli', 'fightclub'];

module.exports.chooseName = function()
{
	var name;
	var creeps_count = _.filter(Game.creeps).length;
	for (let names of this.use_names) {
		if (creeps_count < this[names].length) {
			let retry = 100;
			for (;
				retry && (!name || Game.creeps[name]);
				name = this[names][Math.floor(Math.random() * this[names].length)], retry --
			) {}
			if (!Game.creeps[name]) {
				return name;
			}
		}
		creeps_count -= this[names].length;
	}
	return undefined;
};
