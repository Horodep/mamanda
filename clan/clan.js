import { MessageEmbed } from "discord.js";
import config from "../config.json";
import { AsyncRefreshAuthToken } from "../http/httpCore.js";
import { AsyncGetClanMembers, AsyncGetCredentialTypesForTargetAccount } from "../http/bungieApi.js";
import { AsyncGetShowAndSetRoles } from "./clanMember/roles.js";
import { ClanMember } from "./clanMember/clanMember.js";
import { ManifestManager } from "../manifest.js";
import { CreateEmbedForRecordStatistics } from "../embeds/recordStatEmbed.js";
import { CreateTopTriumphScoreEmbed } from "../embeds/topTriumphScoreEmbed.js";
import { AsyncDrawTriumphs } from "../drawing/drawTriumphs.js";
import { CatchError } from "../catcherror.js";

export async function AsyncGetFullApiClanMemberList() {
	var members = [];
	Array.prototype.push.apply(members, await AsyncGetClanMembers(config.clans[0].id));
	Array.prototype.push.apply(members, await AsyncGetClanMembers(config.clans[1].id));
	return members;
}

export async function AsyncGetFullApiClanMemberListUncensored() {
	var members = [];
	Array.prototype.push.apply(members, await AsyncGetClanMembers(config.clans[0].id));
	Array.prototype.push.apply(members, await AsyncGetClanMembers(config.clans[1].id));
	return await UncensorNicknames(members);
}

async function UncensorNicknames(members) {
    await AsyncRefreshAuthToken();
	for (var i = 0; i < members.length; i++) {
		if (members[i].destinyUserInfo.LastSeenDisplayName.includes("★★★")) {
			var credentialTypes = await AsyncGetCredentialTypesForTargetAccount(members[i].destinyUserInfo.membershipId);
			members[i].destinyUserInfo.LastSeenDisplayName = credentialTypes[0].credentialDisplayName;
		}
	};
	return members;
}

export async function AsyncShowClanSize(message) {
	message.channel.send(
		config.clans[0].name + ": " + (await AsyncGetClanMembers(config.clans[0].id)).length + "\n" +
		config.clans[1].name + ": " + (await AsyncGetClanMembers(config.clans[1].id)).length);
}

export async function AsyncGetMemberByDiscordName(discordName) {
	var members = await AsyncGetFullApiClanMemberList();
	var member = GetMemberByDiscordNameCore(members, discordName);
	if (member != null) return member;
	
	var member = GetMemberByDiscordNameCore(await UncensorNicknames(members), discordName);
	if (member != null) return member;

	throw 'Игровой профиль не найден.';
}

function GetMemberByDiscordNameCore(members, discordName) {
	for (var i = 0; i < members.length; i++) {
		if (discordName.startsWith(members[i].destinyUserInfo.bungieGlobalDisplayName + " ") ||
			discordName == members[i].destinyUserInfo.bungieGlobalDisplayName) {
			return members[i];
		}
	};
	return null;
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

export function SendAndUpdateEmbed({channel, requestTimeout, updateFrequency, fetchDataPerMember, createEmbed, finalAction}) {
	var iterator = 0;
	var arrayWithData = [];
	channel.send(new MessageEmbed().setDescription("Waiting for first data.")).then((msg) => {
		var firstError = true;
		AsyncExecuteForEveryMember(requestTimeout, async function (member, i, members) {
			try {
				arrayWithData.push(await fetchDataPerMember(member));
				iterator++;
				if (iterator % updateFrequency == 0 || iterator == members.length) {
					msg.edit(createEmbed(arrayWithData.filter(m => m != null), iterator, members.length));
				}
				if (iterator == members.length && finalAction != null) await finalAction(arrayWithData.filter(m => m != null), msg);
			}
			catch (e) {
				if (firstError) {
					firstError = false;
					CatchError(e, channel); //catch in sync loading
				}
			}
		});
	});
}

export function SetRolesToEveryMember(guild) {
	AsyncExecuteForEveryMember(5000, (member) => {
		var clanMember = new ClanMember(member);
		clanMember.FetchDiscordMember(guild);
		AsyncGetShowAndSetRoles(clanMember, null);
	});
}

export function ShowRecordStatistics(channel, triumphId) {
	if (triumphId == null) throw "Вы не обозначили искомый триумф.";
	var recordData = ManifestManager.GetRecordData(triumphId)?.displayProperties;
	if (recordData == null) throw "Триумф не найден.";

	SendAndUpdateEmbed({
		channel: channel, 
		requestTimeout: 300, 
		updateFrequency: 15,
		fetchDataPerMember: async (member) => {
			var clanMember = new ClanMember(member);
			return (await clanMember.GetRecordDataState(triumphId)) ? clanMember : null;
		},
		createEmbed: (array, i, size) => CreateEmbedForRecordStatistics(array, i, size, recordData)
	})
}

export function ShowTopTriumphScore(channel, showImage) {
	SendAndUpdateEmbed({
		channel: channel, 
		requestTimeout: 15, 
		updateFrequency: 30,
		fetchDataPerMember: async (member) => {
			var clanMember = new ClanMember(member);
			await clanMember.FetchActiveScore();
			return clanMember;
		},
		createEmbed: (array, i, size) => {
			return showImage ? Math.floor(100 * i / size) + "%" : CreateTopTriumphScoreEmbed(array, i, size);
		},
		finalAction: async (array, message) => {
			if (showImage) {
				message.delete();
				await AsyncDrawTriumphs(array, channel);
			}
	}})
}
