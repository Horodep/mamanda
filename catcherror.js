import config from "./config.json";

export function CatchError(e, client) {
	console.log("error " + e.name + ":" + e.message);
	var channel_sandbox = client.channels.cache.get(config.channels.sandbox);
	// channel_sandbox.send('Ошибка ' + e.name + ":" + e.message + "\n<@" + users.developer + "> \n" + e.stack);
	channel_sandbox.send(`<@${config.users.developer}>`);
	channel_sandbox.send(`Ошибка ${e.name}: ${e.message}\n\n${e.stack}`, { code: 'js' });
}
