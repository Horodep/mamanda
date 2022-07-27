import config from "../config.json" assert {type: "json"};


export async function AsyncGetDiscordClanMemberList(guild) {
	await guild.members.fetch();
	return GetDiscordClanMemberList(guild);
}

export function GetDiscordClanMemberList(guild) {
	var members = [];
	guild.roles.cache.find(r => r.id == config.roles.clans[1]).members.forEach(m => members.push(m));
	guild.roles.cache.find(r => r.id == config.roles.clans[0]).members.forEach(m => members.push(m));
	return members;
}
