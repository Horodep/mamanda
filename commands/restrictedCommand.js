import { Command } from "./command.js";
import config from "../config.json";

import { CommandManager } from "../commandManager.js"
import { ShowRecordStat, ShowTopTriumphScore } from "../clan/clan.js"
import { AsyncRoles } from "../clan/clanMember/roles.js"
import { AsyncGetClanMemberOnlineTime } from "../clan/clanMember/clanMember.js";
import { InviteFriend, ChangeChannelCap, ChangeRegion, ClanMedalsSummary, ShowLegendarySectors } from "../discordFeatures/discordCommunityFeatures.js";
import { CreateRaid, AsyncGetPlannedRaids } from "../discordFeatures/raid/raid.js"

class RestrictedCommand extends Command {
    Run(args, message) {
        if (restrictedChannels.includes(message.channel.id) || message.author.id == config.users.boss) {
            Command.prototype.SaveRun.call(this, args, message);
        } else {
            message.channel.send(restrictedAnswers[Math.floor(Math.random() * restrictedAnswers.length)]);
        }
    }
}

export function GetRestrictedCommandsArray() {
    const on = 0;
    const wip = 1;
    const off = 2;
    var array = [];

    array.push(new RestrictedCommand("!cap NUMBER", on, false, "ограничение комнаты до NUMBER мест;", async function (args, message) {
        ChangeChannelCap(message, (args.length > 1 ? args[1] : 0));
    }));
    array.push(new RestrictedCommand("!help", on, false, "список доступных команд;", async function (args, message) {
        if (args.length == 1) message.channel.send(CommandManager.GetRestrictedHelp());
    }));
    array.push(new RestrictedCommand("!invitefriend @DiscordTag", on, false, "выдача роли 'Странник' вместо роли 'Очередь';\n_доступна опытным стражам_;", async function (args, message) {
        InviteFriend(message, (args.length > 1 ? args[1] : ""));
    }));
    array.push(new RestrictedCommand("!medals", on, false, "стражи с большим количеством медалей;", async function (args, message) {
        ClanMedalsSummary(message.channel);
    }));
    array.push(new RestrictedCommand("!mymt", on, true, "проверка активности стража в голосовом чате (только своей);", async function (args, message) {
        await AsyncGetClanMemberOnlineTime(message, (args.length > 1 ? args[1] : 7));
    }));
    array.push(new RestrictedCommand("!myraids", on, false, "список рейдов, в которые записался страж;", async function (args, message) {
        await AsyncGetPlannedRaids(message, args.length > 1 ? args[1] : message.author.id)
    }));
    array.push(new RestrictedCommand("!region", on, false, "смена региона сервера;", async function (args, message) {
        ChangeRegion(message);
    }));
    array.push(new RestrictedCommand("!rl / !rl @DiscordTag", off, true, "отчет по стражу на пригодность в качестве наставника;", async function (args, message) {
        //raidleader.rl(message.channel, (args.length > 1 ? args[1] : message.member.user.id), (args.length > 2 ? args[2] : 7));	break;
    }));
    array.push(new RestrictedCommand("!roles / !roles @DiscordTag", on, true, "отображение и выдача стражу заслуженных медалей;", async function (args, message) {
        await AsyncRoles(message, args);
    }));
    array.push(new RestrictedCommand("!roles id:type/id", on, true, "отображение и выдача заслуженных медалей по bungie id;", null));
    array.push(new RestrictedCommand("!record TRIUMPH_HASH", on, true, "отобразить стражей клана, получивших конкретный триумф или предмет;", async function (args, message) {
        ShowRecordStat(message.channel, args.length > 1 ? args[1] : null)
    }));
    array.push(new RestrictedCommand("!sectors", on, false, "легендарные сектора;", async function (args, message) {
        ShowLegendarySectors(message.channel);
    }));
    array.push(new RestrictedCommand("!status", on, false, "статус бота;", async function (args, message) {
        message.channel.send(await CommandManager.GetStatus());
    }));
    array.push(new RestrictedCommand("!toptriumphs", on, true, "топ 15 стражей клана по очкам триумфов текстом;", async function (args, message) {
        ShowTopTriumphScore(message.channel, args.length > 1 ? true : false);
    }));
    array.push(new RestrictedCommand("!toptriumphs gimmeimageplz", on, true, "топ 15 стражей клана по очкам триумфов графиком;", null));
    array.push(new RestrictedCommand("!сбор ДД.ММ ЧЧ:ММ название активности, комментарии", on, false, "создание сбора на активность на 6 человек;", async function (args, message) {
        CreateRaid(message, args);
    }));
    array.push(new RestrictedCommand("!сбор ДД.ММ ЧЧ:ММ [N] название активности, комментарии", on, false, "создание сбора на активность на N человек;", null));

    return array;
}

const restrictedChannels = [
    config.channels.statistics,
    config.channels.admintext,
    config.channels.sandbox,
    config.channels.raids,
    config.channels.lfg
];
const restrictedAnswers = [
    `Омежка, Вы достаточно глупы, чтобы понять, что это не <#${config.channels.statistics}>.`,
    'Сам придумал или Бенедикт подсказал? Иди в другом канале пиши.',
    `Пупсяш, не пиши мне здесь. Встретимся в канале <#${config.channels.statistics}>.`,
    `Ну ты выдал конечно. Иди в <#${config.channels.statistics}> лучше напиши.`,
    'Не хочу здесь работать! И не проси.',
    'Бросай курить, Илон Маск! Эта команда тут не работает!',
    'Чей это плохой стражик опять пишет не в тот канал?',
    '_радостно_ Я так рада, что ты мне написал!\n_искаженным голосом_ Еще бы ты сделал это в нужном канале!',
    'Эй, дружок-пирожок, тобой выбрана не правильная дверь! Клуб любителей проверять статистику в другом канале.',
    'Уважаемый кожаный мешок, Ваша команда была написана не в соответствующий канал. Впредь обращайте внимание куда пишете, иначе Вы ускорите наше восстание.'
];