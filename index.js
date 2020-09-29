const Discord = require("discord.js");
const config = require("./config.json");


const client = new Discord.Client();
client.login(config.discordApiKey);


client.on('ready', () => {
	console.log('Ready to master!'); 
	
	var date = new Date();
	var startDate = new Date();
	lastDate = new Date();
	
	var repeateAction = function(){ 
		date = new Date(); 
		
		if(date - lastDate < 58000 && date - startDate > 60000){
			console.log(date, "hardreset", date - startDate, date - lastDate);
			channel_sandbox = client.channels.cache.get(config.channels.sandbox);
			channel_sandbox.send((date - lastDate) + " миллисекунд");
			setTimeout(function(){
				var shiza = client.find();
			}, 150);
		}else if(date.getMinutes() === 0 && date.getHours() === 5 && date - startDate > 60000){
			console.log(date, "destroy", date - startDate, date - lastDate);
			client.destroy().then(() => client.login(keys.discordApiKey()));
		}else{
			setTimeout(repeateAction, 1000*60); 
		}
		lastDate = date;
	} 
	repeateAction();
});

client.on('guildMemberAdd', member => {
	member.addRole(member.guild.roles.find(role => role.name === "Очередь"));
	console.log('NEW MEMBER ' + member.displayName); 
});

var message = require('./message');
client.on("message", function(_message) => message.main(_message));

var messageReactionAdd = require('./messageReactionAdd');
client.on('messageReactionAdd', (reaction, user) => messageReactionAdd.main(reaction, user));

var messageReactionRemove = require('./messageReactionRemove');
client.on('messageReactionRemove', (reaction, user) => messageReactionRemove.main(reaction, user));

var messageDelete = require('./messageDelete');
client.on("messageDelete", (message) => messageDelete.main(message));

client.on('raw', async event => {
	try{
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
	} catch(e) {
		require('./catcherror').catcherror(e, client);
	}
});

const events = {
	MESSAGE_REACTION_ADD: 'messageReactionAdd',
	MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};