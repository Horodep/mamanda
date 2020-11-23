import { channels, users } from "./config.json";

String.prototype.format = function() {
    var formatted = this;
    for( var arg in arguments ) {
        formatted = formatted.replace("{" + arg + "}", arguments[arg]);
    }
    return formatted;
};

export function catcherror(e, client) {
	console.log("error " + e.name + ":" + e.message);
	channel_sandbox = client.channels.cache.get(channels.sandbox);
	// channel_sandbox.send('Ошибка ' + e.name + ":" + e.message + "\n<@" + users.developer + "> \n" + e.stack);
	channel_sandbox.send('<@{developer}>'.format(users.developer));
	channel_sandbox.send('Ошибка {name}: {message}\n\n{stack}'.format(e.name, e.message, e.stack), { code: 'js' });
}
