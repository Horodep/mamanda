import config from "../config.json";
import { CatchError } from "../catcherror.js";
import { CommandManager } from "../commandManager.js";

export function Message(message){
	try {
		if (message.author.bot || !message.content.startsWith("!")) return;
		
		if (message.channel.type != "text") {
			channel_sandbox = client.channels.cashe.get(config.channels.sandbox);
			channel_sandbox.send("**" + message.author.username + "** написал в ЛС:\n" + message.content);
			return;
		}

		console.log((message.member != null ? message.member.displayName : message.author.username), message.content);
		var args = message.content.substring(1).split(' ').filter(item => item);
		var commandName = args[0];

		if (CommandManager.IsCommonCommand(commandName)) {
			CommandManager.Run(args, message);
		}
		if (CommandManager.IsDeveloperCommand(commandName)) {
			if (message.author.id != config.users.developer) return;
			CommandManager.Run(args, message);
		}
		if (CommandManager.IsGuildMasterCommand(commandName)) {
			var guildMasterRole = message.guild.roles.cache.find(role => role.id == config.roles.guildmaster);
			if(guildMasterRole.position <= message.member.roles.highest.position) {
				CommandManager.Run(args, message);
			}else{
				message.channel.send('У вас нет прав на это действие.');
			}
		}
		if (CommandManager.IsRestrictedCommand(commandName)) {
			if(restrictedChannels.includes(message.channel.id) || message.author.id  == config.users.boss){
				CommandManager.Run(args, message);
			}else{
				message.channel.send(restrictedAnswers[Math.floor(Math.random() * restrictedAnswers.length)]);
			}
		}
	} catch (e) {
		CatchError(e, message.channel);
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
