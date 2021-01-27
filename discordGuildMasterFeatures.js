import fs from "fs";
import config from "./config.json";
import fetch from "node-fetch";
import { CatchError } from "./catcherror.js";
import { FetchFullPath } from "./directories.js";

export async function AsyncShowResetEnglish(channel) {
	var response = await fetch("http://kyber3000.com/Reset");
	channel.send("Reset by Kyber3000");
	channel.send(response.url);
}

export function DropPvpRole(guild) {
	var topPvpRole = guild.roles.find(role => role.id == config.roles.medals.category_first_role.crucible);

	for (var rolePosition = topPvpRole.position - 1; rolePosition > topPvpRole.position - 7; rolePosition--) {
		var role = guild.roles.find(role => role.position == rolePosition);
		var list = [];
		role.members.forEach(member => { list.push(member); });

		var i = 0;
		var dropRole = function () {
			if (i < list.length) {
				list[i].roles.remove(role);
				i++;
				setTimeout(dropRole, 1000);
			}
		}
		dropRole();
	}
}

export function GiveForumRole(message) {
	var userlist = [];
	message.guild.roles.cache.find(role => role.id == config.roles.separators.footer).members.
		forEach(user => { userlist.push(user); });

	var i = 0;
	var giverole = function () {
		if (i < userlist.length) {
			userlist[i].roles.add(config.roles.forum_tag);
			i++;
			if (i == userlist.length) message.channel.send("роли выданы!");
			setTimeout(giverole, 400);
		}
	}
	giverole();
}

export function SaveForumLinkAndPublish(link, client) {
	fs.writeFileSync(FetchFullPath(".data/forumlink.txt"), link);
	var channel_news = client.channels.cache.get(config.channels.clannews);
	channel_news.send("Не важно, <@&" + config.roles.guardians[0] + "> ты, <@&" + config.roles.guest + "> или @everyone другой, мы верим, что ты хочешь помочь клану! <@&" + config.roles.separators.footer + ">\n" +
		"Проще всего это сделать подняв тему о наборе на форуме, нажав на стрелочку вверх.\n" + link + "\n" +
		"p.s. Для того, чтобы снять роль прожмите эмоцию `🆗` под данным сообщением.").then((msg) => {
			msg.react("🆗");
		});
}

export function PublishDailyMessage(client) {
	var channel = client.channels.cache.get(config.channels.flood);
	var data = fs.readFileSync(FetchFullPath(".data/forumlink.txt"), 'utf8');
	channel.send(
		"Уважаемые Стражи! А точнее те из вас, кто <@&" + config.roles.forum_tag + ">\n" +
		"Пожалуйста, сделайте это! Это очень важно для клана!\n\n" +
		"p.s. Для того, чтобы снять роль прожмите эмоцию `🆗` под данным сообщением.\n" +
		data).then((msg) => {
			msg.react("🆗");
		});
}

export function SetMaximumTriumphsScore(message, args) {
	if (args.length < 2) {
		message.channel.send("Укажите значение.");
		return;
	}
	var score = Number(args[1]);
	if (Number.isNaN(score)) {
		message.channel.send("Введенное значение не является числом.");
		return;
	}
	fs.writeFileSync(FetchFullPath(".data/maxtriumphs.json"), args[1]);
}

export function ShowNewbieList(message) {
	var newbieList = [];
	message.guild.roles.cache.find(role => role.id == config.roles.newbie).members.forEach(function (member) {
		var secondsOnServer = Date.now() - member.joinedTimestamp;
		var daysOnServer = Math.floor(secondsOnServer / (1000 * 60 * 60 * 24));
		newbieList.push(`\`${daysOnServer}d\` <@${member.user.id}>`);
	});
	newbieList.sort();
	message.channel.send(newbieList.join('\n'));
}
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
	var counterOfMessagesByUser = [];
	var counterOfReactsOnMessage = [];
	await message.guild.members.fetch();
	message.guild.members.cache.filter(m => m.roles.cache.size == 1)
		.sort(function (a, b) { return a.joinedTimestamp > b.joinedTimestamp ? 1 : -1 })
		.forEach(function (member) {
			var secondsOnServer = Date.now() - member.joinedTimestamp;
			var daysOnServer = Math.floor(secondsOnServer / (1000 * 60 * 60 * 24));
			var headerText = `Заявка от <@${member.user.id}> (дней на сервере: ${daysOnServer}) `;
			var emojis = "";
			var requestBody = "";

			var queueChannel = message.client.channels.cache.get(config.channels.entrance);
			counterOfMessagesByUser[member.id] = 0;
			queueChannel.messages.fetch({ limit: 100 }).then(messages => {
				var userMessages = messages
					.sort((a, b) => a.id > b.id ? 1 : -1)
					.filter(m => m.author.id == member.user.id);
				userMessages.forEach(async function (requestMessage) {
					try /*need to check if needed*/ {
						counterOfMessagesByUser[member.id]++;
						counterOfReactsOnMessage[requestMessage.id] = 0;
						requestBody += '\n' + requestMessage.content;

						requestMessage.reactions.cache.each(async function (reaction) {
							counterOfReactsOnMessage[requestMessage.id]++;
							emojis += ` ${reaction.emoji}`;
							var users = await reaction.users.fetch();
							for (let user of users) {
								emojis += " **" + user[1].username + "**";
							}
							if(counterOfMessagesByUser[member.id] == userMessages.size)
								message.channel.send(headerText + emojis + "```" + requestBody + " ```");
						})
						if (counterOfMessagesByUser[member.id] == userMessages.size && counterOfReactsOnMessage[requestMessage.id] == 0)
							message.channel.send(headerText + emojis + "```" + requestBody + " ```");
					} catch (e) {
						CatchError(e, message.channel); //emojis
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