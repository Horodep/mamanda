const Discord = require("discord.js");
const config = require("./config.json");


const client = new Discord.Client();
client.login(config.discordApiKey);


client.on('ready', () => {

});

client.on("message", function(message) {
	if (message.author.bot) return;
});

client.on('guildMemberAdd', member => {
	member.addRole(member.guild.roles.find(role => role.name === "Очередь"));
	console.log('NEW MEMBER ' + member.displayName); 
});

var messageReactionAdd = require('./messageReactionAdd');
client.on('messageReactionAdd', (reaction, user) => messageReactionAdd.main(reaction, user));

var messageReactionRemove = require('./messageReactionRemove');
client.on('messageReactionRemove', (reaction, user) => messageReactionRemove.main(reaction, user));

client.on("messageDelete", (messageDelete) => {
	console.log("messageDeleted");
	try{
		if(!messageDelete.author.bot &&
			messageDelete.channel.id != '626432384643891220' &&
			messageDelete.channel.id != '526145050871332924'){
			channel_deleted = client.channels.get("751373050330611733");
			console.log(messageDelete.content, messageDelete.content.split("@").join(""));
			channel_deleted.send("<@"+messageDelete.author.id+">: "+messageDelete.content.split("@").join(""));
			for (var value of messageDelete.attachments.values()) {
				channel_deleted.send("Вложение:", {files: [value.proxyURL]});
			}
		}
	} catch(e) {
//		channel_sandbox.send('Ошибка ' + e.name + ":" + e.message + "\n<@149245139389251584> \n" + e.stack);
	}
});

client.on('raw', async event => {
	try{
		if (!events.hasOwnProperty(event.t)) return;

		console.log(event.t);
		const { d: data } = event;
		
		const user = client.users.get(data.user_id);
		const channel = client.channels.get(data.channel_id) || await user.createDM();

		if (channel.messages.has(data.message_id)) return;
		const message = await channel.fetchMessage(data.message_id);
		
		const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
		let reaction = message.reactions.get(emojiKey);

		if (!reaction) {
			const emoji = new Discord.Emoji(client.guilds.get(data.guild_id), data.emoji);
			reaction = new Discord.MessageReaction(message, emoji, 1, data.user_id === client.user.id);
		}

		client.emit(events[event.t], reaction, user);
	} catch(e) {
		message.channel.send('Ошибка ' + e.name + ":" + e.message + "\n<@149245139389251584> \n" + e.stack);
	}
});

const events = {
	MESSAGE_REACTION_ADD: 'messageReactionAdd',
	MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};