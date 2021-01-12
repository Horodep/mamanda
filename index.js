// https://discordjs.guide/additional-info/changes-in-v12.html
import Discord from "discord.js";
import config from "./config.json";
import { Message } from "./discordEvents/message.js";
import { MessageDelete } from "./discordEvents/messageDelete.js";
import { MessageReactionAdd } from "./discordEvents/messageReactionAdd.js";
import { MessageReactionRemove } from "./discordEvents/messageReactionRemove.js";
import { CommandManager } from "./commandManager.js";
import { ManifestManager } from "./manifest.js";
import { FetchDefaultCatchErrorChannel } from "./catcherror.js";
import { RefreshAuthToken } from "./httpCore.js";

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.login(config.credentials.discordApiKey);
CommandManager.Init();
ManifestManager.Refresh();
RefreshAuthToken();

client.on("ready", () => {
	client.user.setActivity("на Летописца 9 из 10", { type: 'WATCHING' });
	FetchDefaultCatchErrorChannel(client);
	console.log("Discord client connected!");
});
client.on("guildMemberAdd", (member) => NewMember(member));
client.on("message", (_message) => Message(_message));
client.on("messageDelete", (message) => MessageDelete(message));
client.on("messageReactionAdd", (reaction, user) => MessageReactionAdd(reaction, user));
client.on("messageReactionRemove", (reaction, user) => MessageReactionRemove(reaction, user));

function NewMember(member) {
	//member.roles.add(config.roles.queue);
	console.log("NEW MEMBER " + member.displayName);
}