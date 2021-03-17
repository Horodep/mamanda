import { MessageEmbed } from "discord.js";
import { GetDiscordClanMemberList } from "../getDiscordClanMemberList.js";

export function ShowMedalsSummary(channel) {
	var members = GetDiscordClanMemberList(channel.guild);

	var sorted = [];
	for (let i = 0; i < 36; i++) {
		sorted[i] = [];
	}

	for (let i = 0; i < members.length; i++) {
		var rolesList = members[i].roles.cache.map(role => role.name).join("");
		var count = rolesList.match(/💠/g)?.length ?? 0;
		sorted[count].push(members[i]);
	}

	const embed = new MessageEmbed()
		.setAuthor("Aurora's Tilt — " + members.length + " members // увожаемые:")
		.setColor(0x00AE86)
		.setFooter("Horobot", "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
		.setTimestamp();

	for (let i = 35; i >= 6; i--) {
		var text = sorted[i].map(m => "<@" + m + ">").join("\n");
		var symbol = i < 7 ? "`📘`" : i < 16 ? "`📒`" : i < 24 ? "`📙`" : "`📕`";

		if (text.length > 0)
			embed.addField(symbol + " " + i + " " + symbol, text, true);
	}

	channel.send({ embed });
}
