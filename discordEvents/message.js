import config from "../config.json" assert {type: "json"};
import { CatchError } from "../catcherror.js";
import { CommandManager } from "../commandManager.js";

export function Message(message){
	try {
		if (message.author.bot) return;
		
		switch(message.channel.type){
			case "DM":
				var channel_sandbox = message.client.channels.cache.get(config.channels.sandbox);
				channel_sandbox.send("**" + message.author.username + "** написал в ЛС:\n" + message.content);
				return;
			case "GUILD_TEXT":
				if (!message.content.startsWith("!")) return;

				if (config.credentials.is_production == (config.channels.development == message.channel.id)) return;
		
				console.log((message.member != null ? message.member.displayName : message.author.username), message.content);
				
				var args = message.content.split(' ').filter(item => item);
				var command = CommandManager.FindCommand(args[0]);
				command?.Run(args, message);
				return;
			default:
				return;
		}
	} catch (e) {
		CatchError(e, message.channel);
	}
};