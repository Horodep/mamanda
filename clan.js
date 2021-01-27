import { MessageEmbed } from "discord.js";
import config from "./config.json";
import { AsyncGetClanMembers } from "./bungieApi.js";
import { AsyncGetShowAndSetRoles } from "./roles.js";
import { ClanMember, AsyncGetAllActivities } from "./clanMember.js";
import { AsyncGetClanVoiceSummary } from "./sql.js";
import { GetFullDiscordClanMemberList } from "./discordCommunityFeatures.js";
import { SendPrivateMessagesToArray } from "./sendMessage.js";
import { ManifestManager } from "./manifest.js";
import { FormClanTimeEmbed } from "./embeds/clanTimeEmbed.js";
import { FromRecordStatEmbed } from "./embeds/recordStatEmbed.js";
import { FormTopTriumphScoreEmbed } from "./embeds/topTriumphScoreEmbed.js";
import { FormNicknamesEmbed } from "./embeds/nicknamesEmbed.js";
import { AsyncDrawTriumphs } from "./drawing.js";
import { CatchError } from "./catcherror.js";

async function AsyncGetFullApiClanMemberList() {
	var members = [];
	Array.prototype.push.apply(members, await AsyncGetClanMembers(config.clans[0].id));
	Array.prototype.push.apply(members, await AsyncGetClanMembers(config.clans[1].id));
	return members;
}

async function AsyncExecuteForEveryMember(timeout, callback) {
	var members = await AsyncGetFullApiClanMemberList();
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

function SendAndUpdateEmbed(channel, requestTimeout, updateFrequency, formData, createEmbed, finalAction) {
	var iterator = 0;
	var arrayWithData = [];
	channel.send(new MessageEmbed()).then((msg) => {
		var firstError = true;
		AsyncExecuteForEveryMember(requestTimeout, async function (member, i, members) {
			try {
				arrayWithData.push(await formData(member));
				iterator++;
				if (iterator % updateFrequency == 0 || iterator == members.length) {
					msg.edit(createEmbed(arrayWithData.filter(m => m != null), iterator, members.length));
				}
				if (iterator == members.length && finalAction != null) await finalAction(arrayWithData.filter(m => m != null), msg);
			}
			catch (e) {
				if (firstError) {
					CatchError(e, channel);
					firstError = false;
				}
			}
		});
	});
}

export async function AsyncShowClanSize(message) {
	message.channel.send(
		config.clans[0].name + ": " + (await AsyncGetClanMembers(config.clans[0].id)).length + "\n" +
		config.clans[1].name + ": " + (await AsyncGetClanMembers(config.clans[1].id)).length);
}

export async function AsyncGetMemberByDiscordName(discordName) {
	var members = await AsyncGetFullApiClanMemberList();
	for (var i = 0; i < members.length; i++) {
		if (discordName.startsWith(members[i].destinyUserInfo.LastSeenDisplayName + " ") ||
			discordName == members[i].destinyUserInfo.LastSeenDisplayName) {
			return members[i];
		}
	};
	throw 'Игровой профиль не найден.';
}

export function SetRolesToEveryMember(guild) {
	AsyncExecuteForEveryMember(5000, (member) => {
		var clanMember = new ClanMember(member);
		clanMember.FetchDiscordMember(guild);
		AsyncGetShowAndSetRoles(clanMember, null);
	});
}

export function ShowRecordStat(channel, triumphId) {
	if (triumphId == null) throw "Вы не обозначили искомый триумф.";
	var recordData = ManifestManager.GetRecordData(triumphId);
	if (recordData == null) throw "Триумф не найден.";

	SendAndUpdateEmbed(channel, 300, 15,
		async (member) => {
			var clanMember = new ClanMember(member);
			return (await clanMember.GetRecordDataState(triumphId)) ? clanMember : null;
		},
		(array, i, size) => {
			return FromRecordStatEmbed(array, i, size, recordData);
		})
}

export function ShowTopTriumphScore(channel, showImage) {
	SendAndUpdateEmbed(channel, 50, 15,
		async (member) => {
			var clanMember = new ClanMember(member);
			await clanMember.FetchActiveScore();
			return clanMember;
		},
		(array, i, size) => {
			return showImage ? Math.floor(100 * i / size) + "%" : FormTopTriumphScoreEmbed(array, i, size);
		},
		async (array, message) => {
			if (showImage) {
				message.delete();
				await AsyncDrawTriumphs(array, channel);
			}
		})
}

export async function AsyncShowClanTime(channel, days, modificators) {
	var clanVoiceSummary = await AsyncGetClanVoiceSummary(days);
	await channel.guild.members.fetch();
	SendAndUpdateEmbed(channel, 500, 20,
		async (member) => {
			var clanMember = new ClanMember(member);
			await clanMember.FetchCharacterIds();
			clanMember.FetchDiscordMember(channel.guild);
			clanMember.AddToVoiceOnline(clanVoiceSummary[clanMember.discordMemberId]);
			var activities = await AsyncGetAllActivities(clanMember, days);
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

export async function AsyncShowNicknames(channel, isReminder) {
	var gameMembers = await AsyncGetFullApiClanMemberList();
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