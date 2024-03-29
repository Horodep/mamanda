import { MessageEmbed } from "discord.js";
import { GetDiscordClanMemberList } from "../discordFeatures/getDiscordClanMemberList.js";
import { filterClanMembersData } from "../clan/showClanTime.js";

export function CreateEmbedForClanStatistics(clanMembers, modificators) {
	var guild = clanMembers.filter(m => m.discordMember)[0].discordMember.guild;
	var embed = new MessageEmbed()
		.setAuthor({ name: "Clankick " + (modificators.includes("final") ? "" : clanMembers.length) })
		.setColor(0x00AE86)
		.setFooter({ text: 'Horobot', iconURL: 'https://cdn.discordapp.com/avatars/564870880853753857/127385781e26e7dcfdbe312de1843ddf.png' })
		.setTimestamp();

	var { lowGame, lowVoice, zeroGame, zeroVoice, goodNewbie, isAway, noData, weForgotToKik, discordNotFound } = filterClanMembersData(clanMembers);

	var isFull = modificators.includes("full");

	//       embed | field title | array | pattern | separator | show_if_empty | semicolumn | condition
	AddField(embed, "Меньше 5 часов", lowGame, null, "\n", false, false, isFull);
	AddField(embed, "Меньше 15%", lowVoice, null, "\n", false, false, true);
	AddField(embed, "0 в игре [в войсе]", zeroGame, "`$voice$role`$tag", "\n", false, true, true);
	AddField(embed, "0 в войсе [в игре]", zeroVoice, "`$game$role`$tag", "\n", false, true, true);
	AddField(embed, "Очернить стража", goodNewbie, null, "\n", true, false, true);
	AddField(embed, "В отпуске [в игре]", isAway, "$tag ($game)", "\n", false, true, isFull);
	AddField(embed, "Профиль закрыт [в войсе]", noData, "`$voice$role`$tag", "\n", false, true, isFull);
	AddField(embed, '\u200B', [], "", "", true, false, true);
	AddField(embed, "Недокикнуты [в игре]", weForgotToKik, "$name ($game)", "\n", false, true, true);
	AddField(embed, "Неверный ник [в игре]", discordNotFound, "$name ($game)", "\n", false, true, true);

	if (!modificators.includes("final"))
		return { embeds: [embed] };

	var discordMembers = GetDiscordClanMemberList(guild);
	var left = "";
	discordMembers.forEach(function (member) {
		if (clanMembers.filter(m => member.displayName.startsWith(m.displayName)).length == 0) {
			left += "<@" + member.user.id + ">\n";
		}
	});
	if (left.length > 0)
		embed.addField("Неверный ник [в дискорде]", left, true);

	return { embeds: [embed] };
}

function AddField(embed, embed_header, members, linePattern, separator, show_if_empty, semicolumn, show) {
	if (!show) return;
	if (members.length == 0 && !show_if_empty) return;
	if (members.map(m => m.FillStringWithData(linePattern)).join(separator).length > 1010) {
		embed.addField(embed_header, members.filter((_, i) => i < members.length / 2).map(m => m.FillStringWithData(linePattern)).join(separator), semicolumn);
		embed.addField(embed_header, members.filter((_, i) => i >= members.length / 2).map(m => m.FillStringWithData(linePattern)).join(separator).semicolumn);
	} else {
		var prefix = show_if_empty ? '\u200B' : "";
		embed.addField(embed_header, prefix + members.map(m => m.FillStringWithData(linePattern)).join(separator), semicolumn);
	}
}