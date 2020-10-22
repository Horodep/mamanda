const Discord = require("discord.js");
const config = require("./config.json");

exports.main = function (message) {
	try {
		if (message.content.StartsWith("!")) {
			const publicCommands = ['сбор','mymt','cap','invitefriend','medals','region','roles',
							'rl','triumph','triumphs','horohelp','help'];
			const adminCommands = ['testreset', 'xur','reset','membertime','copy','raidadd','raidkick',
							'size','ck','clankick','ckp','clankickpub', 'csr','nicknames','q','qq',
							'n','gmhelp','pvpdrop', 'pmspam', 'forum', 'forumtime', 'setmaxtriumphs', 
							'watermelon', 'message', 'sync', 'checksync'];
			const developerCommands = ['oauth2','code'];
			const notLimitedCommands = ['pinghorobot','rand','clown']; 
			
			console.log(new Date(), ( message.member != null ? message.member.displayName : message.author.username), message.content); 
			var args = message.content.replace('  ', ' ').replace('  ', ' ').substring(1).split(' ');
			
			if(notLimitedCommands.includes(args[0])){
				switch(args[0]) {
					case 'pinghorobot':		message.channel.send('pong');						break;
					case 'rand':			message.channel.send(emoji.random().emoji);			break;
					case 'clown':			message.channel.send('🤡');							break;
				}
			}else if(developerCommands.includes(args[0])){
				if(message.author.id == config.users.developer){
					switch(args[0]) {
						case 'oauth2':		message.channel.send("https://www.bungie.net/ru/OAuth/Authorize?response_type=code&client_id="+config.d2clientId+"&state=12345"); 							break;
						case 'code':		reset.newToken(message, args[1]); 					break;
					}
				}
			}else if(publicCommands.includes(args[0])){
				require('./processPublicCommand').message(message);
			}else if(adminCommands.includes(args[0])){
				require('./processAdminCommand').message(message);
			}
		}else if(message.channel.type != "text" && !message.author.bot){
			channel_sandbox = client.channels.cashe.get(config.channels.sandbox);
			channel_sandbox.send("**" + message.author.username + "** написал в ЛС:\n"+message.content);
		}
	} catch(e) {
		require('./catcherror').catcherror(e);
	}
};