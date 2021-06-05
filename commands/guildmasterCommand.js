import { Command } from "./command.js";
import config from "../config.json";

import { CommandManager } from "../commandManager.js"
import { AsyncShowClanSize, SetRolesToEveryMember } from "../clan/clan.js"
import { AsyncCompareAndShowNicknames } from "../clan/checkAndShowNicknames.js";
import { AsyncShowClanTime } from "../clan/showClanTime.js";
import { AsyncGetClanMemberOnlineTime } from "../clan/clanMember/clanMember.js";
import { ChangeMaxTriumphsScore } from "../discordFeatures/change/changeMaxTriumphsScore.js";
import { DropPvpRole } from "../discordFeatures/dropPvpRole.js";
import { AsyncShowResetEnglish } from "../discordFeatures/show/showResetEnglish.js";
import { GiveForumRole, SaveForumLinkAndPublish } from "../discordFeatures/forum.js";
import { AsyncShowQueueList, AsyncShowQueueReqestsList } from "../discordFeatures/queue.js"
import { SendCustomMessage, SendPrivateMessageByRole, SendPrivateMessage } from "../discordFeatures/messaging.js";
import { ClearRaidList, ForcedAddRaidMember, ForcedRemoveRaidMember } from "../discordFeatures/raid/raid.js"
import { AsyncDrawXur } from "../drawing/drawXur.js";
import { AsyncDrawEververse } from "../drawing/drawEververse.js";
import { GiveVyakbanAndCreateEmbed } from "../discordFeatures/vyakManager.js";

class GuildmasterCommand extends Command {
    Run(args, message) {
        var guildMasterRole = message.guild.roles.cache.find(role => role.id == config.roles.guildmaster);
        if (guildMasterRole.position <= message.member.roles.highest.position) {
            Command.prototype.SaveRun.call(this, args, message);
        } else {
            throw 'У вас нет прав на это действие.';
        }
    }
}

export function GetGuildmasterCommandsArray() {
    const on = 0;
    const wip = 1;
    const off = 2;
    var array = [];

    array.push(new GuildmasterCommand("!eververse", on, true, "генерация изображения товаров Эверверс в текущий канал;", async function (args, message) {
        await AsyncDrawEververse(message.channel);
    }));
    array.push(new GuildmasterCommand("!checksync", off, false, "_______________;", async function (args, message) { }));
    array.push(new GuildmasterCommand("!ck", on, true, "", async function (args, message) {
        await AsyncShowClanTime(message.channel, (args.length > 1 ? args[1] : 7), 'full');
    }));
    array.push(new GuildmasterCommand("!clankick %days%", on, true, "выборка активности малоактивных стражей;\n_по умолчанию — 7 дней_;", async function (args, message) {
        await AsyncShowClanTime(message.channel, (args.length > 1 ? args[1] : 7), 'full');
    }));
    array.push(new GuildmasterCommand("!ckp", on, true, "", async function (args, message) {
        await AsyncShowClanTime(message.channel, (args.length > 1 ? args[1] : 7), '');
    }));
    array.push(new GuildmasterCommand("!clankickpub %days%", on, true, "выборка активности **самых** малоактивных стражей;\n_по умолчанию — 7 дней_;", async function (args, message) {
        await AsyncShowClanTime(message.channel, (args.length > 1 ? args[1] : 7), '');
    }));
    array.push(new GuildmasterCommand("!copy", on, false, "ручной запуск переноса в архив старых сборов рейдов;", async function (args, message) {
        ClearRaidList(message.client);
    }));
    array.push(new GuildmasterCommand("!csr", on, true, "ручной запуск выдачи ролей всему клану;", async function (args, message) {
        SetRolesToEveryMember(message.guild);
    }));
    array.push(new GuildmasterCommand("!engreset", on, false, "генерация ссылок на англоязычные изображения еженедельного ресета в текущий канал;", async function (args, message) {
        await AsyncShowResetEnglish(message.channel);
    }));
    array.push(new GuildmasterCommand("!forum LINKTEXT", on, false, "опубликовать объявление о наборе в канал новостей;", async function (args, message) {
        SaveForumLinkAndPublish(message.content.slice(7), message.client);
    }));
    array.push(new GuildmasterCommand("!forumtime", on, false, "выдать всем стражам роли перед объявлением о наборе;", async function (args, message) {
        GiveForumRole(message);
    }));
    array.push(new GuildmasterCommand("!gmhelp", on, false, "список доступных ГМ-ских команд;", async function (args, message) {
        message.channel.send(CommandManager.GetGuildMasterHelp());
    }));
    array.push(new GuildmasterCommand("!gmstatus", on, false, "статус с учетом гм-ских команд;", async function (args, message) {
        message.channel.send(await CommandManager.GetStatus(true));
    }));
    array.push(new GuildmasterCommand("!membertime @DiscrordTag %days%", on, true, "выборка активности стража;\n_по умолчанию — 7 дней_;", async function (args, message) {
        await AsyncGetClanMemberOnlineTime(message, (args.length > 2 ? args[2] : 7), (args.length > 1 ? args[1] : message.member.id), true)
    }));
    array.push(new GuildmasterCommand("!message channel_id текст", on, false, "отправить сообщение в канал;", async function (args, message) {
        SendCustomMessage(message.client, args);
    }));
    array.push(new GuildmasterCommand("!nicknames", on, true, "проверка никнеймов стражей;", async function (args, message) {
        await AsyncCompareAndShowNicknames(message.channel);
    }));
    array.push(new GuildmasterCommand("!pm", on, false, "сообщение в личку юзеру;", async function (args, message) {
        SendPrivateMessage(message.guild, args);
    }));
    array.push(new GuildmasterCommand("!pmspam", on, false, "спам говном в личку по роли;", async function (args, message) {
        SendPrivateMessageByRole(message.guild, args);
    }));
    array.push(new GuildmasterCommand("!pvpdrop", on, false, "снять все пвп роли;", async function (args, message) {
        DropPvpRole(message);
    }));
    array.push(new GuildmasterCommand("!q", on, false, "список стражей в очереди;", async function (args, message) {
        await AsyncShowQueueList(message);
    }));
    array.push(new GuildmasterCommand("!qq", on, false, "список анкет стражей в очереди;", async function (args, message) {
        await AsyncShowQueueReqestsList(message);
    }));
    array.push(new GuildmasterCommand("!raidadd message_id member_id", on, false, "добавление в рейд стража;", async function (args, message) {
        ForcedAddRaidMember(message, args);
    }));
    array.push(new GuildmasterCommand("!raidkick message_id member_id", on, false, "исключение из рейда стража, пример: https://media.discordapp.net/attachments/515244455033438209/626795525710020638/unknown.png;", async function (args, message) {
        ForcedRemoveRaidMember(message, args);
    }));
    array.push(new GuildmasterCommand("!reset", off, true, "генерация текстового еженедельного ресета в текущий канал;", async function (args, message) { }));
    array.push(new GuildmasterCommand("!setmaxtriumphs NUMBER", on, false, "обновить значение максимального количества триумфов;", async function (args, message) {
        ChangeMaxTriumphsScore(message, args);
    }));
    array.push(new GuildmasterCommand("!size", on, true, "количество стражей в составах;", async function (args, message) {
        await AsyncShowClanSize(message);
    }));
    array.push(new GuildmasterCommand("!sync", off, false, "_______________;", async function (args, message) { }));
    array.push(new GuildmasterCommand("!vyakban @DiscrordTag 1m/2h/3d причина", on, false, "выдача мьюта на определенное время;", async function (args, message) { 
        GiveVyakbanAndCreateEmbed(message, args);
    }));
    array.push(new GuildmasterCommand("!watermelon @DiscrordTag", off, true, "проверка стража на абуз;", async function (args, message) { }));
    array.push(new GuildmasterCommand("!xur", on, true, "геренация изображения товаров Зура в текущий канал;", async function (args, message) {
        await AsyncDrawXur(message.channel);
    }));

    return array;
}