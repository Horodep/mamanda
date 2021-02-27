import config from "../config.json";

export function SendCustomMessage(client, args){
    if (args.length < 3) return;
    var channel = client.channels.cache.get(args[1]);
    var text = args.filter((_,i) => i > 1).join(" ");
    channel.send(text);
}

export function SendPrivateMessageByRole(guild, args){  
    if (args.length < 3) return;  
	var roleId = args[1].replace(/\D/g, '');
    var members = guild.roles.cache.find(role => role.id == roleId).members;
    var text = args.filter((_,i) => i > 1).join(" ");
    
    var textedMembers = [];
    members.forEach(member => { textedMembers.push({discordMember: member, text: text});});
    SendPrivateMessagesToArray(textedMembers);
}

export function SendPrivateMessagesToArray(textedMembers){
	var i = 0;
	var sending = function () {
		if (i < textedMembers.length) {
            SendPrivateMessage(textedMembers[i].discordMember, textedMembers[i].text);
			i++;
			setTimeout(sending, 2000);
		}
	}
	sending();
}

export function SendPrivateMessage(discordMember, text){
    discordMember.send(text);
    console.log("pm " + discordMember.displayName);
    Logging(discordMember, text);
}

function Logging (discordMember, text) {
    var log_channel = discordMember.client.channels.cache.get(config.channels.logging);
    var log_text = "__Игроку <@" + discordMember.id + "> [" + discordMember.displayName + "] отправлено сообщение:__\n" + text;
	log_channel.send(log_text);
}
