const Discord = require("discord.js");
const config = require("./config.json");

exports.message = function (message) {
	if(message.channel.type == "text"){
		guild = client.guilds.get(config.guild);
		gm = guild.roles.find(role => role.id == config.roles.gm);
		if(gm.position <= message.member.highestRole.position){
			switch(args[0]) {
				case 'checksync':	checksync.checksync(message.channel);					break;
				case 'sync':		roles.roles_bytag(message.channel, args.length > 1 ? args[1] : message.member.id, true);					break;
				case 'message':
					channel = client.channels.get(args[1]);
					var message = args.filter((_,i) => i > 1).join(" ");
					channel.send(message);
					break;
				case 'pmspam':
					var userlist = message.guild.roles.find(role => role.name == "Путник").members;
					
					users_to_send = [];
					userlist.forEach(function(user1111, i, userlist) { 
						users_to_send.push(user1111);
					});
					
					var i = 0;
					
					var pm_spam = function(){
						if(i < users_to_send.length){
							var member = users_to_send[i];
							var member_message_text = "Уважаемый Путник, ознакомьтесь, пожалуйста, с объявлением.\nhttps://discordapp.com/channels/471020862045290496/479684908806307840/715354406735970345";
							member.send(member_message_text);
							console.log("pm "+ member.displayName);
							i++;
							setTimeout(pm_spam, 2000); 
						}
					}
					pm_spam();
					break;
				case 'watermelon':		watermelon.watermelon(message.channel, args.length > 1 ? args[1] : message.member.id);
					break;
				case 'setmaxtriumphs':
					if(args.length > 1){
						fs.writeFile('maxtriumphs.txt', args[1], function(error){
							if(error) throw error; // если возникла ошибкаS
						});
					}else{
						message.channel.send("нет данных!");
					}
					break;
				case 'forum':
					fs.writeFile('forumlink.txt', message.content.slice(7), function(error){
						if(error) throw error; // если возникла ошибка
					});
					channel_news = client.channels.get("479684908806307840");
					channel_news.send(
						"Уважаемые <@&471048548318969888>и, <@&564787660745605120>и и @everyone остальные, кому не безразлична судьба нашего клана! <@&572759337836216330>\n"+
						"Поднимите, пожалуйста, пост о наборе нажатием на стрелочку вверх на форуме.\n"+
						message.content.slice(7)).then((msg)=>{
						msg.react("🆗");
					});
					break;
				case 'forumtime':
					var userlistraw = message.guild.roles.find(role => role.id == "572759337836216330").members;
					userlist = [];
					userlistraw.forEach(function(user1111, i, userlistraw) { 
						userlist.push(user1111);
					});
					
					var i = 0;
					var seaker = message.guild.roles.find(role => role.name == "не апнул тему на форуме");
					var giverole = function(){
						if(i < userlist.length){
							var member = userlist[i];
							member.addRole(seaker);
							console.log("setRole forum (" + i + "/" + userlist.length + ")", member.displayName); 
							i++;
							setTimeout(giverole, 1000); 
							if (i == userlist.length) message.channel.send("роли выданы!");
						}
					}
					giverole();
					break;
				case 'testreset':
					var yyyy = date.getFullYear();
					var dd = date.getDate();
					if(dd<10) { dd='0'+dd; }
					var mm = date.getMonth()+1; 
					if(mm<10) { mm='0'+mm; } 
					
					message.channel.send(
						"Reset by Kyber3000\n"+
						"https://kyberscorner.files.wordpress.com/"+yyyy+"/"+mm+"/destiny-2-weekly-reset-summary-"+mm+"-"+dd+"-"+yyyy+".png\n"+
						"https://kyberscorner.files.wordpress.com/"+yyyy+"/"+mm+"/destiny-2-weekly-raid-challenges-by-kyber3000-"+mm+"-"+dd+"-"+yyyy+".png");
					break;
				case 'xur':
					reset.auth(boss);
					setTimeout(function (){
						reset.xur(message.channel);
					}, 2000); 
					break;
				case 'reset':
					reset.auth(boss);
					setTimeout(function (){
						reset.weeklyreset(message.channel);
					}, 2000); 
					break;
				case 'membertime':
					clantime.membertime(message, (args.length > 1 ? args[1].replace(/\D/g,'') : message.member.id), (args.length > 2 ? args[2] : 7), true);
					break;
				case 'copy':					raid.copy(client);					break;
				case 'raidadd':
					if(args.length > 2){
						var chan = client.channels.get("626432384643891220");
						chan.fetchMessage(args[1]).then(msg => {
							raid.yes(msg, client.users.get(args[2]), null);
							setTimeout(function (){
								message.delete();
							}, 5000);
						});
					}else{
						message.channel.send('Указаны не все параметры');
					};
					break;
				case 'raidkick':							
					if(args.length > 2){
						var chan = client.channels.get("626432384643891220");
						chan.fetchMessage(args[1]).then(msg => {
							raid.no(msg, client.users.get(args[2]), null);
							setTimeout(function (){
								message.delete();
							}, 5000);
						});
					}else{
						message.channel.send('Указаны не все параметры');
					};
					break;
				case 'size':			count.count(message);														break;
				case 'ck':
				case 'clankick':		clantime.clantime(message, (args.length > 1 ? args[1] : 7), 'full');		break;
				case 'ckp':
				case 'clankickpub':		clantime.clantime(message, (args.length > 1 ? args[1] : 7), 'pub');			break;
				case 'csr':				roles.set_clan_roles(message.channel);										break;
				case 'nicknames':		dclan.dclan(message, true, message.channel);								break;
				case 'q':				query.q(message);															break;
				case 'qq':				query.qq(message);															break;
				case 'n':				query.n(message);															break;
				case 'pvpdrop':
					var t1 = message.guild.roles.find(role => role.name == "💠 Левая рука Шакса");
					t1.members.forEach(function(member) {
						setTimeout(function (){
							member.removeRole(t1);
						}, 5000);
					});
					var t2 = message.guild.roles.find(role => role.name == "💠💠 Правая рука Шакса");
					t2.members.forEach(function(member) {
						setTimeout(function (){
							member.removeRole(t2);
						}, 5000);
					});
					var t3 = message.guild.roles.find(role => role.name == "💠💠💠 Машина");
					t3.members.forEach(function(member) {
						setTimeout(function (){
							member.removeRole(t3);
						}, 5000);
					});
					break;
				case 'gmhelp':				gmhelp(message);					break;
			}
		}else{
			message.channel.send('У вас нет прав на это действие. (' + topRole + ' ' + minRole + ')');
		};
	}else{
		message.channel.send('GM-ские команды нельзя использовать в ЛС.');
	}
}
function gmhelp(message){
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