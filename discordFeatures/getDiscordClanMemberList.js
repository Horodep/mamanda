import config from "../config.json";

export function GetDiscordClanMemberList(guild) {
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
