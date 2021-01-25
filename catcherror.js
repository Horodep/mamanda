import config from "./config.json";

var sandbox;

export function FetchDefaultCatchErrorChannel(client){
	sandbox = client.channels.cache.get(config.channels.sandbox);
}

export function CatchError(e, channel) {
	var validChannel = channel ?? sandbox;

	if (typeof(e) == 'string') ShowInfoMessage(e, validChannel);
	else ShowErrorWithStack(e, validChannel);
}

export function CatchCronError(e) {
	sandbox.send(`This is a cron code error.`);
	ShowErrorWithStack(e, sandbox);
}

export function ShowErrorWithStack(e, channel) {
	console.error(e);
	channel.send(`<@${config.users.developer}>`);
	channel.send(`Ошибка ${e.name}: ${e.message}\n\n${e.stack}`, { code: 'elixir' });
}

export function ShowInfoMessage(e, channel) {
	console.log(e);
	channel.send(e);
}

export function CatchBadResponce(responce, channel) {
	if (responce.ErrorCode == 1665) return; //DestinyPrivacyRestriction

	console.error(responce);
	var validChannel = channel ?? sandbox;
	validChannel.send(`Ошибка взаимодействия с API Bungie:\n> Error ${responce.ErrorCode}: ${responce.ErrorStatus}\n> ${responce.Message}`);
}

export function CatchHttpResponce(e, url, responce, channel){
	var validChannel = channel ?? sandbox;

	console.error(e);
	validChannel.send(`<@${config.users.developer}>, API вернуло не JSON:\n\`endpoint: ${url}\``);
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