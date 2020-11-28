import { MessageEmbed } from "discord.js";
import config from "./config.json";
import { CatchError } from "./catcherror.js";

export function ShowNewbieList(message) {
	var newbieList = [];
	message.guild.roles.cache.find(role => role.id == config.roles.newbie).members.forEach(function (member) {
		var secondsOnServer = Date.now() - member.joinedTimestamp;
		var daysOnServer = Math.round(secondsOnServer / (1000 * 60 * 60 * 24));
		newbieList.push(`\`${daysOnServer}d\` <@${member.user.id}>`);
	});
	newbieList.sort();
	message.channel.send(newbieList.join('\n'));
}
export function ShowQueueList(message) {
	var queueList = [];
	message.guild.roles.cache.find(role => role.id == config.roles.queue).members.forEach(function (member) {
		var secondsOnServer = Date.now() - member.joinedTimestamp;
		var daysOnServer = Math.round(secondsOnServer / (1000 * 60 * 60 * 24));
		queueList.push("`" + daysOnServer + "d` <@" + member.user.id + ">");
	});
	queueList.sort();
	message.channel.send(queueList.join('\n'));
}
export function ShowQueueReqestsList(message) {
	var counterOfMessagesByUser = [];
	var counterOfReactsOnMessage = [];
	message.guild.roles.cache.find(role => role.id == config.roles.queue).members
		.sort(function (a, b) { return a.joinedTimestamp > b.joinedTimestamp ? 1 : -1 })
		.forEach(function (member) {
			var secondsOnServer = Date.now() - member.joinedTimestamp;
			var daysOnServer = Math.round(secondsOnServer / (1000 * 60 * 60 * 24));
			var headerText = `Заявка от <@${member.user.id}> (дней на сервере: ${daysOnServer}) `;
			var emojis = "";
			var requestBody = "";

			var queueChannel = message.client.channels.cache.get(config.channels.entrance);
			counterOfMessagesByUser[member.id] = 0;
			queueChannel.messages.fetch({ limit: 100 }).then(messages => {
				messages
					.sort((a, b) => a.id > b.id ? 1 : -1)
					.filter(m => m.author.id == member.user.id)
					.forEach(async function (requestMessage) {
						try {
							counterOfMessagesByUser[member.id]++;
							counterOfReactsOnMessage[requestMessage.id] = 0;
							requestBody += requestMessage.content;

							requestMessage.reactions.cache.each(async function(reaction){
								counterOfReactsOnMessage[requestMessage.id]++;
								emojis += ` ${reaction.emoji}`;
								var users = await reaction.users.fetch();
								for (let user of users) {
									emojis += " **" + user[1].username + "**";
								}
								message.channel.send(headerText + emojis + "```" + requestBody + " ```");
							})
							if (counterOfReactsOnMessage[requestMessage.id] == 0) 
								message.channel.send(headerText + emojis + "```" + requestBody + " ```");
						} catch (e) {
							CatchError(e, message.channel);
						}
					});
				return headerText + emojis + "```" + requestBody + " ```";
			}).then(messageText => {
				if (messageText.endsWith("``` ```")) messageText = messageText.replace("``` ```", "```нет заявки```");
				setTimeout(function () {
					if (counterOfMessagesByUser[member.id] == 0) message.channel.send(messageText);
				}, 500);
			})
		});
}