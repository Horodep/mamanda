// https://discordjs.guide/additional-info/changes-in-v12.html
import Discord from "discord.js";
import config from "./config.json";
import {Message} from "./discordEvents/message.js";
import {MessageDelete} from "./discordEvents/messageDelete.js";
import {MessageReactionAdd} from "./discordEvents/messageReactionAdd.js";
import {MessageReactionRemove} from "./discordEvents/messageReactionRemove.js";
import { CommandManager } from "./commandManager.js";

const client = new Discord.Client();
client.login(config.credentials.discordApiKey);
CommandManager.Init();

client.on("ready", () => {console.log("ready!");});
client.on("guildMemberAdd", (member) => NewMember(member));
client.on("message", (_message) => Message(_message));
client.on("messageDelete", (message) => MessageDelete(message));
client.on("messageReactionAdd", (reaction, user) => MessageReactionAdd(reaction, user));
client.on("messageReactionRemove", (reaction, user) => MessageReactionRemove(reaction, user));
client.on("raw", async event => RawEvent(event));

const events = {
	MESSAGE_REACTION_ADD: "messageReactionAdd",
	MESSAGE_REACTION_REMOVE: "messageReactionRemove",
};

function NewMember(member){
	var queueRole = member.guild.roles.cache.find(role => role.id == config.roles.queue);
	member.roles.add(queueRole);
	console.log("NEW MEMBER " + member.displayName);
}

async function RawEvent(event){
	try {
		if (!events.hasOwnProperty(event.t)) return;

		console.log(event.t);
		const { d: data } = event;

		const user = client.users.cache.get(data.user_id);
		const channel = client.channels.cache.get(data.channel_id) || await user.createDM();

		const message = await channel.messages.fetch(data.message_id);
		if (message == null) return;

		const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
		let reaction = message.reactions.cache.get(emojiKey);

		if (!reaction) {
			const emoji = new Discord.Emoji(client.guilds.cache.get(data.guild_id), data.emoji);
			reaction = new Discord.MessageReaction(message, emoji, 1, data.user_id === client.user.id);
		}

		client.emit(events[event.t], reaction, user);
	} catch (e) {
		require("./catcherror").catcherror(e, client);
	}
}