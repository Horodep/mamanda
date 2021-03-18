import config from "../config.json";
import { ClanMember, AsyncGetAllActivities } from "./clanMember/clanMember.js";
import { AsyncGetClanVoiceSummary } from "../http/sql.js";
import { SendPrivateMessagesToArray } from "../discordFeatures/messaging.js";
import { CreateEmbedForClanStatistics } from "../embeds/clanTimeEmbed.js";
import { SendAndUpdateEmbed } from "./clan.js";


export async function AsyncShowClanTime(channel, days, modificators) {
	var clanVoiceSummary = await AsyncGetClanVoiceSummary(days);
	await channel.guild.members.fetch();
	SendAndUpdateEmbed({
		channel: channel,
		requestTimeout: 5,
		updateFrequency: 20,
		fetchDataPerMember: async (member) => {
			var clanMember = new ClanMember(member);
			await clanMember.FetchCharacterIds();
			clanMember.FetchDiscordMember(channel.guild);
			clanMember.AddToVoiceOnline(clanVoiceSummary[clanMember.discordMemberId]);
			var activities = await AsyncGetAllActivities(clanMember, days);
			activities.forEach(a => clanMember.AddToGameOnline(a.values.timePlayedSeconds.basic.value));
			return clanMember;
		},
		createEmbed: (array, i, size) => {
			return CreateEmbedForClanStatistics(array, modificators + (i == size ? ' final' : ''));
		},
		finalAction: (array) => {
			if (modificators.includes("pm")) {
				SendPrivateMessagesToArray(GetArrayOfMembersWithPMText(array));
			}
		}
	});
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
	lowVoice.forEach(member => { textedMembers.push({ discordMember: member.discordMember, text: member.FillStringWithData(lowVoiceMessage) }); });
	zeroVoice.forEach(member => { textedMembers.push({ discordMember: member.discordMember, text: member.FillStringWithData(zeroVoiceMessage) }); });
	zeroGame.forEach(member => { textedMembers.push({ discordMember: member.discordMember, text: member.FillStringWithData(zeroGameMessage) }); });
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
