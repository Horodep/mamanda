const Discord = require("discord.js");

exports.main = function (reaction, user) {
	if(reaction.message.channel.type == "text" && reaction.message.member.user.id == 543342030768832524){
		console.log(`${user.username} removed reaction.`);
		var member = reaction.message.member.guild.members.find(mmbr => mmbr.user.id === user.id);
		switch(reaction.message.content){
			case "Хочу Петраран (ПЖ без смертей)":
				var petrarun = member.guild.roles.find(role => role.name === "Хочу Петраран");
				console.log(user.username + " doesn't want petrarun.");
				member.removeRole(petrarun);
				break;
			case "Хочу Алмаз (ИП без смертей)":
				var diamond = member.guild.roles.find(role => role.name === "Хочу Алмаз");
				console.log(user.username + " doesn't want diamond.");
				member.removeRole(diamond);
				break;
			case "Хочу Корону (КС без смертей)":
				var crown = member.guild.roles.find(role => role.name === "Хочу Корону");
				console.log(user.username + " doesn't want crown.");
				member.removeRole(crown);
				break;
			case "Хочу Совершенство (СС без смертей)":
				var garden = member.guild.roles.find(role => role.name === "Хочу Совершенство");
				console.log(user.username + " doesn't want garden.");
				member.removeRole(garden);
			case "Хочу Ниобу (лаборатория ниоба)":
				var nioba = member.guild.roles.find(role => role.name === "Хочу Ниобу");
				console.log(user.username + " doesn't want nioba.");
				member.removeRole(nioba);
				break;
			case "":
				if(!user.bot) {
					//raid.no(reaction, user);
				}
				break;
		}
	}
};