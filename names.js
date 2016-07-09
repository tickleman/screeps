
module.exports.bappli = [
	'Baptiste', 'Benoît', 'Géraldine', 'Gilles', 'Hoel', 'Olivier', 'Philippe', 'Pierrick', 'Rémi', 'Sébastien', 'Thomas', 'Zhuo'
];

module.exports.fightclub = [
	'Brad', 'David', 'Edward', 'Eion', 'Jared', 'Helena', 'Marla', 'Meat', 'Richard', 'Ricky', 'Robert', 'Tyler', 'Zach'
];

module.exports.use_names = ['bappli', 'fightclub'];

module.exports.chooseName = function()
{
	var name;
	for (var i = 0; i < this.use_names.length; i ++) {
		if (Game.creeps.length < this[this.use_names[i]].length) {
			for (; !name || Game.creeps[name]; name = this.names[Math.floor(Math.random() * this.names.length)]) {}
			return name;
		}
	}
	return undefined;
};
