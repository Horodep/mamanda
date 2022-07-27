import { AsyncGetDiscordClanMemberList, GetDiscordClanMemberList } from "../discordFeatures/getDiscordClanMemberList.js";
import { CreateNicknameComparisonEmbed } from "../embeds/nicknamesEmbed.js";
import { AsyncGetFullApiClanMemberList } from "./clan.js";


export async function AsyncCompareAndShowNicknames(channel, isReminder) {
	var gameMembers = await AsyncGetFullApiClanMemberList();
	var discordMembers = await AsyncGetDiscordClanMemberList(channel.guild);

	var discordList = [];
	var discordPsnList = [];
	var gameList = [];

	discordMembers.forEach(function (discordMember) {
		if (gameMembers.filter(
				gameMember => (discordMember.displayName.startsWith(gameMember.destinyUserInfo.bungieGlobalDisplayName + " ")
							|| discordMember.displayName == gameMember.destinyUserInfo.bungieGlobalDisplayName)).length == 0) {
			if (discordMember.roles.cache.find(role => role.name === "PSN")) {
				discordPsnList.push("<@" + discordMember.id + ">");
			} else {
				discordList.push("<@" + discordMember.id + ">");
			}
		}
	});

	gameMembers.forEach(function (gameMember) {
		if (discordMembers.filter(discordMember => (discordMember.displayName.startsWith(gameMember.destinyUserInfo.bungieGlobalDisplayName + " ")
								|| discordMember.displayName == gameMember.destinyUserInfo.bungieGlobalDisplayName)).length == 0) {
			gameList.push(gameMember.destinyUserInfo.bungieGlobalDisplayName != "" 
						? gameMember.destinyUserInfo.bungieGlobalDisplayName 
						: "old: "+gameMember.destinyUserInfo.displayName);
		}
	});

	if (!isReminder)
		channel.send(CreateNicknameComparisonEmbed(discordPsnList, discordList, gameList, gameMembers.length));
	else if (discordList.length > 0)
		channel.send(discordList.join(", ") + "\n\nОбращаю ваше внимание, что ваш никнейм в дискорде не соответствует игровому.");
}
