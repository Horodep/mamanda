import { CatchError, CatchErrorAndDeleteByTimeout, CatchRaidError } from "./catcherror.js";
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
        if (typeof(e) == 'object') CatchError(e, message.channel);
        else CatchRaidError(e, message.content, message.channel);
        message.delete();
    }
}

export function AddRaidMember(message, user) {
    var data = GetDataFromEmbed(message.embeds[0]);
    if (data.members.length == data.numberOfPlaces) return;
    data.AddRaidMember(user.id);
    data.RemoveFromLeftField(user.id);
    message.edit(CreateRaidEmbed(data));
}

export function RemoveRaidMember(message, user, showAsLeaver) {
    var data = GetDataFromEmbed(message.embeds[0]);
    if (!data.members.includes(user.id)) return;
    data.RemoveRaidMember(user.id);
    if (showAsLeaver) data.AddToLeftField(user.id);
    message.edit(CreateRaidEmbed(data));
}

export function KickRaidMember(message, user, reaction) {
    var data = GetDataFromEmbed(message.embeds[0]);
    if (data.author.id != user.id) {
        user.send("Вы не являетесь автором сбора. Вы не можете его отменить.");
        return;
    }
    var userId = data.GetUserIdByPosition(reaction._emoji.name.charAt(0));
    data.RemoveRaidMember(userId);

    if (userId?.length > 0) {
        var member = message.guild.members.cache.find(user => user.id == userId);
        SendPrivateMessage(member, FormCancelationMessage(data, "Рейд лидер отказался от вашего участия в рейде, в который вы записывались."));
    }
    message.edit(CreateRaidEmbed(data));
}

export function CancelRaid(message, user, reaction) {
    var data = GetDataFromEmbed(message.embeds[0]);
    if (data.author.id != user.id) {
        user.send("Вы не являетесь автором сбора. Вы не можете его отменить.");
        return;
    }
    data.members.forEach(function (discord_id) {
        var member = message.guild.members.cache.find(user => user.id == discord_id);
        SendPrivateMessage(member, FormCancelationMessage(data, "Рейд на который вы записывались был отменен рейд лидером."));
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
        console.log("now:", today);
		var tagMessage;
		messages.sort((a, b) => a.id > b.id ? 1 : -1).forEach(message => {
            if(message.pinned) return;
            console.log(message.content, message.author.bot);
            if(!message.author.bot) {
                console.log("message deleted");
                message.delete();
                return;
            }
            if(message.content != ""){
                tagMessage = message;
            }else{
                var data = GetDataFromEmbed(message.embeds[0]);
                
                console.log(data.date, data.header);
                if(data.date < today){
                    console.log("have to be moved");
                    
                    history_channel.send(CreateRaidEmbed(data, message.createdAt));
                    message.delete();
                    tagMessage.delete();
                }
            }
		});
	})
}

export async function AsyncGetPlannedRaids(message, discordMention){
	var discordId = discordMention.replace(/\D/g, '');

	var raid_channel = message.client.channels.cache.get(config.channels.raids);
    var messages = (await raid_channel.messages.fetch({ limit: 50 })).filter(m => m.embeds.length > 0);
    var raids = messages.map(m => GetDataFromEmbed(m.embeds[0])).sort((a, b) => a.date - b.date);
    var myraids = raids.filter(r => r?.members?.includes(discordId));
    message.channel.send(myraids.length == 0 
        ? 'Вы никуда не записаны.' 
        : myraids.map(r => "`" + r.dateString + "` Активность: **" + r.raidName + "**").join('\n'));
}

function ParseCommandAndGetData(args, member) {
    //0    1     2     3   4 
    //сбор 22.09 18:00 [3] кс, рандомный комент
    if (args.length < 3) throw 'Указано недостаточно данных.';

    var today = new Date();
    var date = new Date(today.getFullYear(), args[1].split('.')[1] - 1, args[1].split('.')[0], args[2].split(':')[0], args[2].split(':')[1]);
    if (date < today) date.setFullYear(today.getFullYear() + 1);
    if (isNaN(date) || typeof (date) == 'underfined') throw 'Не удалось обнаружить дату.';

    var commandRaidInfo = args.filter((_, i) => i > 2).join(" ");
    var raidName = commandRaidInfo.indexOf(',') == -1 ? commandRaidInfo : commandRaidInfo.substr(0, commandRaidInfo.indexOf(','));
    if (raidName == '') throw 'Активность не определена.';

    var description = (commandRaidInfo.indexOf(',') == -1 ? null : commandRaidInfo.substr(commandRaidInfo.indexOf(',') + 1));

    var regexpRoleTag = /<@.\d+>/g;
    var roleTag = (description == null ? null : description.match(regexpRoleTag));

    var numberOfPlaces = commandRaidInfo.match(/^\[\d+\]/);
    if (numberOfPlaces != null) raidName = raidName.replace(numberOfPlaces[0], "").trim();
    var numberOfPlaces = (numberOfPlaces == null) ? 6 : numberOfPlaces[0].match(/\d+/);

    return new RaidData(raidName, description, roleTag, date, numberOfPlaces, [], [], member, member.user.avatarURL());
}

function GetDataFromEmbed(embed) {
    var dateString = embed.author.name.split(' Активность: ')[0].replace(/,.*? в /g," ");
    var arr = dateString.split(/[ .:]/g);
    var date = new Date(arr[2], arr[1]-1, arr[0], arr[3], arr[4]);
    var linesArray = (embed.fields[0].value + "\n" + embed.fields[1].value).replace(/[<@>]/g, '').split('\n');
    var left = embed.fields.length == 2 ? [] : 
        embed.fields[2].value.split('\n').map(function (line) {
            try{
                var date = new Date(line.match(new RegExp("\`.*?\`"))[0].substring(1,12));
                var id = line.match(new RegExp("<.*?>"))[0].replace(/\D/g, '');
                return {date: date, id: id}; 
            }catch(e){
                CatchError(e);
            }
        });

    return new RaidData(
        embed.author.name.split(' Активность: ')[1], 
        embed.description, 
        "", 
        date, 
        linesArray.length, 
        linesArray.filter(line => line != "слот свободен"), 
        left, 
        {
            displayName: embed.footer.text.split(' | ')[0].replace("Собрал: ", ""),
            id:  embed.footer.text.split(' | ')[1].replace("id: ", "")
        },
        embed.footer.iconURL
    );
}

function CreateRaidEmbed(data, customTimestamp) {
    if (data.header.length > 256)
        throw 'Длина заголовка сбора не может быть больше 256 символов.';
    else if (data.description != null && data.description.length > 2048)
        throw 'Длина комментария сбора не может быть больше 2048 символов.';
    else if (data.numberOfPlaces == 1)
        throw 'Активность можно собрать не менее, чем на двоих участников.';

    var {field0, field1, left} = data.FormFields()
    var embed = new MessageEmbed()
        .setAuthor(data.header)
        .setColor(0x00AE86)
        .setThumbnail('https://images-ext-2.discordapp.net/external/SfRL0Sj2a3O9vtAYpaC2OUG0r0vDipe2h8LeeZnFdf4/https/i.imgur.com/KBiRw8F.png')
        .addField("Идут:", field0, true)
        .addField("Идут:", field1, true)
        .setFooter(data.footer, data.icon)
    if (customTimestamp != null) embed.setTimestamp(customTimestamp);
    if (data.description != null) embed.setDescription(data.description);
    if (left.length > 8) embed.addField("Отменили запись:", left)

    return embed;
}

function FormCancelationMessage(data, message) {
    return `${message}
> Рейд: **${data.raidName}**
> Дата проведения: **${data.dateString}**
> Рейд лидер: **${data.author.displayName}**`;
}

