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

	var iterator = 0;
	var membersSucceeded = [];
	channel.send(new MessageEmbed()).then((msg) => {
		ExecuteForEveryMember(300, async function (member, i, members) {
			var clanMember = new ClanMember(member);
			if (await clanMember.GetRecordDataState(triumphId)) membersSucceeded.push(clanMember);

			iterator++;
			if (iterator % 15 == 0 || iterator == members.length) {
				const embed = new MessageEmbed()
					.setAuthor(recordData.name + (iterator == members.length ? "" : " [" + iterator + "/" + members.length + "]"))
					.setColor(0x00AE86)
					.setThumbnail('https://www.bungie.net' + recordData.icon)
					.setFooter(recordData.description, "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")

				if (membersSucceeded.length > 0) embed.addField("1 - " + Math.round(membersSucceeded.length / 2), membersSucceeded.sort().filter((_, i) => i < membersSucceeded.length / 2).map(member => member.displayName).join("\n"), true)
				if (membersSucceeded.length > 1) embed.addField((Math.round(membersSucceeded.length / 2) + 1) + " - " + membersSucceeded.length, membersSucceeded.sort().filter((_, i) => i >= membersSucceeded.length / 2).map(member => member.displayName).join("\n"), true)

				msg.edit({ embed });
			}
		});
	});
}

export async function ShowTopTriumphScore(channel, modificators){
	var iterator = 0;
	var objectMembers = [];
	channel.send(new MessageEmbed()).then((msg) => {
		ExecuteForEveryMember(50, async (member, i, members) => {
			var clanMember = new ClanMember(member);
			await clanMember.FetchActiveScore();
			objectMembers.push(clanMember);

			iterator++;
			if (iterator % 15 == 0 || iterator == members.length) {
				const embed = new MessageEmbed()
					.setAuthor("Triumphs score [top 15]:")
					.setColor(0x00AE86)
					.setDescription(objectMembers.sort((a, b) => (a.activeScore > b.activeScore ? -1 : 1)).filter((_, i) => i < 15).map(m => "`" + m.activeScore + "` " + m.displayName).join('\n'))
					.setFooter("Horobot", "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
					.setTimestamp()
				msg.edit({ embed });
			}
		});
	})
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

	const embed = new MessageEmbed()
		.setAuthor("Aurora")
		.setColor(0x00AE86)
		.setFooter("Horobot", "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
		.setTimestamp()
	if (discordPsnList.length > 0)
		embed.addField("PSN: " + discordPsnList.length + "/" + discordMembers.length, discordPsnList.join("\n"), true)
	if (discordList.length > 0)
		embed.addField("Дискорд: " + discordList.length + "/" + discordMembers.length, discordList.join("\n"), true)
	if (gameList.length > 0)
		embed.addField("Игра: " + gameList.length + "/" + gameMembers.length, gameList.join("\n"), true)

	if (!isReminder) channel.send({ embed });
	else if (discordList.length > 0)
		channel.send(discordList.join(", ") + "\n\nОбращаю ваше внимание, что ваш никнейм в дискорде не соответствует игровому.");
}

export async function ClanTime(channel, days, modificators) {
	var clanMembers = [];
	var clanVoiceSummary = await GetClanVoiceSummary(days);
	var iterator = 0;
	channel.send(new MessageEmbed()).then((msg) => {
		ExecuteForEveryMember(500, async function (member, i, members) {
			var clanMember = new ClanMember(member);
			await clanMember.FetchCharacterIds();
			clanMember.FetchDiscordMember(channel.guild);
			clanMember.AddToVoiceOnline(clanVoiceSummary[clanMember.discordMemberId]);
			var activities = await GetAllActivities(clanMember, days);
			activities.forEach(a => clanMember.AddToGameOnline(a.values.timePlayedSeconds.basic.value))

			clanMembers.push(clanMember);
			iterator++;

			if (iterator % 20 == 0 || iterator == members.length) {
				msg.edit(FormClanTimeEmbed(clanMembers, modificators + (iterator == members.length ? ' final' : '')));
			}
			if (iterator == members.length && modificators.includes("pm")) {
				SendPrivateMessagesToArray(GetArrayOfMembersWithPMText(clanMembers));
			}
		});
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