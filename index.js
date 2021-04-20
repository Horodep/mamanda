// https://discordjs.guide/additional-info/changes-in-v12.html
import Discord from "discord.js";
import config from "./config.json";
// events
import { Message } from "./discordEvents/message.js";
import { MessageDelete } from "./discordEvents/messageDelete.js";
import { AsyncMessageReactionAdd } from "./discordEvents/messageReactionAdd.js";
import { AsyncMessageReactionRemove } from "./discordEvents/messageReactionRemove.js";
// core
import { CommandManager } from "./commandManager.js";
import { ManifestManager } from "./manifest.js";
import { Sheduler } from "./sheduler.js";
import { AsyncRefreshAuthToken } from "./http/httpCore.js";
import { FetchDefaultCatchErrorChannel } from "./catcherror.js";

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.login(config.credentials.discordApiKey);

CommandManager.Init();
ManifestManager.Refresh();
AsyncRefreshAuthToken();

client.on("ready", () => {
	client.user.setActivity("на Летописца 9 из 10", { type: 'WATCHING' });
	FetchDefaultCatchErrorChannel(client);
	Sheduler.Init(client);
	console.log("Discord client connected!");
});
client.on("guildMemberAdd", (member) => console.log("NEW MEMBER " + member.displayName));
client.on("message", (_message) => Message(_message));
client.on("messageDelete", (message) => MessageDelete(message));
client.on("messageReactionAdd", (reaction, user) => AsyncMessageReactionAdd(reaction, user));
client.on("messageReactionRemove", (reaction, user) => AsyncMessageReactionRemove(reaction, user));