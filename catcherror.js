import config from "./config.json";

export function CatchError(e, reference) {
	console.log(`Catch error: ${e.name}: ${e.message}`);
	var channel = null;
	if (reference.constructor.name == "TextChannel"){
		channel = reference;
	}else if(reference.constructor.name == "Client"){
		channel = reference.channels.cache.get(config.channels.sandbox);
	}else{
		channel = reference.client.channels.cache.get(config.channels.sandbox);
	}

	if(channel == null) return;
	channel.send(`<@${config.users.developer}>`);
	channel.send(`Ошибка ${e.name}: ${e.message}\n\n${e.stack}`, { code: 'js' });
}

export function CatchErrorWithTimeout(e, channel, timeout){
	var line = "Произошла ошибка: " + e.name.toLowerCase() + 
		"\n" + e.message + 
		"\n Попробуйте еще раз. Если ошибка повторится, обратитесь к <@" + config.users.developer + "> " + 
		"\n```js\n" + e.stack + "```";
	channel.send(line).then((msg) => {
		setTimeout(() => { msg.delete(); }, timeout);
	});
}