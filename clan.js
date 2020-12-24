import { MessageEmbed } from "discord.js";
import config from "./config.json";
import { GetClanMembers } from "./bungieApi.js";
import { GetShowAndSetRoles } from "./roles.js";
import { ClanMember, GetAllActivities } from "./clanMember.js";
import { GetClanVoiceSummary } from "./sql.js";
import { GetFullDiscordClanMemberList } from "./discordCommunityFeatures.js";
import { SendPrivateMessagesToArray } from "./sendMessage.js";
import { ManifestManager } from "./manifest.js";
import { FormClanTimeEmbed } from "./embeds/clanTimeEmbed.js";
import { FromRecordStatEmbed } from "./embeds/recordStatEmbed.js";
import { FormTopTriumphScoreEmbed } from "./embeds/topTriumphScoreEmbed.js";
import { FormNicknamesEmbed } from "./embeds/nicknamesEmbed";

async function GetFullGameClanMemberList() {
	var members = [];
	Array.prototype.push.apply(members, await GetClanMembers(config.clans[0].id));
	Array.prototype.push.apply(members, await GetClanMembers(config.clans[1].id));
	return members;
}

export async function ClanSize() {
	return config.clans[0].name + ": " + (await GetClanMembers(config.clans[0].id)).length + "\n" +
		config.clans[1].name + ": " + (await GetClanMembers(config.clans[1].id)).length;
}

export async function GetMemberByDiscordName(discordName) {
	var members = await GetFullGameClanMemberList();
	try {
		members.forEach(function (member) {
			if (discordName.startsWith(member.destinyUserInfo.LastSeenDisplayName + " ") ||
				discordName == member.destinyUserInfo.LastSeenDisplayName) {
				throw member;
			}
		});
	} catch (member) {
		return member;
	}
}

export async function ExecuteForEveryMember(timeout, callback) {
	var members = await GetFullGameClanMemberList();
	var i = 0;
	var iteration = function () {
		if (i < members.length) {
			callback(members[i], i + 1, members);
			i++;
			setTimeout(iteration, timeout);
		}
	}
	iteration();
}

export function SetRoles(channel) {
	ExecuteForEveryMember(5000, (member) => {
		var clanMember = new ClanMember(member);
		clanMember.FetchDiscordMember(channel.guild);
		GetShowAndSetRoles(clanMember, null);
	});
}

export async function SendAndUpdateEmbed(channel, requestTimeout, updateFrequency, formData, createEmbed, finalAction) {
	var iterator = 0;
	var arrayWithData = [];
	channel.send(new MessageEmbed()).then((msg) => {
		ExecuteForEveryMember(requestTimeout, async function (member, i, members) {
			arrayWithData.push(await formData(member));
			iterator++;
			if (iterator % updateFrequency == 0 || iterator == members.length) {
				msg.edit(createEmbed(arrayWithData.filter(m => m != null), iterator, members.length));
			}
			if (iterator == members.length && finalAction != null) finalAction(arrayWithData.filter(m => m != null));
		});
	});
}

export async function ShowRecordStat(channel, triumphId) {
	if (triumphId == null) {
		message.channel.send("Вы не обозначили искомый триумф.");
		return;
	}
	ManifestManager.LoadData();
	var recordData = ManifestManager.GetRecordData(triumphId);
	if (recordData == null) {
		message.channel.send("Триумф не найден.");
		return;
	}

	SendAndUpdateEmbed(channel, 300, 15,
		async (member) => {
			var clanMember = new ClanMember(member);
			return (await clanMember.GetRecordDataState(triumphId)) ? clanMember : null;
		},
		(array, i, size) => {
			return FromRecordStatEmbed(array, i, size, recordData);
		})
}

export async function ShowTopTriumphScore(channel) {
	SendAndUpdateEmbed(channel, 50, 15,
		async (member) => {
			var clanMember = new ClanMember(member);
			await clanMember.FetchActiveScore();
			return clanMember;
		},
		(array, i, size) => {
			return FormTopTriumphScoreEmbed(array, i, size);
		})
}

export async function ClanTime(channel, days, modificators) {
	var clanVoiceSummary = await GetClanVoiceSummary(days);
	SendAndUpdateEmbed(channel, 500, 20,
		async (member) => {
			var clanMember = new ClanMember(member);
			await clanMember.FetchCharacterIds();
			clanMember.FetchDiscordMember(channel.guild);
			clanMember.AddToVoiceOnline(clanVoiceSummary[clanMember.discordMemberId]);
			var activities = await GetAllActivities(clanMember, days);
			activities.forEach(a => clanMember.AddToGameOnline(a.values.timePlayedSeconds.basic.value))
			return clanMember;
		},
		(array, i, size) => {
			return FormClanTimeEmbed(array, modificators + (i == size ? ' final' : ''));
		},
		array => {
			if (modificators.includes("pm")) {
				SendPrivateMessagesToArray(GetArrayOfMembersWithPMText(array));
			}
		})
}

function GetArrayOfMembersWithPMText(clanMembers) {
	const zeroGameMessage = "Последнюю неделю вы не заходили в игру. Если в ближайшие дни ситуация не изменится, вы будете исключены из клана.\n" +
		"_Это автоматическое сообщение, пожалуйста, не отвечайте на него._";
	const zeroVoiceMessage = "Последнюю неделю вы не заходили в голосовые каналы дискорда. Если в ближайшие дни ситуация не изменится, вы будете исключены из клана.\n" +
		"_Это автоматическое сообщение, пожалуйста, не отвечайте на него._";
	const lowVoiceMessage = "Ваше присутсвие в голосовом чате за последнюю неделю составило $percent от вашего игрового времени. " +
		"Если в течении недели ситуация не изменится, вас исключат из клана.\n" +
		"_Это автоматическое сообщение, пожалуйста, не отвечайте на него._";
	const lowGameMessage = "Ваш онлайн в игре составил $game. Если в течении недели ваш онлайн не увеличится, вас исключат из клана.\n" +
		"_Это автоматическое сообщение, пожалуйста, не отвечайте на него._";

	var textedMembers = [];
	var { lowGame, lowVoice, zeroGame, zeroVoice } = filterClanMembersData(clanMembers);
	//lowGame.forEach(member => {textedMembers.push({discordMember: member.discordMember, text: member.FillStringWithData(lowGameMessage)});})
	lowVoice.forEach(member => { textedMembers.push({ discordMember: member.discordMember, text: member.FillStringWithData(lowVoiceMessage) }); })
	zeroVoice.forEach(member => { textedMembers.push({ discordMember: member.discordMember, text: member.FillStringWithData(zeroVoiceMessage) }); })
	zeroGame.forEach(member => { textedMembers.push({ discordMember: member.discordMember, text: member.FillStringWithData(zeroGameMessage) }); })
	return textedMembers;
}

export function filterClanMembersData(clanMembers) {
	var filteredMembers = clanMembers;

	var discordNotFound = filteredMembers.filter(m => !m.discordMemberExists).sort(byGameTime);
	filteredMembers = filteredMembers.filter(e => !discordNotFound.includes(e));

	var filteredMembers = filteredMembers.filter(m => m.joined >= 7);

	var isAway = filteredMembers.filter(m => m.HasDiscordRole(config.roles.afk)).sort(byGameTime);
	filteredMembers = filteredMembers.filter(e => !isAway.includes(e));

	var noData = filteredMembers.filter(m => !m.access && !m.HasDiscordRole(config.roles.newbie)).sort(byVoiceTime);
	filteredMembers = filteredMembers.filter(e => !noData.includes(e));

	var zeroGame = filteredMembers.filter(m => m.isZeroGame).sort(byVoiceTime);
	filteredMembers = filteredMembers.filter(e => !zeroGame.includes(e));

	var zeroVoice = filteredMembers.filter(m => m.isZeroVoice).sort(byGameTime);
	filteredMembers = filteredMembers.filter(e => !zeroVoice.includes(e));

	var lowVoice = filteredMembers.filter(m => m.percentage < 15).sort(byPercentage);
	filteredMembers = filteredMembers.filter(e => !lowVoice.includes(e));

	var lowGame = filteredMembers.filter(m => m.isLowGame).sort(byGameTime);
	filteredMembers = filteredMembers.filter(e => !lowGame.includes(e));

	var goodNewbie = filteredMembers.filter(m => m.HasDiscordRole(config.roles.newbie) && m.joined >= 10).sort(byJoinDate);
	filteredMembers = filteredMembers.filter(e => !goodNewbie.includes(e));

	var weForgotToKik = filteredMembers.filter(m => m.HasDiscordRole(config.roles.guest));

	function byGameTime(a, b) { return a.gameOnline < b.gameOnline ? 1 : a.gameOnline > b.gameOnline ? -1 : 0; }
	function byVoiceTime(a, b) { return a.voiceOnline < b.voiceOnline ? 1 : a.voiceOnline > b.voiceOnline ? -1 : 0; }
	function byJoinDate(a, b) { return a.joined < b.joined ? 1 : a.joined > b.joined ? -1 : 0; }
	function byPercentage(a, b) { return a.percentage < b.percentage ? 1 : a.percentage > b.percentage ? -1 : 0; }

	return { lowGame, lowVoice, zeroGame, zeroVoice, goodNewbie, isAway, noData, weForgotToKik, discordNotFound };
}

export async function Nicknames(channel, isReminder) {
	var gameMembers = await GetFullGameClanMemberList();
	var discordMembers = GetFullDiscordClanMemberList(channel.guild);

	var discordList = [];
	var discordPsnList = [];
	var gameList = [];

	discordMembers.forEach(function (discordMember) {
		if (gameMembers.filter(gameMember => discordMember.displayName.startsWith(gameMember.destinyUserInfo.LastSeenDisplayName)).length == 0) {
			if (discordMember.roles.cache.find(role => role.name === "PSN")) {
				discordPsnList.push("<@" + discordMember.id + ">");
			} else {
				discordList.push("<@" + discordMember.id + ">");
			}
		}
	});

	gameMembers.forEach(function (gameMember) {
		if (discordMembers.filter(discordMember => discordMember.displayName.startsWith(gameMember.destinyUserInfo.LastSeenDisplayName)).length == 0) {
			gameList.push(gameMember.destinyUserInfo.LastSeenDisplayName);
		}
	});

	if (!isReminder) channel.send(FormNicknamesEmbed(discordPsnList, discordList, gameList, gameMembers.length));
	else if (discordList.length > 0)
		channel.send(discordList.join(", ") + "\n\nОбращаю ваше внимание, что ваш никнейм в дискорде не соответствует игровому.");
}