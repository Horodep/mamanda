import config from "../config.json";
import { CatchError } from "../catcherror.js";

export function MessageDelete(message) {
	console.log("messageDeleted");
	try {
		console.log(message);
		if (message.author?.bot ?? true) return;
		if (message.channel.id == config.channels.raids) return;
		if (message.channel.id == config.channels.lfg) return;
		console.log('not bot, is valid for logging');

		var channelDeleted = message.client.channels.cache.get(config.channels.deleted);
		channelDeleted.send("<@" + message.author?.id + "> в <#"+message.channel.id+">: " + message.content.split("@").join(""));
		for (var value of message.attachments.values()) {
			channelDeleted.send("Вложение:", { files: [value.proxyURL] });
		}
	} catch (e) {
		CatchError(e);
	}
}