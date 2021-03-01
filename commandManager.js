import config from "./config.json";
import nodePackage from "./package.json";
import { execSync } from "child_process";
import { MessageEmbed } from "discord.js";
import { AsyncGetGlobalAlerts } from "./http/bungieApi.js";
import { AsyncShowClanSize, AsyncShowClanTime, AsyncShowNicknames, SetRolesToEveryMember, ShowRecordStat, ShowTopTriumphScore } from "./clan/clan.js"
import { AsyncRoles } from "./clan/clanMember/roles.js"
import { NewAuthToken } from "./http/httpCore.js"
import { AsyncGetClanMemberOnlineTime } from "./clan/clanMember/clanMember.js";
import { CatchError } from "./catcherror.js";
import { InviteFriend, ChangeChannelCap, ChangeRegion, ClanMedalsSummary, ShowLegendarySectors } from "./discordFeatures/discordCommunityFeatures.js";
import { DropPvpRole, GiveForumRole, SaveForumLinkAndPublish, SetMaximumTriumphsScore, ShowNewbieList, AsyncShowResetEnglish } from "./discordFeatures/discordGuildMasterFeatures.js"
import { AsyncShowQueueList, AsyncShowQueueReqestsList } from "./discordFeatures/queue.js"
import { SendCustomMessage, SendPrivateMessageByRole } from "./discordFeatures/messaging.js";
import { ClearRaidList, CreateRaid, ForcedAddRaidMember, ForcedRemoveRaidMember, AsyncGetPlannedRaids } from "./discordFeatures/raid/raid.js"
import { AsyncDrawXur } from "./drawing/drawXur.js";
import { AsyncDrawEververse } from "./drawing/drawEververse.js";

export class CommandManager {
    static commandList = [];

    static async Run(args, message) {
        try {
            var command = this.FindCommand(args[0]);
            if (command?.status > 1) message.channel.send("Команда отключена");
            else await command?.callback(args, message);
        } catch (e) {
            CatchError(e, message.channel); //main run 
        }
    }
    static AddCommand(rights, status, apiDependency, name, title, description, callback) {
        this.commandList.push({
            name: name,
            rights: rights,
            status: status,
            apiDependency: apiDependency,
            title: title,
            description: description,
            callback: callback
        });
    }
    static FindCommand(commandName) {
        var foundCommands = this.commandList.filter(c => c.name === commandName);
        return foundCommands.length > 0 ? foundCommands[0] : null;
    }
    static GetEmojiStatus(command, apiAlerts) {
        switch (command.status) {
            case 0:
                if (command.apiDependency == true && apiAlerts.ErrorCode != 1) return ":warning:";
                return "<:yes:769922757592612874>";
            case 1:
                return "<:reload:781107772224962561>";
            default:
                return "<:no:769922772549632031>";
        }
    }
    static async GetStatus(isGuildmaster) {
        var apiAlerts = await AsyncGetGlobalAlerts();
        const gitLogRequest = "git log $(git describe --abbrev=0 --tags $(git describe --abbrev=0)^)..HEAD --oneline --format='%s'";
        const gitSaveLogRequest = process.platform == "win32" ? "git log -n5 --oneline --format='%s'" : gitLogRequest;
        var gitLog = execSync(gitSaveLogRequest).toString();
        var uptime = process.uptime()

        var embed = new MessageEmbed()
            .setAuthor(nodePackage.name + " v" + nodePackage.version)
            .setColor(0x11de1b)//0x00AE86
            .setDescription("[баг-трекер](https://github.com/Horodep/mamanda-issues-tracker/issues)")
            .addField("Destiny API Status", apiAlerts.ErrorStatus, true)
            .addField("Uptime", Math.floor(uptime / 86400) + ' days ' + Math.floor((uptime / 3600) % 24) + ' hours', true)
            .addField("Git log", "```" + gitLog.replace(/'/g, '') + "```")

        var restricted = this.commandList.filter(c => c.rights == "restricted" && c.name != "").map(c => this.GetEmojiStatus(c, apiAlerts) + " " + c.name);
        embed.addField("Command list", restricted.filter((_, i) => i < restricted.length / 3).join("\n"), true)
        embed.addField('\u200B', restricted.filter((_, i) => i < 2 * restricted.length / 3 && i >= restricted.length / 3).join("\n"), true)
        embed.addField('\u200B', restricted.filter((_, i) => i >= 2 * restricted.length / 3).join("\n"), true)

        if (isGuildmaster) {
            var guildmaster = this.commandList.filter(c => c.rights == "guildmaster" && c.name != "").map(c => this.GetEmojiStatus(c, apiAlerts) + " " + c.name);
            embed.addField("Guildmaster", guildmaster.filter((_, i) => i < guildmaster.length / 3).join("\n"), true)
            embed.addField('\u200B', guildmaster.filter((_, i) => i < 2 * guildmaster.length / 3 && i >= guildmaster.length / 3).join("\n"), true)
            embed.addField('\u200B', guildmaster.filter((_, i) => i >= 2 * guildmaster.length / 3).join("\n"), true)
        }
        return embed;
    }
    static GetRestrictedHelp() {
        var embed = new MessageEmbed()
            .setAuthor("Horobot :: Список доступных команд:")
            .setDescription("[Issues tracker](https://github.com/Horodep/mamanda-issues-tracker/issues)")
            .setColor(0x00AE86)
            .setThumbnail('https://images-ext-1.discordapp.net/external/veZptUu_KDKmwtUJX5QT3QxESYCaRp4_k0XUwEQxubo/https/i.imgur.com/e9DIB8e.png')
            .setFooter("Horobot", "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
            .setTimestamp()
        this.commandList.filter(c => (c.rights === 'restricted' && c.status == 0)).forEach(command => {
            embed.addField(command.title, command.description);
        });
        return embed;
    }
    static GetGuildMasterHelp() {
        var embed = new MessageEmbed()
            .setAuthor("Horobot :: Список ГМ-ских команд:")
            .setDescription("[Issues tracker](https://github.com/Horodep/mamanda-issues-tracker/issues)")
            .setColor(0x00AE86)
            .setThumbnail('https://images-ext-1.discordapp.net/external/veZptUu_KDKmwtUJX5QT3QxESYCaRp4_k0XUwEQxubo/https/i.imgur.com/e9DIB8e.png')
            .setFooter("Horobot", "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
            .setTimestamp()
        this.commandList.filter(c => (c.rights === 'guildmaster' && c.status == 0)).forEach(command => {
            embed.addField(command.title, command.description);
        });
        return embed;
    }
    static CheckRights(commandName, rights) {
        var command = this.FindCommand(commandName);
        return command?.rights == rights;
    }
    static IsGuildMasterCommand(commandName) {
        return this.CheckRights(commandName, 'guildmaster');
    }
    static IsRestrictedCommand(commandName) {
        return this.CheckRights(commandName, 'restricted');
    }
    static IsCommonCommand(commandName) {
        return this.CheckRights(commandName, 'common');
    }
    static IsDeveloperCommand(commandName) {
        return this.CheckRights(commandName, 'developer');
    }
    static Init() {
        this.AddCommand("developer", 0, false, "oauth2", "!oauth2", "выслать команду авторизации;", async function (args, message) {
            message.channel.send(`https://www.bungie.net/ru/OAuth/Authorize?response_type=code&client_id=${config.credentials.client_id}&state=12345`);
        });
        this.AddCommand("developer", 0, false, "code", "!code", "сохранить код авторизации;", async function (args, message) {
            NewAuthToken(args[1]);
        });
        this.AddCommand("developer", 1, false, "test", "!test", "тестовая команда;", async function (args, message) {
            // empty for any test code
        });

        this.AddCommand("common", 0, false, "ping", "!ping", "testing functionality", async function (args, message) {
            message.channel.send('pong ' + args[0]);
        });
        this.AddCommand("common", 0, false, "rand", "!rand", "отправить рандомный эмоджик", async function (args, message) {
            message.channel.send(emoji.random().emoji);
        });
        this.AddCommand("common", 0, false, "clown", "!clown", "отправить клоуна", async function (args, message) {
            message.channel.send('🤡');
        });

        this.AddCommand("restricted", 0, false, "cap", "!cap NUMBER", "ограничение комнаты до NUMBER мест;", async function (args, message) {
            ChangeChannelCap(message, (args.length > 1 ? args[1] : 0));
        });
        this.AddCommand("restricted", 0, false, "help", "!help", "список доступных команд;", async function (args, message) {
            if (args.length == 1) message.channel.send(CommandManager.GetRestrictedHelp());
        });
        this.AddCommand("restricted", 0, false, "invitefriend", "!invitefriend @DiscordTag", "выдача роли 'Странник' вместо роли 'Очередь';\n_доступна опытным стражам_;", async function (args, message) {
            InviteFriend(message, (args.length > 1 ? args[1] : ""));
        });
        this.AddCommand("restricted", 0, false, "medals", "!medals", "стражи с большим количеством медалей;", async function (args, message) {
            ClanMedalsSummary(message.channel);
        });
        this.AddCommand("restricted", 0, true, "mymt", "!mymt", "проверка активности стража в голосовом чате (только своей);", async function (args, message) {
            await AsyncGetClanMemberOnlineTime(message, (args.length > 1 ? args[1] : 7));
        });
        this.AddCommand("restricted", 0, false, "myraids", "!myraids", "список рейдов, в которые записался страж;", async function (args, message) {
            await AsyncGetPlannedRaids(message, args.length > 1 ? args[1] : message.author.id)
        });
        this.AddCommand("restricted", 0, false, "region", "!region", "смена региона сервера;", async function (args, message) {
            ChangeRegion(message);
        });
        this.AddCommand("restricted", 2, true, "rl", "!rl / !rl @DiscordTag", "отчет по стражу на пригодность в качестве наставника;", async function (args, message) {
            //raidleader.rl(message.channel, (args.length > 1 ? args[1] : message.member.user.id), (args.length > 2 ? args[2] : 7));	break;
        });
        this.AddCommand("restricted", 0, true, "roles", "!roles / !roles @DiscordTag", "отображение и выдача стражу заслуженных медалей;", async function (args, message) {
            await AsyncRoles(message, args);
        });
        this.AddCommand("restricted", 0, true, "roles id:", "!roles id:type/id", "отображение и выдача заслуженных медалей по bungie id;", async function (args, message) { });
        this.AddCommand("restricted", 0, true, "record", "!record TRIUMPH_HASH", "отобразить стражей клана, получивших конкретный триумф или предмет;", async function (args, message) {
            ShowRecordStat(message.channel, args.length > 1 ? args[1] : null)
        });
        this.AddCommand("restricted", 0, false, "sectors", "!sectors", "легендарные сектора;", async function (args, message) {
            ShowLegendarySectors(message.channel);
        });
        this.AddCommand("restricted", 0, false, "status", "!status", "статус бота;", async function (args, message) {
            message.channel.send(await CommandManager.GetStatus());
        });
        this.AddCommand("restricted", 0, true, "toptriumphs", "!toptriumphs", "топ 15 стражей клана по очкам триумфов текстом;", async function (args, message) {
            ShowTopTriumphScore(message.channel, args.length > 1 ? true : false);
        });
        this.AddCommand("restricted", 0, true, "toptriumphs img", "!toptriumphs gimmeimageplz", "топ 15 стражей клана по очкам триумфов графиком;", async function (args, message) { });
        this.AddCommand("restricted", 0, false, "сбор", "!сбор ДД.ММ ЧЧ:ММ название активности, комментарии", "создание сбора на активность на 6 человек;", async function (args, message) {
            CreateRaid(message, args);
        });
        this.AddCommand("restricted", 0, false, "", "!сбор ДД.ММ ЧЧ:ММ [N] название активности, комментарии", "создание сбора на активность на N человек;", async function (args, message) { });


        this.AddCommand("guildmaster", 1, true, "eververse", "!eververse", "геренация изображения товаров Эверверс в текущий канал;", async function (args, message) {
            await AsyncDrawEververse(message.channel);
        });
        this.AddCommand("guildmaster", 2, false, "checksync", "!______________", "_______________;", async function (args, message) { });
        this.AddCommand("guildmaster", 0, true, "ck", "", "", async function (args, message) {
            await AsyncShowClanTime(message.channel, (args.length > 1 ? args[1] : 7), 'full');
        });
        this.AddCommand("guildmaster", 0, true, "clankick", "!clankick %days%", "выборка активности малоактивных стражей;\n_по умолчанию — 7 дней_;", async function (args, message) {
            await AsyncShowClanTime(message.channel, (args.length > 1 ? args[1] : 7), 'full');
        });
        this.AddCommand("guildmaster", 0, true, "ckp", "", "", async function (args, message) {
            await AsyncShowClanTime(message.channel, (args.length > 1 ? args[1] : 7), '');
        });
        this.AddCommand("guildmaster", 0, true, "clankickpub", "!clankickpub %days%", "выборка активности **самых** малоактивных стражей;\n_по умолчанию — 7 дней_;", async function (args, message) {
            await AsyncShowClanTime(message.channel, (args.length > 1 ? args[1] : 7), '');
        });
        this.AddCommand("guildmaster", 0, false, "copy", "!copy", "ручной запуск переноса в архив старых сборов рейдов;", async function (args, message) {
            ClearRaidList(message.client);
        });
        this.AddCommand("guildmaster", 0, true, "csr", "!csr", "ручной запуск выдачи ролей всему клану;", async function (args, message) {
            SetRolesToEveryMember(message.guild);
        });
        this.AddCommand("guildmaster", 0, false, "engreset", "!engreset", "генерация ссылок на англоязычные изображения еженедельного ресета в текущий канал;", async function (args, message) {
            await AsyncShowResetEnglish(message.channel);
        });
        this.AddCommand("guildmaster", 0, false, "forum", "!forum LINKTEXT", "опубликовать объявление о наборе в канал новостей;", async function (args, message) {
            SaveForumLinkAndPublish(message.content.slice(7), message.client);
        });
        this.AddCommand("guildmaster", 0, false, "forumtime", "!forumtime", "выдать всем стражам роли перед объявлением о наборе;", async function (args, message) {
            GiveForumRole(message);
        });
        this.AddCommand("guildmaster", 0, false, "gmhelp", "!gmhelp", "список доступных ГМ-ских команд;", async function (args, message) {
            message.channel.send(CommandManager.GetRestrictedHelp());
        });
        this.AddCommand("guildmaster", 0, false, "gmstatus", "!gmstatus", "статус с учетом гм-ских команд;", async function (args, message) {
            message.channel.send(await CommandManager.GetStatus(true));
        });
        this.AddCommand("guildmaster", 0, true, "membertime", "!membertime @DiscrordTag %days%", "выборка активности стража;\n_по умолчанию — 7 дней_;", async function (args, message) {
            await AsyncGetClanMemberOnlineTime(message, (args.length > 2 ? args[2] : 7), (args.length > 1 ? args[1] : message.member.id), true)
        });
        this.AddCommand("guildmaster", 0, false, "message", "!message channel_id текст", "отправить сообщение в канал;", async function (args, message) {
            SendCustomMessage(message.client, args);
        });
        this.AddCommand("guildmaster", 0, false, "n", "!n", "список новичков в клане;", async function (args, message) {
            ShowNewbieList(message);
        });
        this.AddCommand("guildmaster", 0, true, "nicknames", "!nicknames", "проверка никнеймов стражей;", async function (args, message) {
            await AsyncShowNicknames(message.channel);
        });
        this.AddCommand("guildmaster", 0, false, "pmspam", "!pmspam", "спам говном в личку по роли;", async function (args, message) {
            SendPrivateMessageByRole(message.guild, args);
        });
        this.AddCommand("guildmaster", 0, false, "pvpdrop", "!pvpdrop", "снять все пвп роли;", async function (args, message) {
            DropPvpRole(message);
        });
        this.AddCommand("guildmaster", 0, false, "q", "!q", "список стражей в очереди;", async function (args, message) {
            await AsyncShowQueueList(message);
        });
        this.AddCommand("guildmaster", 0, false, "qq", "!qq", "список анкет стражей в очереди;", async function (args, message) {
            await AsyncShowQueueReqestsList(message);
        });
        this.AddCommand("guildmaster", 0, false, "raidadd", "!raidadd message_id member_id", "добавление в рейд стража;", async function (args, message) {
            ForcedAddRaidMember(message, args);
        });
        this.AddCommand("guildmaster", 0, false, "raidkick", "!raidkick message_id member_id", "исключение из рейда стража, пример: https://media.discordapp.net/attachments/515244455033438209/626795525710020638/unknown.png;", async function (args, message) {
            ForcedRemoveRaidMember(message, args);
        });
        this.AddCommand("guildmaster", 2, true, "reset", "!reset", "генерация текстового еженедельного ресета в текущий канал;", async function (args, message) { });
        this.AddCommand("guildmaster", 0, false, "setmaxtriumphs", "!setmaxtriumphs NUMBER", "обновить значение максимального количества триумфов;", async function (args, message) {
            SetMaximumTriumphsScore(message, args);
        });
        this.AddCommand("guildmaster", 0, true, "size", "!size", "количество стражей в составах;", async function (args, message) {
            await AsyncShowClanSize(message);
        });
        this.AddCommand("guildmaster", 2, false, "sync", "!______________", "_______________;", async function (args, message) { });
        this.AddCommand("guildmaster", 2, true, "watermelon", "!watermelon @DiscrordTag", "проверка стража на абуз;", async function (args, message) { });
        this.AddCommand("guildmaster", 0, true, "xur", "!xur", "геренация изображения товаров Зура в текущий канал;", async function (args, message) {
            await AsyncDrawXur(message.channel);
        });
    }
}