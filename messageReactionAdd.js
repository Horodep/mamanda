const Discord = require("discord.js");

exports.main = function (reaction, user) {
	if(reaction.message.member.user.id == 149245139389251584){
		if(reaction.message.content.startsWith("Хочу быть ГМ-ом")){
			var gmchannel = client.channels.get("515542566695862285");
			gmchannel.send("<@"+user.id+"> хочет стать ГМ-ом.");
		}else
		if(reaction.message.content.startsWith("Хочу быть Наставником")){
			var gmchannel = client.channels.get("515542566695862285");
			gmchannel.send("<@"+user.id+"> хочет стать Наставником.");
		}
	}
	
	if(reaction.message.channel.type == "text" && reaction.message.member.user.id == 543342030768832524){
		console.log(`${user.username} set reaction.`);
		var member = reaction.message.member.guild.members.find(mmbr => mmbr.user.id === user.id);
		switch(reaction.message.content){
			case "Хочу Петраран (ПЖ без смертей)":
				var petrarun = member.guild.roles.find(role => role.name === "Хочу Петраран");
				console.log(user.username + " wants petrarun.");
				member.addRole(petrarun);
				break;
			case "Хочу Алмаз (ИП без смертей)":
				var diamond = member.guild.roles.find(role => role.name === "Хочу Алмаз");
				console.log(user.username + " wants diamond.");
				member.addRole(diamond);
				break;
			case "Хочу Корону (КС без смертей)":
				var crown = member.guild.roles.find(role => role.name === "Хочу Корону");
				console.log(user.username + " wants crown.");
				member.addRole(crown);
				break;
			case "Хочу Совершенство (СС без смертей)":
				var garden = member.guild.roles.find(role => role.name === "Хочу Совершенство");
				console.log(user.username + " wants garden.");
				member.addRole(garden);
				break;
			case "Хочу Ниобу (лаборатория ниоба)":
				var nioba = member.guild.roles.find(role => role.name === "Хочу Ниобу");
				console.log(user.username + " wants nioba.");
				member.addRole(nioba);
				break;
			case "":
				if(!user.bot &&
					reaction.message.embeds[0] != null &&
					reaction.message.embeds[0].footer.text.startsWith("Собрал")) {
					if(reaction._emoji.name == "✅"){ // white_check_mark
						raid.yes(reaction.message, user, reaction);
						reaction.remove(user);
					}else if(reaction._emoji.name == "❌"){ // x
						raid.no(reaction.message, user, reaction);
						reaction.remove(user);
					}else if(reaction._emoji.name == "🚫"){ // cancel
						raid.cancel(reaction.message, user, reaction, client);
						if(typeof(reaction.message) != "undefined") reaction.remove(user);
					}else{
						raid.kick_position(reaction.message, user, reaction, client);
						reaction.remove(user);
					}
				}
				break;
			default: 								// any message
				if(!user.bot) {				    	// with user reaction
					if(reaction._emoji.name == "🆗"){ // OK
						var seaker = member.guild.roles.find(role => role.name == "не апнул тему на форуме");
						member.removeRole(seaker);
						console.log(user.username + " set OK to bot message.");
					}
				}
				break;
		}
	}
};
