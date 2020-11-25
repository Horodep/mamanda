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

export function showHelp(message) {
    embed = new MessageEmbed()
		  .setAuthor("Horobot :: Список доступных команд:")
		  .setColor(0x00AE86)
		  .setThumbnail('https://images-ext-1.discordapp.net/external/veZptUu_KDKmwtUJX5QT3QxESYCaRp4_k0XUwEQxubo/https/i.imgur.com/e9DIB8e.png')
		  .setFooter("Horobot", "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
		  .setTimestamp()
		  .addField("!help !horohelp", "список доступных команд;")
		  .addField("!region", "смена региона сервера;")
		  .addField("!mymt", "проверка активности стража в голосовом чате (только своей);")
		  .addField("!roles / !roles @DiscordTag", "отображение и выдача стражу заслуженных медалей;")
		  .addField("!сбор ДД.ММ ЧЧ:ММ название активности, комментарии", "создание сбора на активность на 6 человек;")
		  .addField("!cap NUMBER", "ограничение комнаты до NUMBER мест;")
		  .addField("!invitefriend @DiscordTag", "выдача роли 'Странник' вместо роли 'Очередь';\n_доступна опытным стражам_")
		  .addField("!medals", "стражи с большим количеством медалей;")
		  .addField("!triumph TRIUMPH_HASH", "отобразить стражей клана, получивших конкретный триумф;")
		  .addField("!triumphs", "топ 15 стражей клана по очкам триумфов текстом;")
		  .addField("!triumphs gimmeimageplz", "топ 15 стражей клана по очкам триумфов графиком;")
		  .addField("!rl / !rl @DiscordTag", "отчет по стражу на пригодность в качестве наставника;")
	message.channel.send({embed});
}

export function showGmHelp(message) {
    embed = new MessageEmbed()
        .setAuthor("Horobot :: Список ГМских команд:")
        .setColor(0x00AE86)
        .setThumbnail('https://images-ext-1.discordapp.net/external/veZptUu_KDKmwtUJX5QT3QxESYCaRp4_k0XUwEQxubo/https/i.imgur.com/e9DIB8e.png')
        .setFooter("Horobot", "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
        .setTimestamp()
        .addField("!gmhelp", "список доступных ГМ-ских команд;")
        .addField("!q", "список стражей в очереди;")
        .addField("!qq", "список анкет стражей в очереди;")
        .addField("!size", "количество стражей в составах;")
        .addField("!nicknames", "проверка никнеймов стражей;")
        .addField("!forumtime", "выдать всем стражам роли перед объявлением о наборе;")
        .addField("!forum LINKTEXT", "опубликовать объявление о наборе в канал новостей;")
        .addField("!membertime @DiscrordTag %day%", "выборка активности стража;\n_по умолчанию — 7 дней_")
        .addField("!setmaxtriumphs NUMBER", "обновить значение максимального количества триумфов;")
        
        .addField("!raidadd message_id member_id", "добавление в рейд стража;")
        .addField("!raidkick message_id member_id", "исключение из рейда стража, пример: https://media.discordapp.net/attachments/515244455033438209/626795525710020638/unknown.png")
        
        .addField("!n", "список новичков в клане;")
        .addField("!rl @DiscrordTag", "отчет по стражу на пригодность в качестве наставника;")
        .addField("!watermelon @DiscrordTag", "проверка стража на абуз;")
        .addField("!clankick %day%", "выборка активности малоактивных стражей;\n_по умолчанию — 7 дней_")
        .addField("!clankickpub %day%", "выборка активности самых малоактивных стражей;\n_по умолчанию — 7 дней_")
        .addField("!reset", "генерация текстового еженедельного ресета в текущий канал;")
        .addField("!testreset", "генерация ссылок на англоязычные изображения еженедельного ресета в текущий канал;")
        .addField("!xur", "геренация изображения товаров Зура в текущий канал;")
        .addField("!copy", "ручной запуск переноса в архив старых сборов рейдов;")
        .addField("!csr", "ручной запуск выдачи ролей всему клану;")
        .addField("!pmspam", "спам говном в личку по роли; НЕ ЮЗАТЬ;")
        .addField("!pvpdrop", "снять все пвп роли;")
    message.channel.send({embed});
}