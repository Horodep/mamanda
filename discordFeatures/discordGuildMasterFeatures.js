import fs from "fs";
import config from "../config.json";
import fetch from "node-fetch";
import { FetchFullPath } from "../directories.js";

export async function AsyncShowResetEnglish(channel) {
	var response = await fetch("http://kyber3000.com/Reset");
	channel.send("Reset by Kyber3000");
	channel.send(response.url);
}

export function DropPvpRole(message) {
	var list = [];
	var topPvpRole = message.guild.roles.cache.find(role => role.id == config.roles.medals.category_first_role.crucible);
	for (var rolePosition = topPvpRole.position - 1; rolePosition > topPvpRole.position - 7; rolePosition--) {
		var role = message.guild.roles.cache.find(role => role.position == rolePosition);
		role.members.forEach(member => { list.push({ member: member, role: role }); });
	}
	var i = 0;
	var dropRole = function () {
		if (i < list.length) {
			list[i].member.roles.remove(list[i].role);
			i++;
			setTimeout(dropRole, 1000);
		} else {
			message.channel.send("Пвп роли сняты");
		}
	}
	dropRole();
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
	if (args.length < 2) throw "Укажите значение.";
	var score = Number(args[1]);
	if (Number.isNaN(score)) throw "Введенное значение не является числом.";
	fs.writeFileSync(FetchFullPath(".data/maxtriumphs.json"), score.toString());
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