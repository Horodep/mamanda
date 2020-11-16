import Discord from "discord.js";
import { channels } from "./config.json";

export function n(message){
	var q_list = [];
	message.guild.roles.find(role => role.name == "Восставший").members.forEach(function(member) {
		var sec = Date.now() - member.joinedTimestamp;
		q_list.push("`" + Math.round(sec/(1000*60*60*24)) + "d` " + "<@"+member.user.id+">");
	});
	q_list.sort();
	message.channel.send(q_list.join('\n'));
}
export function q(message){
	var q_list = [];
	message.guild.roles.find(role => role.name == "Очередь").members.forEach(function(member) {
		var sec = Date.now() - member.joinedTimestamp;
		q_list.push("`" + Math.round(sec/(1000*60*60*24)) + "d` " + "<@"+member.user.id+">");
	});
	q_list.sort();
	message.channel.send(q_list.join('\n'));
}
export function qq(message){
	var counters = [];
	var reacts = [];
	message.guild.roles.find(role => role.name == "Очередь").members
		.sort(function(a, b) {return a.joinedTimestamp > b.joinedTimestamp ? 1 : -1})
		.forEach(function(member) {
		var sec = Date.now() - member.joinedTimestamp;
		var messageText = "Заявка от <@"+member.user.id+"> (дней на сервере: " + Math.round(sec/(1000*60*60*24)) + "):";
		
		var newby_channel = message.client.channels.cashe.get(channels.entrance);
		counters[member.id] = 0;
		newby_channel.fetchMessages({ limit: 100 }).then(messages => {
			messages
			.sort(function(a, b) {return a.id > b.id ? 1 : -1})
			.filter(m => m.author.id === member.user.id)
			.forEach(async function(value, key, map) {
				counters[member.id]++;
				var addition="";
				try{
					reacts[value.id] = 0;
					for (var react of value.reactions.values()) {
						//var users = react.users.fetch();
						//console.log(react.users);
						reacts[value.id]++;
						addition = addition + "\n" + react._emoji + ":";
						var users = await react.fetchUsers();
						for (let user of users){
							addition = addition + " " + user[1].username;
						}
						message.channel.send(messageText + "```" + value.content + addition + "```");
					}
					if(reacts[value.id] == 0) message.channel.send(messageText + "```" + value.content + " ```");
				}catch(e) {
					console.log('Ошибка ' + e.name + ":" + e.message + "\n\n" + e.stack);
				}
			});
			return messageText;
		}).then(messageText => {
			if (!messageText.endsWith("```")) messageText = messageText + "```нет заявки```"
			setTimeout(function(){
				if(counters[member.id] == 0) message.channel.send(messageText);
			}, 500);
		})
	});
}