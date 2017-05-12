
module.exports.bappli = [
	'Baptiste', 'Benoit', 'David', 'Geraldine', 'Gilles', 'Hoel', 'Michel', 'Olivier', 'Philippe', 'Pierrick', 'Remi',
	'Sebastien', 'Thomas', 'Zhuo'
];

module.exports.fight_club = [
	'Brad', 'David', 'Edward', 'Eion', 'Jared', 'Helena', 'Marla', 'Meat', 'Richard', 'Ricky', 'Robert', 'Tyler', 'Zach'
];

// source : https://fr.wikipedia.org/wiki/Personnages_de_Game_of_Thrones
module.exports.game_of_thrones = [
	'Robin', 'Lysa', 'Anya', 'Yohn', 'Donnel', 'Mord', 'Shagga', 'Timett', 'Hugh', 'Vardis', 'Tommen', 'Robert',
	'Joffrey', 'Myrcella', 'Stannis', 'Selyse', 'Shirren', 'Davos', 'Melisandre', 'Matthos', 'Cressen', 'Renly', 'Ramsay',
	'Roose', 'Walda', 'Myranda', 'Locke', 'Walder', 'Lothar', 'Theon', 'Balon', 'Yara', 'Euron', 'Dagmer', 'Tyrion',
	'Jaime', 'Cersei', 'Kevan', 'Lancel', 'Tywin', 'Alton', 'Martyn', 'Willem', 'Gregor', 'Amory', 'Polliver', 'Tickler',
	'Doran', 'Ellaria', 'Trystane', 'Tyene', 'Nymeria', 'Obara', 'Areo', 'Oberyn', 'Jon', 'Sansa', 'Arya', 'Bran',
	'Rickon', 'Eddard', 'Catelyn', 'Robb', 'Talisa', 'Osha', 'Hodor', 'Meera', 'Jojen', 'Luwin', 'Rodrik', 'Jory', 'Nan',
	'Septa', 'Rockard', 'Torhen', 'Daenerys', 'Viserys', 'Jorah', 'Daario', 'Missandei', 'GreyWorm', 'Barristan',
	'Kovarro', 'Rakharo', 'Doreah', 'Irri', 'Edmure', 'Brynden', 'Roslin', 'Hoster', 'Margaery', 'Olenna', 'Loras',
	'Mace', 'Petyr', 'Varys', 'Pycelle', 'Qyburn', 'Ilyn', 'Hallyne', 'Meryn', 'Dontos', 'Brienne', 'Podrick', 'Bronn',
	'Sandor', 'Gendry', 'Marillion', 'Tobho', 'Beric', 'Thoros', 'Anguy', 'Shae', 'Ros', 'Lommy', 'Rorge', 'Biter',
	'Syrio', 'Mycah', 'Jaqen', 'Tychos', 'Salladhor', 'Yezzan', 'Illyrio', 'Quaithe', 'Drogo', 'Dizdahr', 'Qotho',
	'Mirri', 'Xaro', 'Pyat', 'Kraznys', 'Prendahl', 'Samwell', 'Alliser', 'Eddison', 'Othell', 'Olly', 'Bower', 'Benjen',
	'Jeor', 'Aemon', 'Janos', 'Yoren', 'Qhorin', 'Green', 'Rast', 'Pypar', 'Karl', 'Will', 'Waymar', 'Tormund', 'Vere',
	'Leaf', 'Mance', 'Ygrid', 'Cliquefrac', 'Orell', 'Craster', 'Styr', 'Wun', 'Drogon', 'Rhaegal', 'Viserion', 'Summer',
	'Ghost', 'Shaggydog', 'Greywind', 'Lady'
];

module.exports.use_names = ['game_of_thrones', 'fight_club', 'bappli'];

module.exports.chooseName = function()
{
	let name;
	let creeps_count = _.filter(Game.creeps).length;
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
