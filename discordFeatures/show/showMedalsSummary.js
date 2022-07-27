import { MessageEmbed } from "discord.js";
import { AsyncGetDiscordClanMemberList, GetDiscordClanMemberList } from "../getDiscordClanMemberList.js";

export async function AsyncShowMedalsSummary(channel) {
	var members = await AsyncGetDiscordClanMemberList(channel.guild);

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
		.setAuthor({ name: "Aurora's Tilt — " + members.length + " members // увожаемые:" })
		.setColor(0x00AE86)
		.setFooter({ text: 'Horobot', iconURL: 'https://cdn.discordapp.com/avatars/564870880853753857/127385781e26e7dcfdbe312de1843ddf.png' })
		.setTimestamp();

	for (let i = 35; i >= 6; i--) {
		var text = sorted[i].map(m => "<@" + m + ">").join("\n");
		var symbol = i < 8 ? "`📘`" : i < 17 ? "`📒`" : i < 26 ? "`📙`" : "`📕`";

		if (text.length > 0)
			embed.addField(symbol + " " + i + " " + symbol, text, true);
	}
	channel.send( { embeds: [embed] } );
}
