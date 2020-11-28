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
