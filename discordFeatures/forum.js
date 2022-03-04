import fs from "fs";
import config from "../config.json" assert {type: "json"};
import { FetchFullPath } from "../directories.js";

export function GiveForumRole(message) {
	var userlist = [];
	message.guild.roles.cache.find(role => role.id == config.roles.separators.footer).members.
		forEach(user => { userlist.push(user); });

	var i = 0;
	var giverole = function () {
		if (i < userlist.length) {
			userlist[i].roles.add(config.roles.forum_tag);
			i++;
			if (i == userlist.length)
				message.channel.send("роли выданы!");
			setTimeout(giverole, 400);
		}
	};
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
