import config from "./config.json";

var sandbox;

export function FetchDefaultCatchErrorChannel(client){
	sandbox = client.channels.cache.get(config.channels.sandbox);
}

export function CatchError(e, channel) {
	var validChannel = channel ?? sandbox;

	console.error(e);
	if (e.stack == null) {
		validChannel.send(e.message);
		return;
	}
	validChannel.send(`<@${config.users.developer}>`);
	validChannel.send(`Ошибка ${e.name}: ${e.message}\n\n${e.stack}`, { code: 'elixir' });
}

export function CatchBadResponce(responce, channel) {
	if (responce.ErrorCode == 1665) return; //DestinyPrivacyRestriction

	console.error(responce);
	var validChannel = channel ?? sandbox;
	validChannel.send(`Ошибка взаимодействия с API Bungie:\n> Error ${responce.ErrorCode}: ${responce.ErrorStatus}\n> ${responce.Message}`);
}

export function CatchHttpResponce(e, responce, channel){
	var validChannel = channel ?? sandbox;

	console.error(e);
	validChannel.send(`<@${config.users.developer}>, API вернуло не JSON:`);
	validChannel.send(`${responce}`, { code: 'xml' });
	validChannel.send(`${e.stack}`, { code: 'elixir' });
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