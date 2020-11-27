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