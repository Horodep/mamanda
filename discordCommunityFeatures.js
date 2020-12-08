import { MessageEmbed } from "discord.js";
import config from "./config.json";

export function ClanMedalsSummary(channel) {
    var members = getFullDiscordClanMemberList(channel.guild);

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

    for (let i = 35; i > 6; i--) {
        var text =  sorted[i].map(m => "<@"+m+">").join("\n");
        var symbol = i < 7 ? "`📘`" : i < 16 ? "`📒`" : i < 24 ? "`📙`" : "`📕`";

        if (text.length > 0) embed.addField(symbol + " " + i + " " + symbol, text, true);
    }

    channel.send({ embed });
}				

export function getFullDiscordClanMemberList(guild){
	var members = [];
	guild.roles.cache.find(r => r.id == config.roles.guildleader).members.forEach(m => members.push(m));
	guild.roles.cache.find(r => r.id == config.roles.guildmaster).members.forEach(m => members.push(m));
	guild.roles.cache.find(r => r.id == config.roles.raidleader).members.forEach(m => members.push(m));
	guild.roles.cache.find(r => r.id == config.roles.guardians[3]).members.forEach(m => members.push(m));
	guild.roles.cache.find(r => r.id == config.roles.guardians[2]).members.forEach(m => members.push(m));
	guild.roles.cache.find(r => r.id == config.roles.guardians[1]).members.forEach(m => members.push(m));
	guild.roles.cache.find(r => r.id == config.roles.guardians[0]).members.forEach(m => members.push(m));
	guild.roles.cache.find(r => r.id == config.roles.newbie).members.forEach(m => members.push(m));
	guild.roles.cache.find(r => r.id == config.roles.afk).members.forEach(m => members.push(m));
	return members;
}