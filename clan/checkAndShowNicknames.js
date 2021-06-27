import { GetDiscordClanMemberList } from "../discordFeatures/getDiscordClanMemberList.js";
import { CreateNicknameComparisonEmbed } from "../embeds/nicknamesEmbed.js";
import { AsyncGetFullApiClanMemberListUncensored } from "./clan.js";


export async function AsyncCompareAndShowNicknames(channel, isReminder) {
	var gameMembers = await AsyncGetFullApiClanMemberListUncensored();
	var discordMembers = GetDiscordClanMemberList(channel.guild);

	var discordList = [];
	var discordPsnList = [];
	var gameList = [];

	discordMembers.forEach(function (discordMember) {
		if (gameMembers.filter(
				gameMember => (discordMember.displayName.startsWith(gameMember.destinyUserInfo.LastSeenDisplayName + " ")
							|| discordMember.displayName == gameMember.destinyUserInfo.LastSeenDisplayName)).length == 0) {
			if (discordMember.roles.cache.find(role => role.name === "PSN")) {
				discordPsnList.push("<@" + discordMember.id + ">");
			} else {
				discordList.push("<@" + discordMember.id + ">");
			}
		}
	});

	gameMembers.forEach(function (gameMember) {
		if (discordMembers.filter(discordMember => (discordMember.displayName.startsWith(gameMember.destinyUserInfo.LastSeenDisplayName + " ")
								|| discordMember.displayName == gameMember.destinyUserInfo.LastSeenDisplayName)).length == 0) {
			gameList.push(gameMember.destinyUserInfo.LastSeenDisplayName);
		}
	});

	if (!isReminder)
		channel.send(CreateNicknameComparisonEmbed(discordPsnList, discordList, gameList, gameMembers.length));
	else if (discordList.length > 0)
		channel.send(discordList.join(", ") + "\n\nОбращаю ваше внимание, что ваш никнейм в дискорде не соответствует игровому.");
}
