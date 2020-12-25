import config from "./config.json";

var sandbox;

export function FetchDefaultCatchErrorChannel(client){
	sandbox = client.channels.cache.get(config.channels.sandbox);
}

export function CatchError(e, channel) {
	console.log(e);
	(channel ?? sandbox).send(`<@${config.users.developer}>`);
	(channel ?? sandbox).send(`Ошибка ${e.name}: ${e.message}\n\n${e.stack}`, { code: 'js' });
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