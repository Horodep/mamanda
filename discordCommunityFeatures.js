import { MessageEmbed } from "discord.js";
import config from "./config.json";
import { ManifestManager } from "./manifest.js";

export function ShowLegendarySectors(channel) {
	var today = new Date();
	today.setHours(today.getHours() + 7);
	var counter = Math.floor((today) / (24 * 3600 * 1000));

	var emojiServer = channel.client.guilds.cache.get(config.guilds.emojis);
    var emojiCache = emojiServer.emojis.cache;

	var legend = ManifestManager.GetActivityData(SECTOR_ROTATION_MAP[counter % 5][0], true);
	var master = ManifestManager.GetActivityData(SECTOR_ROTATION_MAP[counter % 5][1], true);
	var legendReward = ManifestManager.GetItemData(SECTOR_REWARD_ROTATION_MAP[counter % 4][0], true);
	var masterReward = ManifestManager.GetItemData(SECTOR_REWARD_ROTATION_MAP[counter % 4][1], true);
	var legendModifiers = legend.modifiers.map(m => m.activityModifierHash)
		.map(hash => `${emojiCache.find(e => e.name == hash)} ` + ManifestManager.GetActivityModifierData(hash, true)?.displayProperties?.name);
	var masterModifiers = master.modifiers.map(m => m.activityModifierHash)
		.map(hash => `${emojiCache.find(e => e.name == hash)} ` + ManifestManager.GetActivityModifierData(hash, true)?.displayProperties?.name);
	ManifestManager.CleanCache();

	var embed = new MessageEmbed()
		.setAuthor("Legendary sectors")
		.setColor(0x00AE86)
		.setTimestamp()
		.addField(legend.displayProperties.name, legendReward.name + '\n\n' + legendModifiers.join('\n'), true)
		.addField(master.displayProperties.name, masterReward.name + '\n\n' + masterModifiers.join('\n'), true)
	channel.send(embed)
}

export function InviteFriend(message, discordMention) {
	var topRole = message.member.roles.highest.position;
	var minRole = message.guild.roles.cache.find(role => role.id == config.roles.guardians[1]).position;

	if (minRole <= topRole) {
		var discordId = discordMention.replace(/\D/g, '')
		var discordMember = message.guild.members.cache.find(member => member.user.id == discordId);

		if (discordMember == null) {
			message.channel.send('Страж не найден.');
			return;
		}

		if (discordMember.roles.cache.size == 1) {
			discordMember.roles.add(config.roles.guest);
			message.channel.send(`Стража <@${discordId}> пустили на сервер.`);
		}
	} else {
		message.channel.send('У вас нет прав на это действие.');
	};
}

export function ChangeRegion(message) {
	var topRole = message.member.roles.highest.position;
	var minRole = message.guild.roles.cache.find(role => role.id == config.roles.afk).position;

	if (minRole <= topRole) {
		if (message.guild.region == "russia") {
			message.guild.setRegion("eu-central");
			message.channel.send('Регион дискорда сменен на Европу');
		} else {
			message.guild.setRegion("russia");
			message.channel.send('Регион дискорда сменен на Россию');
		}
	} else {
		message.channel.send('У вас нет прав на это действие.');
	};
}

export function ChangeChannelCap(message, limit) {
	if (message.member.voice.channel == null)
		throw 'Вы не в голосовом канале.';
	if (message.member.voice.channel.parent.id == config.categories.limited)
		throw 'Вы не можете изменить размер данной комнаты.';
	if (limit > -1 && limit < 100) {
		message.member.voice.channel.setUserLimit(limit);
	} else {
		throw 'Введено некорректное значение.';
	}
}

export function ClanMedalsSummary(channel) {
	var members = GetFullDiscordClanMemberList(channel.guild);

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
		.setAuthor("Aurora's Tilt — " + members.length + " members // увожаемые:")
		.setColor(0x00AE86)
		.setFooter("Horobot", "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
		.setTimestamp()

	for (let i = 35; i >= 6; i--) {
		var text = sorted[i].map(m => "<@" + m + ">").join("\n");
		var symbol = i < 7 ? "`📘`" : i < 16 ? "`📒`" : i < 24 ? "`📙`" : "`📕`";

		if (text.length > 0) embed.addField(symbol + " " + i + " " + symbol, text, true);
	}

	channel.send({ embed });
}

export function GetFullDiscordClanMemberList(guild) {
	var members = [];
	guild.roles.cache.find(r => r.id == config.roles.guildleader).members.forEach(m => members.push(m));
	guild.roles.cache.find(r => r.id == config.roles.guildmaster).members.forEach(m => members.push(m));
	guild.roles.cache.find(r => r.id == config.roles.guardians[3]).members.forEach(m => members.push(m));
	guild.roles.cache.find(r => r.id == config.roles.guardians[2]).members.forEach(m => members.push(m));
	guild.roles.cache.find(r => r.id == config.roles.guardians[1]).members.forEach(m => members.push(m));
	guild.roles.cache.find(r => r.id == config.roles.guardians[0]).members.forEach(m => members.push(m));
	guild.roles.cache.find(r => r.id == config.roles.newbie).members.forEach(m => members.push(m));
	guild.roles.cache.find(r => r.id == config.roles.afk).members.forEach(m => members.push(m));
	return members;
}

// ordered legend, master
const SECTOR_ROTATION_MAP = {
	0: [912873277, 3094493727],
	1: [1648125541, 912873274],
	2: [1070981430, 1648125538],
	3: [2936791996, 1070981425],
	4: [3094493720, 2936791995]
};

const SECTOR_REWARD_ROTATION_MAP = {
	0: [1572351682, 247000308],
	1: [176055472, 256080248],
	2: [1387420892, 2686128774],
	3: [2850782006, 2679019194]
};