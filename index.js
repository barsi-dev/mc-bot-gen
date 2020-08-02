const { prefix: PRE, token: TOKEN } = require('./config.json');
const discord = require('discord.js');
const mineflayer = require('mineflayer');

const client = new discord.Client();

let botList = new Map();
let cooldown = new Set();

let channel;

client.once('ready', () => {
	console.log('Bot online!');
	console.log('/bot new <host> <username>');
	console.log('/bot del <username>');
});

client.on('message', (message) => {
	if (!message.content.startsWith(PRE) || message.author.bot) return;
	const args = message.content.slice(PRE.length).split(' ');
	const commandName = args.shift().toLowerCase();
	channel = message.channel;

	if (commandName === 'bot') {
		if (!message.member.roles.cache.has('735080627652526130'))
			return message.channel.send(
				`Sorry, only 'The Boys' can use this command`
			);

		if (args[0] === 'list') return displayBotList();

		if (cooldown.has(message.author.id))
			return message.channel.send(
				'You have to wait 5 seconds between commands'
			);

		switch (args[0]) {
			case 'new':
				startCrackedBot(args.slice(1));
				break;
			case 'del':
				deleteBot(args[1]);
				break;
		}

		cooldown.add(message.author.id);

		setTimeout(() => {
			cooldown.delete(message.author.id);
		}, 5000);
	}
});

client.login(TOKEN);

async function startCrackedBot(args) {
	if (args.length < 2)
		return channel.send(
			`Too few arguments to start a bot '/bot new <host> <username>'`
		);

	let bot = await mineflayer.createBot({
		host: args[0],
		username: args[1],
	});

	console.log(`Bot ${args[1]} has been created`);
	channel.send(`Bot ${args[1]} has been created`);

	botList.set(args[1], bot);
}

function deleteBot(name) {
	let bot = botList.get(name);

	if (!bot) {
		console.log(`No such bot exists`);
		return channel.send(`No such bot exists`);
	}
	bot.end();

	channel.send(`Bot ${name} has been stopped`);
	console.log(`Bot ${name} has been stopped`);

	botList.delete(name);
	channel = null;
}

function displayBotList() {
	let b = '';

	for (let key of botList.keys()) {
		b += ` ${key}\n`;
	}

	if (!b) return channel.send('No bots are alive');

	console.log(b);
	channel.send(`\`\`\`${b}\`\`\``);
}
