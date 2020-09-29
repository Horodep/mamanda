const Discord = require("discord.js");
const config = require("./config.json");

exports.main = function(message) {
	console.log("messageDeleted");
	try{
		client = message.client;
		if(!message.author.bot &&
			message.channel.id != config.channels.raids &&
			message.channel.id != config.channels.lfg){
				channel_deleted = client.channels.cashe.get(config.channels.deleted);
				console.log(message.content, message.content.split("@").join(""));
				channel_deleted.send("<@"+message.author.id+">: "+message.content.split("@").join(""));
				for (var value of message.attachments.values()) {
					channel_deleted.send("Вложение:", {files: [value.proxyURL]});
				}
		}
	} catch(e) {
		require('./catcherror').catcherror(e);
	}
}