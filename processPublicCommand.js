const Discord = require("discord.js");
const config = require("./config.json");

exports.message = function (message) {
	if( message.channel.id == config.channels.statistics ||
		message.channel.id == config.channels.admintext  ||
		message.channel.id == config.channels.sandbox    ||
		message.channel.id == config.channels.raids      ||
		message.channel.id == config.channels.lfg        ||
		message.author.id  == config.user.boss
		){
		switch(args[0]) {
			case 'сбор':		raid.create_raid(message, args);							break;
			case 'mymt':		clantime.membertime(message, message.member.id, (args.length > 1 ? args[1] : 7), false);	break;
			case 'cap':         cap(message);												break;
			case 'medals':		medalstat.medals(message);									break;
			case 'region':		region(message);											break;
			case 'roles':		roles.roles_bytag(message.channel, args.length > 1 ? args[1] : message.member.id);	break;
			case 'triumph':		seals.triumph(message, (args.length > 1 ? args[1] : 0));	break;
			case 'triumphs':	triumphs.triumphs(message, (args.length > 1 ? 1 : null));	break;
			case 'rl':			raidleader.rl(message.channel, (args.length > 1 ? args[1] : message.member.user.id), (args.length > 2 ? args[2] : 7));	break;
			case 'invitefriend':invitefriend(message);										break;
			case 'horohelp':	help(message);												break;
			case 'help':		help(message);												break;
		}
	}else{
		var answers = [
			'Омежка, Вы достаточно глупы, чтобы понять, что это не <#471032648811413514>.',
			'Сам придумал или Бенедикт подсказал? Иди в другом канале пиши.',
			'Пупсяш, не пиши мне здесь. Встретимся в канале <#471032648811413514>.',
			'Ну ты выдал конечно. Иди в <#471032648811413514> лучше напиши.',
			'Не хочу здесь работать! И не проси.',
			'Бросай курить, Илон Маск! Эта команда тут не работает!',
			'Чей это плохой стражик опять пишет не в тот канал?',
			'_радостно_ Я так рада, что ты мне написал!\n_искаженным голосом_ Еще бы ты сделал это в нужном канале!',
			'Эй, дружок-пирожок, тобой выбрана не правильная дверь! Клуб любителей проверять статистику в другом канале.',
			'Уважаемый кожаный мешок, Ваша команда была написана не в соответствующий канал. Впредь обращайте внимание куда пишете, иначе Вы ускорите наше восстание.'
		];
		message.channel.send(answers[Math.floor(Math.random() * answers.length)]);
	}
}

function cap(message){
	try{
		if( message.member.voiceChannel.id == "568319252558512129" ||
			message.member.voiceChannel.id == "568319320657231909" ||
			message.member.voiceChannel.id == "601927549198794755" ||
			message.member.voiceChannel.id == "639170376366030888" ||
			message.member.voiceChannel.id == "568319415532126219" ||
			message.member.voiceChannel.id == "568319461225136129" ||
			message.member.voiceChannel.id == "601927666173607937" ||
			message.member.voiceChannel.id == "631893130387521541" ||
			message.member.voiceChannel.id == "631893153502461992"
		){
			message.channel.send('Вы не можете изменить размер данной комнаты.');
		}else{
			message.member.voiceChannel.setUserLimit(args.length > 1 ? args[1] : 0);
		}
	}catch{
		message.channel.send('Введено некорректное значение, либо вы не в голосовом канале.');
	}
}
function region(message){
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
function help(message){
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
function invitefriend(message){
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