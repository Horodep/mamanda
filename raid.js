import { CatchError, CatchErrorWithTimeout } from "./catcherror.js";
import config from "./config.json";
import { MessageEmbed } from "discord.js";
import { SendPrivateMessage } from "./sendMessage.js";
import { RaidData } from "./raidData.js";

export function CreateRaid(message, args) {
    try {
        var data = ParseCommandAndGetData(args, message.member);
        data.AddRaidMember(message.member.id);
        var embed = CreateRaidEmbed(data);

        if (message.channel.id == config.channels.raids || data.roleTag != null)
            message.channel.send(data.roleTag != null ? data.roleTag.join(' ') : "@here");

        message.channel.send(embed).then((msg) => {
            msg.react(":yes:769922757592612874");
            msg.react(":no:769922772549632031");
        });
        message.delete();
    } catch (e) {
        CatchError(e);
        if (e.stack != null) CatchError(e, message.client);
        else message.channel.send(
            "Неверный синтаксис: __" + e.message.toLowerCase() + "__\nДолжно быть:\n```!сбор ДД.ММ ЧЧ:ММ активность, комментарии```" +
            "Вы написали:\n```" + message.content + "```").then((msg) => {
                message.delete();
                setTimeout(function () {
                    msg.delete();
                }, 30000);
            });
    }
}

export function AddRaidMember(message, user) {
    try {
        var data = GetDataFromEmbed(message.embeds[0]);
        data.AddRaidMember(user.id);
        data.RemoveFromLeftField(user.id);
        message.edit(CreateRaidEmbed(data));
    } catch (e) {
        CatchErrorWithTimeout(e, message.channel, 15000);
    }
}

export function RemoveRaidMember(message, user, showAsLeaver) {
    try {
        var data = GetDataFromEmbed(message.embeds[0]);
        data.RemoveRaidMember(user.id);
        if (showAsLeaver) data.AddToLeftField(user.id);
        message.edit(CreateRaidEmbed(data));
    } catch (e) {
        CatchErrorWithTimeout(e, message.channel, 15000);
    }
}

export function KickRaidMember(message, user, reaction) {
    var author_id = message.embeds[0].footer.text.split('id: ')[1];
    if (author_id != user.id) {
        user.send("Вы не являетесь автором сбора. Вы не можете его отменить.");
        return;
    }
    var data = GetDataFromEmbed(message.embeds[0]);
    var userId = data.GetUserIdByPosition(reaction._emoji.name.charAt(0));
    data.RemoveRaidMember(userId);

    if (userId.length > 0) {
        var member = message.guild.members.cache.find(user => user.id == userId);
        SendPrivateMessage(member, FormCancelationMessage(data, "Рейд лидер отказался от вашего участия в рейде, в который вы записывались."));
    }
    message.edit(CreateRaidEmbed(data));
}

export function CancelRaid(message, user, reaction) {
    var author_id = message.embeds[0].footer.text.split('id: ')[1];
    if (author_id != user.id) {
        user.send("Вы не являетесь автором сбора. Вы не можете его отменить.");
        return;
    }
    var data = GetDataFromEmbed(message.embeds[0]);
    var list = (data.fields[0] + '\n' + data.fields[1]).split('\n');
    list.forEach(function (text) {
        var discord_id = text.replace(/\D/g, '');
        if (discord_id.length > 0) {
            var member = message.guild.members.cache.find(user => user.id == discord_id);
            SendPrivateMessage(member, FormCancelationMessage(data, "Рейд на который вы записывались был отменен рейд лидером."));
        }
    });
    message.delete();
}

export function ForcedAddRaidMember(message, args){
    if(args.length < 3){
        message.channel.send('Указаны не все параметры');
        return;
    }
    message.channel.messages.fetch(args[1]).then(msg => {
        AddRaidMember(msg, {id: args[2]});
        setTimeout(() => { message.delete(); }, 5000);
    });
}

export function ForcedRemoveRaidMember(message, args){
    if(args.length < 3){
        message.channel.send('Указаны не все параметры');
        return;
    }
    message.channel.messages.fetch(args[1]).then(msg => {
        RemoveRaidMember(msg, {id: args[2]});
        var member = message.guild.members.cache.find(user => user.id == args[2]);
        setTimeout(() => { message.delete(); }, 5000);
        var data = GetDataFromEmbed(msg.embeds[0]);
        SendPrivateMessage(member, FormCancelationMessage(data, "Гильдмастер отказался от вашего участия в рейде, в который вы записывались."));
    });
}

export function ClearRaidList(client) {
	var raid_channel = client.channels.cache.get(config.channels.raids); 
    var history_channel = client.channels.cache.get(config.channels.raid_history);
    
	raid_channel.messages.fetch({ limit: 50 }).then(messages => {
		var today = new Date();
		var lastMessage;
		messages.sort(function(a, b) {
			return a.id > b.id ? 1 : -1
		}).forEach(message => {
			if(message.pinned) return;
            if(!message.author.bot) {
                message.delete();
                return;
            }
            if(message.content != ""){
                lastMessage = message;
            }else{
                var data = GetDataFromEmbed(message.embeds[0]);
                var date = data.GetRaidDate();
                
                console.log(date, today, data.header);
                if(date < today){
                    console.log("have to be moved");
                    
                    history_channel.send(CreateRaidEmbed(data, message.createdAt));
                    message.delete();
                    lastMessage.delete();
                }
            }
		});
	})
}

function ParseCommandAndGetData(args, member) {
    //0    1     2     3   4 
    //сбор 22.09 18:00 [3] кс, рандомный комент
    var today = new Date();
    var date = new Date(today.getFullYear(), args[1].split('.')[1] - 1, args[1].split('.')[0], args[2].split(':')[0], args[2].split(':')[1]);
    if (date < today) date.setFullYear(today.getFullYear() + 1);

    if (isNaN(date) || typeof (date) == 'underfined') throw ({ message: 'Не удалось обнаружить дату.' });

    var raidInfo = args.filter((_, i) => i > 2).join(" ");
    var raidName = raidInfo.indexOf(',') == -1 ? raidInfo : raidInfo.substr(0, raidInfo.indexOf(','));
    var header = date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear() +
        ", " + weekday(date.getDay()) +
        " в " + args[2] +
        " Активность: " + raidName;
    if (raidName == '') throw ({ message: 'Активность не определена.' });

    var description = (raidInfo.indexOf(',') == -1 ? null : raidInfo.substr(raidInfo.indexOf(',') + 1));

    var regexpRoleTag = /<@.\d+>/g;
    var roleTag = (description == null ? null : description.match(regexpRoleTag));
    var descriptionWithoutRoleTag = (description == null ? '' : description.replace(regexpRoleTag, '').replace(/\s/g, ''));

    var numberOfPlaces = raidInfo.match(/^\[\d+\]/);
    var numberOfPlaces = (numberOfPlaces == null) ? 6 : numberOfPlaces[0].match(/\d+/);
    if (numberOfPlaces != null) header = header.replace(numberOfPlaces[0], "");

    var field0 = "слот свободен\n".repeat(Math.round(numberOfPlaces / 2));
    var field1 = "слот свободен\n".repeat((numberOfPlaces / 2) % 1 == 0.5 ? (numberOfPlaces / 2) - 0.5 : (numberOfPlaces / 2));

    return new RaidData({
        header: header,
        description: description,
        descriptionWithoutRoleTag: descriptionWithoutRoleTag,
        fields: [field0, field1],
        left: "",
        numberOfPlaces: numberOfPlaces,
        roleTag: roleTag,
        footerText: "Собрал: " + member.displayName + " | id: " + member.id,
        iconURL: member.user.avatarURL
    });
}

function GetDataFromEmbed(embed) {
    return new RaidData({
        header: embed.author.name,
        description: embed.description,
        descriptionWithoutRoleTag: embed.description,
        fields: [
            embed.fields[0].value,
            embed.fields[1].value],
        left: embed.fields.length > 2 ? embed.fields[2].value : "",
        numberOfPlaces: 6,
        roleTag: "",
        footerText: embed.footer.text,
        iconURL: embed.footer.iconURL
    });
}

function CreateRaidEmbed(data, customTimestamp) {
    if (data.header.length > 256)
        throw ({ message: 'Длина заголовка сбора не может быть больше 256 символов.' });
    else if (data.description != null && data.description.length > 2048)
        throw ({ message: 'Длина комментария сбора не может быть больше 2048 символов.' });
    else if (data.numberOfPlaces == 1)
        throw ({ message: 'Активность можно собрать не менее, чем на двоих участников.' });

    var embed = new MessageEmbed()
        .setAuthor(data.header)
        .setColor(0x00AE86)
        .setThumbnail('https://images-ext-2.discordapp.net/external/SfRL0Sj2a3O9vtAYpaC2OUG0r0vDipe2h8LeeZnFdf4/https/i.imgur.com/KBiRw8F.png')
        .addField("Идут:", data.fields[0], true)
        .addField("Идут:", data.fields[1], true)
        .setFooter(data.footerText, data.iconURL)
    if (customTimestamp != null) embed.setTimestamp(customTimestamp);
    if (data.description != null && data.descriptionWithoutRoleTag != '') embed.setDescription(data.description);
    if (data.left.length > 8) embed.addField("Отменили запись:", data.left)

    return embed;
}

function FormCancelationMessage(data, message) {
    return `${message}
> Рейд: **${data.header.split('Активность: ')[1]}**
> Дата проведения: **${data.header.split('Активность: ')[0]}**
> Рейд лидер: **${data.footerText.split('|')[0].replace("Собрал: ", "")}**`;
}

function weekday(num) {
    switch (num) {
        case 0: return "воскресенье"; break;
        case 1: return "понедельник"; break;
        case 2: return "вторник"; break;
        case 3: return "среда"; break;
        case 4: return "четверг"; break;
        case 5: return "пятница"; break;
        case 6: return "суббота"; break;
    }
}