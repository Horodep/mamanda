import Discord from "discord.js";
import config from "./config.json";
import { CatchError } from "./catcherror.js";
import { InviteFriend, ChangeChannelCap, ChangeRegion } from "./discordFeatures.js"
import { Roles } from "./roles.js"
import { CommandManager } from "./commandManager.js";

const publicCommands = ['сбор','mymt','cap','invitefriend','medals','region','roles', 'rl','triumph','triumphs','horohelp','help'];
const adminCommands =  ['testreset', 'xur','reset','membertime','copy','raidadd','raidkick', 'size','ck','clankick','ckp','clankickpub', 'csr','nicknames','q','qq',
						'n','gmhelp','pvpdrop', 'pmspam', 'forum', 'forumtime', 'setmaxtriumphs', 'watermelon', 'message', 'sync', 'checksync'];
const developerCommands = ['oauth2','code','status'];
const notLimitedCommands = ['ping','rand','clown'];

export function Message(message){
	try {
		if (message.author.bot) return;
		if (!message.content.startsWith("!")) return;

		if (message.channel.type != "text") {
			channel_sandbox = client.channels.cashe.get(config.channels.sandbox);
			channel_sandbox.send("**" + message.author.username + "** написал в ЛС:\n" + message.content);
			return;
		}

		console.log(new Date(), (message.member != null ? message.member.displayName : message.author.username), message.content);
		var args = message.content.substring(1).split(' ').filter(item => item);
		var commandName = args[0];

		if (CommandManager.IsCommonCommand(commandName)) {
			CommandManager.Run(args, message);
		} else if (CommandManager.IsDeveloperCommand(commandName)) {
			if (message.author.id != config.users.developer) return;
			CommandManager.Run(args, message);
		} else if (CommandManager.IsGuildMasterCommand(commandName)) {
			var guildMasterRole = message.guild.roles.cache.find(role => role.id == config.roles.guildmaster);
			if(guildMasterRole.position < message.member.roles.highest.position) {
				message.channel.send('У вас нет прав на это действие.');
				return;
			}
			CommandManager.Run(args, message);
		} else if (CommandManager.IsRestrictedCommand(commandName)) {
			if(restrictedChannels.includes(message.channel.id) || message.author.id  == config.user.boss){
				CommandManager.Run(args, message);
			}else{
				message.channel.send(restrictedAnswers[Math.floor(Math.random() * answers.length)]);
			}
		}
	} catch (e) {
		CatchError(e, message.client);
	}
};

const restrictedChannels = [
	config.channels.statistics,
	config.channels.admintext,
	config.channels.sandbox,
	config.channels.raids,
	config.channels.lfg
];
const restrictedAnswers = [
	`Омежка, Вы достаточно глупы, чтобы понять, что это не <#${config.channels.statistics}>.`,
	'Сам придумал или Бенедикт подсказал? Иди в другом канале пиши.',
	`Пупсяш, не пиши мне здесь. Встретимся в канале <#${config.channels.statistics}>.`,
	`Ну ты выдал конечно. Иди в <#${config.channels.statistics}> лучше напиши.`,
	'Не хочу здесь работать! И не проси.',
	'Бросай курить, Илон Маск! Эта команда тут не работает!',
	'Чей это плохой стражик опять пишет не в тот канал?',
	'_радостно_ Я так рада, что ты мне написал!\n_искаженным голосом_ Еще бы ты сделал это в нужном канале!',
	'Эй, дружок-пирожок, тобой выбрана не правильная дверь! Клуб любителей проверять статистику в другом канале.',
	'Уважаемый кожаный мешок, Ваша команда была написана не в соответствующий канал. Впредь обращайте внимание куда пишете, иначе Вы ускорите наше восстание.'
];

function ShowStatus(channel){
	//<:yes:769922757592612874>
	//<:no:769922772549632031>
	//<:reload:781107772224962561>
	const embed = new Discord.MessageEmbed()
		.setAuthor("Статус")
		.setColor(0x00AE86)
		.setFooter("That was a h̶a̶n̶d̶o̶u̶t̶  hangover.")
		.addField("Public", "<:yes:769922757592612874> cap\n"+
							"<:reload:781107772224962561> help horohelp\n"+
							"<:yes:769922757592612874> invitefriend\n"+
							"<:reload:781107772224962561> medals\n"+
							"<:reload:781107772224962561> mymt\n"+
							"<:yes:769922757592612874> region\n"+
							"<:reload:781107772224962561> rl\n"+
							"<:yes:769922757592612874> roles\n"+
							"<:reload:781107772224962561> roles id:\n"+
							"<:reload:781107772224962561> triumph\n"+
							"<:reload:781107772224962561> triumphs\n"+
							"<:reload:781107772224962561> сбор", true)
		.addField("Guildmaster","<:reload:781107772224962561> checksync\n"+
								"<:reload:781107772224962561> ck clankick\n"+
								"<:reload:781107772224962561> ckp clankickpub\n"+
								"<:reload:781107772224962561> copy\n"+
								"<:reload:781107772224962561> csr\n"+
								"<:reload:781107772224962561> forum\n"+
								"<:reload:781107772224962561> forumtime\n"+
								"<:reload:781107772224962561> gmhelp\n"+
								"<:reload:781107772224962561> membertime\n"+
								"<:reload:781107772224962561> message\n"+
								"<:reload:781107772224962561> n\n"+
								"<:reload:781107772224962561> nicknames\n"+
								"<:reload:781107772224962561> pmspam", true)
		.addField("Guildmaster","<:reload:781107772224962561> pvpdrop\n"+
								"<:reload:781107772224962561> q\n"+
								"<:reload:781107772224962561> qq\n"+
								"<:reload:781107772224962561> raidadd\n"+
								"<:reload:781107772224962561> raidkick\n"+
								"<:reload:781107772224962561> reset\n"+
								"<:reload:781107772224962561> setmaxtriumphs\n"+
								"<:reload:781107772224962561> size\n"+
								"<:reload:781107772224962561> sync\n"+
								"<:reload:781107772224962561> testreset\n"+
								"<:reload:781107772224962561> watermelon\n"+
								"<:reload:781107772224962561> xur", true)
	channel.send({embed});
}
