import { MessageEmbed } from "discord.js";
import config from "../config.json";
import { AsyncGetClanMembers } from "../http/bungieApi.js";
import { AsyncGetShowAndSetRoles } from "./clanMember/roles.js";
import { ClanMember } from "./clanMember/clanMember.js";
import { ManifestManager } from "../manifest.js";
import { FromRecordStatEmbed } from "../embeds/recordStatEmbed.js";
import { FormTopTriumphScoreEmbed } from "../embeds/topTriumphScoreEmbed.js";
import { AsyncDrawTriumphs } from "../drawing/drawTriumphs.js";
import { CatchError } from "../catcherror.js";

export async function AsyncGetFullApiClanMemberList() {
	var members = [];
	Array.prototype.push.apply(members, await AsyncGetClanMembers(config.clans[0].id));
	Array.prototype.push.apply(members, await AsyncGetClanMembers(config.clans[1].id));
	return members;
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

export function SendAndUpdateEmbed({channel, requestTimeout, updateFrequency, formData, createEmbed, finalAction}) {
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

export function ShowRecordStat(channel, triumphId) {
	if (triumphId == null) throw "Вы не обозначили искомый триумф.";
	var recordData = ManifestManager.GetRecordData(triumphId)?.displayProperties;
	if (recordData == null) throw "Триумф не найден.";

	SendAndUpdateEmbed({
		channel: channel, 
		requestTimeout: 300, 
		updateFrequency: 15,
		formData: async (member) => {
			var clanMember = new ClanMember(member);
			return (await clanMember.GetRecordDataState(triumphId)) ? clanMember : null;
		},
		createEmbed: (array, i, size) => FromRecordStatEmbed(array, i, size, recordData)
	})
}

export function ShowTopTriumphScore(channel, showImage) {
	SendAndUpdateEmbed({
		channel: channel, 
		requestTimeout: 15, 
		updateFrequency: 30,
		formData: async (member) => {
			var clanMember = new ClanMember(member);
			await clanMember.FetchActiveScore();
			return clanMember;
		},
		createEmbed: (array, i, size) => {
			return showImage ? Math.floor(100 * i / size) + "%" : FormTopTriumphScoreEmbed(array, i, size);
		},
		finalAction: async (array, message) => {
			if (showImage) {
				message.delete();
				await AsyncDrawTriumphs(array, channel);
			}
	}})
}
