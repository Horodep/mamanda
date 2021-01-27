import config from "./config.json";

var sandbox;

export function FetchDefaultCatchErrorChannel(client) {
	sandbox = client.channels.cache.get(config.channels.sandbox);
}

export function CatchError(e, channel) {
	var validChannel = channel ?? sandbox;

	if (typeof (e) == 'string') ShowInfoMessage(e, validChannel);
	else if (e.response) ShowHttpError(e, channel);
	else ShowErrorWithStack(e, validChannel);
}

export function CatchCronError(e) {
	sandbox.send(`This is a cron code error.`);
	ShowErrorWithStack(e, sandbox);
}

function ShowErrorWithStack(e, channel) {
	console.error(e);
	channel.send(`<@${config.users.developer}>`);
	channel.send(`Ошибка ${e.name}: ${e.message}\n\n${e.stack}`, { code: 'elixir' });
}

function ShowInfoMessage(e, channel) {
	console.log(e);
	channel.send(e);
}

function ShowHttpError(e, channel) {
	if (e.response.ErrorCode == 1665) return; //DestinyPrivacyRestriction

	console.error(e);
	if (e.name == "BadResponce") {
		channel.send(`Ошибка взаимодействия с API Bungie:\n> Error ${e.response.ErrorCode}: ${e.response.ErrorStatus}\n> ${e.response.Message}`);
	} else {
		channel.send(`<@${config.users.developer}>, API вернуло не JSON:\n\`endpoint: ${e.url}\``);
		channel.send(`${e.response}`, { code: 'xml' });
		channel.send(`${e.stack}`, { code: 'elixir' });
	}
}

export function CatchErrorAndDeleteByTimeout(e, channel, timeout) {
	var validChannel = channel ?? sandbox;
	var line = "Данное сообщение будет удалено через " + Math.floor(timeout / 1000) + " секунд." +
		"\nПроизошла ошибка " + e.name + ": " + e.message +
		"\nПопробуйте еще раз. Если ошибка повторится, обратитесь к <@" + config.users.developer + "> со скрином ошибки." +
		"\n```js\n" + e.stack + "```";
	validChannel.send(line).then((msg) => {
		setTimeout(() => { msg.delete(); }, timeout);
	});
}

export function CatchRaidError(error, content, channel) {
	channel.send(
		"Неверный синтаксис: __" + error + "__" +
		"\nДолжно быть:" +
		"\n```!сбор ДД.ММ ЧЧ:ММ активность, комментарии```" +
		"Вы написали:\n```" + content + "```").then((msg) => {
			setTimeout(function () {
				msg.delete();
			}, 30000);
		});
}