import { MessageEmbed } from "discord.js";
import config from "./config.json";

export function InviteFriend(message, discordMention) {
	var topRole = message.member.roles.highest.position;
	var minRole = message.guild.roles.cache.find(role => role.id == config.roles.guardians[1]).position;
	
	if(minRole <= topRole){
		var discordId = discordMention.replace(/\D/g,'')
		var discordMember = message.guild.members.cache.find(member => member.user.id == discordId);
		
		if (discordMember == null){
			message.channel.send('Страж не найден.');
			return;
		}
		
		if(discordMember.roles.cache.find(role => role.id == config.roles.queue)){
			var role_old = message.guild.roles.cache.find(role => role.id == config.roles.queue);
			var role_new = message.guild.roles.cache.find(role => role.id == config.roles.guest);
			discordMember.roles.add(role_new);
			discordMember.roles.remove(role_old);

			message.channel.send(`Стража <@${discordId}> пустили на сервер.`);
		}
	}else{
		message.channel.send('У вас нет прав на это действие.');
	};
}

export function ChangeRegion(message) {
    var topRole = message.member.roles.highest.position;
	var minRole = message.guild.roles.cache.find(role => role.id == config.roles.afk).position;
	
	if(minRole <= topRole){
		if(message.guild.region == "russia"){
			message.guild.setRegion("eu-central");
			message.channel.send('Регион дискорда сменен на Европу');
		}else{
			message.guild.setRegion("russia");
			message.channel.send('Регион дискорда сменен на Россию');
		}
	}else{
		message.channel.send('У вас нет прав на это действие.');
	};
}

export function ChangeChannelCap(message, limit) {
    if (message.member.voice.channel == null){
		message.channel.send('Вы не в голосовом канале.');
		return;
	}
	if( config.channels.limited.includes(message.member.voice.channel.id)){
		message.channel.send('Вы не можете изменить размер данной комнаты.');
		return;
	}
	try{
		message.member.voice.channel.setUserLimit(limit);
	}catch{
		message.channel.send('Введено некорректное значение.');
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

    for (let i = 35; i > 6; i--) {
        var text =  sorted[i].map(m => "<@"+m+">").join("\n");
        var symbol = i < 7 ? "`📘`" : i < 16 ? "`📒`" : i < 24 ? "`📙`" : "`📕`";

        if (text.length > 0) embed.addField(symbol + " " + i + " " + symbol, text, true);
    }

    channel.send({ embed });
}				

export function GetFullDiscordClanMemberList(guild){
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