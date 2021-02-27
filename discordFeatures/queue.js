import config from "./config.json";
import { MessageEmbed } from "discord.js";
import { CatchError } from "../catcherror.js";

export async function AsyncShowQueueList(message) {
	var queueList = [];
	await message.guild.members.fetch();
	message.guild.members.cache.filter(m => m.roles.cache.size == 1).forEach(function (member) {
		var secondsOnServer = Date.now() - member.joinedTimestamp;
		var daysOnServer = Math.floor(secondsOnServer / (1000 * 60 * 60 * 24));
		queueList.push("`" + daysOnServer + "d` <@" + member.user.id + ">");
	});
	queueList.sort();
	message.channel.send(queueList.join('\n'));
}

export async function AsyncShowQueueReqestsList(message) {
	await message.guild.members.fetch();
	message.guild.members.cache.filter(m => m.roles.cache.size == 1)
		.sort(function (a, b) { return a.joinedTimestamp > b.joinedTimestamp ? 1 : -1; })
		.forEach(member => CreateAndSendGuildRequestMessage(member, message));
}

function CreateAndSendGuildRequestMessage(member, message) {
	var messagesDone = 0;
	var messagesTotal = 0;
	var reactionsDone = 0;
	var reactionsTotal = 0;

	var emojis = "";
	var requestBody = "";
	var lastMessageUrl;

	var queueChannel = message.client.channels.cache.get(config.channels.entrance);
	queueChannel.messages.fetch({ limit: 100 }).then(messages => {
		var userMessages = messages
			.sort((a, b) => a.id > b.id ? 1 : -1)
			.filter(m => m.author.id == member.user.id);
		messagesTotal = userMessages.size;

		userMessages.forEach(async function (requestMessage) {
			try /*need to check if needed*/ {
				requestBody += '\n' + requestMessage.content;

				reactionsTotal += requestMessage.reactions.cache.size;
				requestMessage.reactions.cache.each(async function (reaction) {
					emojis += ` ${reaction.emoji}`;
					var users = await reaction.users.fetch();
					for (let user of users) {
						emojis += " **" + user[1].username + "**";
					}
					reactionsDone++;
				});
				lastMessageUrl = requestMessage.url;
				messagesDone++;
			} catch (e) {
				CatchError(e, message.channel); //emojis
			}
		});
		return;
	}).then(() => {
		setTimeout(() => {
			while (messagesDone != messagesTotal && reactionsDone != reactionsTotal) { };
			message.channel.send(FormGuildRequestEmbed(member, requestBody, lastMessageUrl, emojis));
		}, 500);
	});
}

function FormGuildRequestEmbed(member, text, url, reactions) {
	var secondsOnServer = Date.now() - member.joinedTimestamp;
	var daysOnServer = Math.floor(secondsOnServer / (1000 * 60 * 60 * 24));
	var dataField = "<@" + member.user.id + ">\n" +
		(url ? "[message link](" + url + ")\n" : "") +
		(reactions ?? "");
	var color = 0x00BFFF;
	if (reactions.includes('no')) color = 0xDE0C00;
	if (reactions.includes('yes')) color = 0x1AAA00;
	var embed = new MessageEmbed()
		.addField(`Заявка`, text == "" ? "нет заявки" : text, true)
		.addField(`Инфо`, dataField, true)
		.setColor(color)
		.setFooter(`дней на сервере: ${daysOnServer}`);
	return embed;
}