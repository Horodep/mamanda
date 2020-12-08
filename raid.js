var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const Discord = require("discord.js");
const keys = require('./keys');
const logging = require('./logging');
var d2apiKey = keys.d2apiKey();

exports.create_raid = function(message, args) {
	try{
		var today = new Date();
		//raid 22.09 18:00 кс, рандомный комент
		var date = new Date(today.getFullYear() , args[1].split('.')[1]-1, args[1].split('.')[0], args[2].split(':')[0], args[2].split(':')[1]);
		if(date < today) date = new Date(today.getFullYear()+1 , args[1].split('.')[1]-1, args[1].split('.')[0], args[2].split(':')[0], args[2].split(':')[1]);
		
		if(isNaN(date) || typeof(date) == 'underfined') throw(null);
		console.log(date);
		console.log(today);
		
		var raidinfo = args.filter((_,i) => i > 2).join(" ");
		var header = date.getDate() + "." + (date.getMonth()+1) + "." + date.getFullYear() + 
					 ", " + weekday(date.getDay()) + 
					 " в " + args[2] + 
					 " Активность: " + (raidinfo.indexOf(',') == -1 ? raidinfo : raidinfo.substr(0, raidinfo.indexOf(',')));
					 
		var description = (raidinfo.indexOf(',') == -1 ? null : raidinfo.substr(raidinfo.indexOf(',')+1));
		
		var re = /<@.\d+>/g;
		var found = (description == null ? null : description.match(re));
		var filteredDescription = (description == null ? '' : description.replace(re, '').replace(/\s/g, ''));
		
		var reNum = /^\[\d+\]/;
		var foundNum = raidinfo.match(reNum);
		var numonly = /\d/;
		var num = (foundNum == null) ? 6 : foundNum[0].match(/\d+/);
		var field0 = "слот свободен\n".repeat(Math.round(num/2));
		var field1 = "слот свободен\n".repeat((num/2)%1 == 0.5 ? (num/2)-0.5 : (num/2));
		field0 = field0.replace("слот свободен", "<@" + message.member.id + ">");
		if (foundNum != null) header = header.replace(foundNum[0], "");
		
		if(header.length <= 256 && (description == null || description.length <= 2048) && num > 1){
			var embed = new Discord.RichEmbed()
				  .setAuthor(header.replace("  ", " "))
				  .setColor(0x00AE86)
				  .setThumbnail('https://images-ext-2.discordapp.net/external/SfRL0Sj2a3O9vtAYpaC2OUG0r0vDipe2h8LeeZnFdf4/https/i.imgur.com/KBiRw8F.png')
				  //.addField("Идут:", "<@" + message.member.id + ">" + "\nслот свободен\nслот свободен", true)
				  //.addField("Идут:", "слот свободен\nслот свободен\nслот свободен", true)
				  .addField("Идут:", field0, true)
				  .addField("Идут:", field1, true)
				  .setFooter("Собрал: "+message.member.displayName + " | id: " + message.member.id, message.member.user.avatarURL)
			
			if(description != null && filteredDescription != '') embed.setDescription(description);
			
			if (message.channel.id == "626432384643891220" || found != null) message.channel.send(found != null ? found.join(' ') : "@here");
			message.channel.send({embed}).then((msg)=>{
				msg.react("✅");
				msg.react("❌");
			});
		}else{
			message.channel.send("Неверный синтаксис:\nДлина заголовка сбора не может быть больше 256 символов;\n"+
								 "Длина комментария сбора не может быть больше 2048 символов;\n"+
								 "Активность можно собрать не менее, чем на двоих участников.\n"+
								 "Вы написали:\n```"+message.content+"```").then((msg)=>{
				setTimeout(function (){
					msg.delete();
				}, 30000);
			});
		}
		message.delete();
	}catch(e){
		console.log(e);
		if (e != null) console.log(e.name + " : " + e.message);
		message.channel.send("Неверный синтаксис\nДолжно быть:\n```!сбор ДД.ММ ЧЧ:ММ активность, комментарии```\n"+
							 "Вы написали:\n```"+message.content+"```").then((msg)=>{
			message.delete();
			setTimeout(function (){
				msg.delete();
			}, 30000);
		});
	}
}

exports.yes = function(message, user, reaction){
	console.log(reaction != null ? "yes" : "add");
	var channel = message.channel;
	try{
		var fields = message.embeds[0].fields;
		
		if(fields[0].name == "Идут:"){
			var field0 = fields[0].value;
			var field1 = fields[1].value;
			if(!field0.includes(user.id) && !field1.includes(user.id)){
				if(field0.includes("слот свободен")){
					field0 = field0.replace("слот свободен", "<@" + user.id + ">");
				}else if(field1.includes("слот свободен")){
					field1 = field1.replace("слот свободен", "<@" + user.id + ">");
				}
			}
			
			var left = fields.length > 2 ? fields[2].value : "";
			var regex = new RegExp("\`.*?\` <@" + user.id + ">");
			//left=left.replace(/\`.*?\` <@149245139389251584>/, '');
			left=left.replace(regex, '');
			left=left.replace('\n\n', '\n');
			console.log(left);
			
			var embed = new Discord.RichEmbed()
				  .setAuthor(message.embeds[0].author.name)
				  .setColor(0x00AE86)
				  .setThumbnail('https://images-ext-2.discordapp.net/external/SfRL0Sj2a3O9vtAYpaC2OUG0r0vDipe2h8LeeZnFdf4/https/i.imgur.com/KBiRw8F.png')
				  .addField("Идут:", field0, true)
				  .addField("Идут:", field1, true)
				  .setFooter(message.embeds[0].footer.text, message.embeds[0].footer.iconURL)
			if(left.length > 5) embed.addField("Отменили запись:", left)
			if(message.embeds[0].description != null) embed.setDescription(message.embeds[0].description);
			message.edit({embed});
		}
	}catch(e) {
		channel.send("Ошибка записи." + e.name + ":" + e.message + "\n<@149245139389251584> \n" + e.stack).then((msg)=>{
			setTimeout(function (){
				msg.delete();
			}, 15000);
		});
	}
	if(reaction != null) reaction.remove(user);
};

exports.no = function(message, user, reaction){
	console.log(reaction != null ? "no" : "kick");
	var channel = message.channel;
	try{
		var fields = message.embeds[0].fields;
		
		if(fields[0].name == "Идут:"){
			var field0 = fields[0].value;
			var field1 = fields[1].value;
			if(field0.includes(user.id)){
				field0 = field0.replace("<@" + user.id + ">", "слот свободен");
			}else if(field1.includes(user.id)){
				field1 = field1.replace("<@" + user.id + ">", "слот свободен");
			}
			var left = fields.length > 2 ? fields[2].value : "";
			var tzoffset = (new Date()).getTimezoneOffset() * 60000;
			var leaver = "\n`" + (new Date(Date.now() - tzoffset)).toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(5, 16) + "` <@" + user.id + ">";
			if (reaction != null) if (!left.includes(user.id)) left+=leaver;
			
			var embed = new Discord.RichEmbed()
				  .setAuthor(message.embeds[0].author.name)
				  .setColor(0x00AE86)
				  .setThumbnail('https://images-ext-2.discordapp.net/external/SfRL0Sj2a3O9vtAYpaC2OUG0r0vDipe2h8LeeZnFdf4/https/i.imgur.com/KBiRw8F.png')
				  .addField("Идут:", field0, true)
				  .addField("Идут:", field1, true)
				  .setFooter(message.embeds[0].footer.text, message.embeds[0].footer.iconURL)
			if(left.length > 5) embed.addField("Отменили запись:", left)
			if(message.embeds[0].description != null) embed.setDescription(message.embeds[0].description);
			message.edit({embed});
		}
	}catch(e) {
		channel.send("Ошибка дезаписи." + e.name + ":" + e.message + "\n<@149245139389251584> \n" + e.stack).then((msg)=>{
			setTimeout(function (){
				msg.delete();
			}, 15000);
		});
	}
	
	if(reaction != null) reaction.remove(user);
};

exports.kick_position = function(message, user, reaction, client){
	//console.log(reaction);
	var author_id = message.embeds[0].footer.text.split('id: ')[1];
	if (author_id == user.id){
		var fields = message.embeds[0].fields;
		var field0 = fields[0].value;
		var field1 = fields[1].value;
		
		var line = "";
		console.log("kick "+reaction._emoji.name);
		
		var count = (field0.match(/\n/g) || []).length + 1;
		var kick_number = reaction._emoji.name.charAt(0);
		
		if(kick_number>count){
			line = fields[1].value.split('\n')[kick_number - count - 1];
			field1 = field1.replace(line, "слот свободен");
		}else{
			line = fields[0].value.split('\n')[kick_number - 1];
			field0 = field0.replace(line, "слот свободен");
		}
		
		/*
		if(reaction._emoji.name.startsWith("1")){
			line = fields[0].value.split('\n')[0];
			field0 = field0.replace(line, "слот свободен");
		}else if(reaction._emoji.name.startsWith("2")){
			line = fields[0].value.split('\n')[1];
			field0 = field0.replace(line, "слот свободен");
		}else if(reaction._emoji.name.startsWith("3")){
			line = fields[0].value.split('\n')[2];
			field0 = field0.replace(line, "слот свободен");
		}else if(reaction._emoji.name.startsWith("4")){
			line = fields[1].value.split('\n')[0];
			field1 = field1.replace(line, "слот свободен");
		}else if(reaction._emoji.name.startsWith("5")){
			line = fields[1].value.split('\n')[1];
			field1 = field1.replace(line, "слот свободен");
		}else if(reaction._emoji.name.startsWith("6")){
			line = fields[1].value.split('\n')[2];
			field1 = field1.replace(line, "слот свободен");
		}*/
		
		var discord_id = line.replace(/\D/g,'');
		console.log(discord_id);
		if(discord_id.length > 0){
			var member = message.guild.members.find(user => user.id == discord_id);
			var member_message_text = "Рейд лидер отказался от вашего участия в рейде, в который вы записывались.\n> Рейд: **" + 
						message.embeds[0].author.name.split('Рейд: ')[1] + "**\n> Дата проведения: **" + 
						message.embeds[0].author.name.split('Рейд: ')[0] + "**\n> Рейд лидер: **" + 
						message.embeds[0].footer.text.split('|')[0].replace("Собрал: ", "") + "**";
			member.send(member_message_text);
			logging.log(client, "__Игроку <@" + member.id + "> [" + member.displayName + "] отправлено сообщение:__\n" + member_message_text);
			
			var left = fields.length > 2 ? fields[2].value : "";
			var embed = new Discord.RichEmbed()
				  .setAuthor(message.embeds[0].author.name)
				  .setColor(0x00AE86)
				  .setThumbnail('https://images-ext-2.discordapp.net/external/SfRL0Sj2a3O9vtAYpaC2OUG0r0vDipe2h8LeeZnFdf4/https/i.imgur.com/KBiRw8F.png')
				  .addField("Идут:", field0, true)
				  .addField("Идут:", field1, true)
				  .setFooter(message.embeds[0].footer.text, message.embeds[0].footer.iconURL)
			if(left.length > 5) embed.addField("Отменили запись:", left)
			if(message.embeds[0].description != null) embed.setDescription(message.embeds[0].description);
			message.edit({embed});
		}
	}else{
		user.send("Вы не являетесь автором сбора. Вы не можете им управлять.");
	}
}

exports.cancel = function(message, user, reaction, client){
	var author_id = message.embeds[0].footer.text.split('id: ')[1];
	if (author_id == user.id){
		var fields = message.embeds[0].fields;
		var list = (fields[0].value + '\n' + fields[1].value).split('\n');
		list.forEach(function (text){
			var discord_id = text.replace(/\D/g,'');
			if(discord_id.length > 0){
				var member = message.guild.members.find(user => user.id == discord_id);
				var member_message_text = "Рейд на который вы записывались был отменен рейд лидером.\n> Рейд: **" + 
							message.embeds[0].author.name.split('Рейд: ')[1] + "**\n> Дата проведения: **" + 
							message.embeds[0].author.name.split('Рейд: ')[0] + "**\n> Рейд лидер: **" + 
							message.embeds[0].footer.text.split('|')[0].replace("Собрал: ", "") + "**";
				member.send(member_message_text);
				setTimeout(function (){
					logging.log(client, "__Игроку <@" + member.id + "> [" + member.displayName + "] отправлено сообщение:__\n" + member_message_text);
				}, 3000);
			}
		});
		
		message.delete();
	}else{
		user.send("Вы не являетесь автором сбора. Вы не можете его отменить.");
	}
}

exports.copy = function(client) {
	var raid_channel = client.channels.get("626432384643891220");	// 
	var history_channel = client.channels.get("528320278292332544");// 627098154734452736
	raid_channel.fetchMessages({ limit: 50 }).then(messages => {
		var today = new Date();
		var lastMessage;
		messages.sort(function(a, b) {
			return a.id > b.id ? 1 : -1
		}).forEach(function(value, key, map) {
			if(!value.content.startsWith("Это канал для") && !value.content.startsWith("`12.` Система наказаний")){
				if(value.author.bot) {
					console.log(key + " " + value.content);
					if(value.content != ""){
						lastMessage = value;
					}else{
						var date = new Date(Number(value.embeds[0].author.name.split('.')[2].split(',')[0]),
											Number(value.embeds[0].author.name.split('.')[1]-1), 
											Number(value.embeds[0].author.name.split('.')[0])+1);
						
						console.log(date, today);
						if(date < today){
							console.log("have to be moved");
							var embed = new Discord.RichEmbed()
								  .setAuthor(value.embeds[0].author.name)
								  .setDescription(value.embeds[0].description)
								  .setColor(0x00AE86)
								  .setThumbnail('https://images-ext-2.discordapp.net/external/SfRL0Sj2a3O9vtAYpaC2OUG0r0vDipe2h8LeeZnFdf4/https/i.imgur.com/KBiRw8F.png')
								  .addField("Идут:", value.embeds[0].fields[0].value, true)
								  .addField("Идут:", value.embeds[0].fields[1].value, true)
								  .setFooter(value.embeds[0].footer.text, value.embeds[0].footer.iconURL)
								  .setTimestamp(value.createdAt)
							if(value.embeds[0].fields.length > 2) embed.addField("Отменили запись:", value.embeds[0].fields[2].value)
							if(value.embeds[0].description != null) embed.setDescription(value.embeds[0].description);
							//if(lastMessage.content != "@here") embed.addField("Доп. инфа:", lastMessage.content)
							
							history_channel.send({embed});
							value.delete();
							lastMessage.delete();
						}
					}
				}else{
					console.log(key + " " + value.content + " non bot");
					value.delete();
				}
			}
		});
	})
}

function weekday(num){
	switch(num){
		case 0: return "воскресенье"; break;
		case 1: return "понедельник"; break;
		case 2: return "вторник"; break;
		case 3: return "среда"; break;
		case 4: return "четверг"; break;
		case 5: return "пятница"; break;
		case 6: return "суббота"; break;
	}
}