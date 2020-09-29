const Discord = require("discord.js");
const config = require("./config.json");

exports.catcherror = function(e, client) {
	console.log("error " + e.name + ":" + e.message);
	channel_sandbox = client.channels.cache.get(config.channels.sandbox);
	channel_sandbox.send('Ошибка ' + e.name + ":" + e.message + "\n<@" + config.users.boss + "> \n" + e.stack);
}