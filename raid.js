import { CatchError } from "./catcherror.js";
import config from "./config.json";
import { MessageEmbed } from "discord.js";
import { SendPrivateMessage } from "./sendMessage.js";

export function CreateRaid(message, args) {
    try {
        var data = ParseCommandAndFormData(args);
        data.fields[0] = data.fields[0].replace("слот свободен", "<@" + message.member.id + ">");

        var embed = CreateRaidEmbed(data, message);

        if (message.channel.id == config.channels.raids || data.roleTag != null)
            message.channel.send(data.roleTag != null ? data.roleTag.join(' ') : "@here");

        message.channel.send(embed).then((msg) => {
            msg.react(":yes:769922757592612874");
            msg.react(":no:769922772549632031");
        });
        message.delete();
    } catch (e) {
        console.log(e);
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

export function AddRaidMember() {

}

export function RemoveRaidMember() {

}

export function KickRaidMember() {

}

export function CancelRaid() {

}

export function ClearRaidList() {

}

function ParseCommandAndFormData(args) {
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

    return {
        header: header,
        description: description,
        descriptionWithoutRoleTag: descriptionWithoutRoleTag,
        fields: [field0, field1],
        numberOfPlaces: numberOfPlaces,
        roleTag: roleTag
    }
}

function CreateRaidEmbed(data, message) {
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
        .setFooter("Собрал: " + message.member.displayName + " | id: " + message.member.id, message.member.user.avatarURL)
    if (data.description != null && data.descriptionWithoutRoleTag != '') embed.setDescription(data.description);

    return embed;
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