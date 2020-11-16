const Discord = require("discord.js");

exports.inviteFriend = (message) => {
	var topRole = message.member.highestRole.position;
	var minRole = message.guild.roles.find(role => role.name === "Опытный Страж").position;
	
	if(minRole <= topRole){
		var d_member = message.guild.members.find(member => member.user.id == (args[1].replace(/\D/g,'')));
		
		if (d_member == null){
			message.channel.send('Страж не найден.');
		}else{
			if((d_member.roles.find(role => role.name === "Очередь") && d_member.roles.size === 2)
																	 || d_member.roles.size === 1){
				var role_old = message.guild.roles.find(role => role.name === "Очередь");
				var role_new = message.guild.roles.find(role => role.name === "Путник");
				d_member.addRole(role_new);
				d_member.removeRole(role_old);
				message.channel.send('Стражу ' + d_member.displayName + ' приоткрыли двери.');
			}else{
				message.channel.send('Страж уже часть клана.');
			}
		}
	}else{
		message.channel.send('У вас нет прав на это действие.');
	};
}

exports.changeRegion = (message) => {
    var topRole = message.member.highestRole.position;
	var minRole = message.guild.roles.find(role => role.name === "Guardian is down").position;
	
	if(minRole <= topRole){
		if(message.guild.region == "russia"){
			message.guild.setRegion("eu-central");
			message.channel.send('Регион дискорда сменен на Европу');
		}else{
			message.guild.setRegion("russia");
			message.channel.send('Регион дискорда сменен на Россию');
		}
	}else{
		message.channel.send('У вас нет прав на это действие. (' + topRole + ' ' + minRole + ')');
	};
}

exports.changeChannelCap = (message) => {
    if (message.member.voiceChannel == null){
        message.channel.send('Вы не в голосовом канале.');
    }else if( message.member.voiceChannel.id == "568319252558512129" ||
        message.member.voiceChannel.id == "568319320657231909" ||
        message.member.voiceChannel.id == "601927549198794755" ||
        message.member.voiceChannel.id == "639170376366030888" ||
        message.member.voiceChannel.id == "568319415532126219" ||
        message.member.voiceChannel.id == "568319461225136129" ||
        message.member.voiceChannel.id == "601927666173607937" ||
        message.member.voiceChannel.id == "631893130387521541" ||
        message.member.voiceChannel.id == "631893153502461992"){
        message.channel.send('Вы не можете изменить размер данной комнаты.');
    }else{
        try{
			message.member.voiceChannel.setUserLimit(args.length > 1 ? args[1] : 0);
	    }catch{
	    	message.channel.send('Введено некорректное значение.');
      }
    }
}

exports.showHelp = (message) => {
    embed = new Discord.RichEmbed()
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

exports.showGmHelp = (message) => {
    embed = new Discord.RichEmbed()
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