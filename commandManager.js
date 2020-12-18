import { MessageEmbed } from "discord.js";
import { DropPvpRole, GiveForumRole, SaveForumLinkAndPublish, ShowNewbieList, ShowQueueList, ShowQueueReqestsList } from "./discordGuildMasterFeatures.js"
import { ClanSize, ClanTime, Nicknames, SetRoles } from "./clan.js"
import { Roles } from "./roles.js"
import { newAuthToken } from "./httpCore.js"
import { GetClanMemberOnlineTime } from "./clanMember.js";
import { CatchError } from "./catcherror.js";
import { InviteFriend, ChangeChannelCap, ChangeRegion, ClanMedalsSummary } from "./discordCommunityFeatures.js";
import { SendCustomMessage, SendPrivateMessageByRole } from "./sendMessage.js";
import { ClearRaidList, CreateRaid, ForcedAddRaidMember, ForcedRemoveRaidMember } from "./raid.js"

export class CommandManager {
    static commandList = [];

    static Run(args, message) {
        try {
            var command = this.FindCommand(args[0]);
            if (command.status > 1) message.channel.send("Команда отключена");
            else command?.callback(args, message);
        } catch (e) {
            CatchError(e, message.channel);
        }
    }
    static AddCommand(rights, status, name, title, description, callback) {
        this.commandList.push({
            name: name,
            rights: rights,
            status: status,
            title: title,
            description: description,
            callback: callback
        });
    }
    static FindCommand(commandName) {
        var foundCommands = this.commandList.filter(c => c.name === commandName);
        return foundCommands.length > 0 ? foundCommands[0] : null;
    }
    static GetStatus() {
        var embed = new MessageEmbed()
            .setAuthor("Статус")
            .setColor(0x00AE86)
            .setFooter("That was a h̶a̶n̶d̶o̶u̶t̶  hangover.")
            .setTimestamp()
        var restricted = [];
        var guildmaster = [];
        this.commandList.forEach(command => {
            var line = "";
            switch (command.status) {
                case 0:
                    line += "<:yes:769922757592612874> ";
                    break;
                case 1:
                    line += "<:reload:781107772224962561> ";
                    break;
                default:
                    line += "<:no:769922772549632031> ";
                    break;
            }
            if (command.name != "") {
                line += command.name;
                switch (command.rights) {
                    case "restricted":
                        restricted.push(line);
                        break;
                    case "guildmaster":
                        guildmaster.push(line);
                        break;
                }
            }
        });
        embed.addField("Restricted", restricted.join("\n"), true)
        embed.addField("Guildmaster", guildmaster.filter((_, i) => i < guildmaster.length / 2).join("\n"), true)
        embed.addField("Guildmaster", guildmaster.filter((_, i) => i >= guildmaster.length / 2).join("\n"), true)
        return embed;
    }
    static GetRestrictedHelp() {
        var embed = new MessageEmbed()
            .setAuthor("Horobot :: Список доступных команд:")
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
        this.AddCommand("developer", 0, "status", "!status", "статус команд;", function (args, message) {
            message.channel.send(CommandManager.GetStatus());
        });
        this.AddCommand("developer", 0, "oauth2", "!oauth2", "выслать команду авторизации;", function (args, message) {
            message.channel.send(`https://www.bungie.net/ru/OAuth/Authorize?response_type=code&client_id=${config.d2clientId}&state=12345`);
        });
        this.AddCommand("developer", 0, "code", "!code", "сохранить код авторизации;", function (args, message) {
            newAuthToken(args[1]);
        });


        this.AddCommand("common", 0, "ping", "!ping", "testing functionality", function (args, message) {
            message.channel.send('pong ' + args[0]);
        });
        this.AddCommand("common", 0, "rand", "!rand", "отправить рандомный эмоджик", function (args, message) {
            message.channel.send(emoji.random().emoji);
        });
        this.AddCommand("common", 0, "clown", "!clown", "отправить клоуна", function (args, message) {
            message.channel.send('🤡');
        });

        //case 'сбор':			raid.create_raid(message, args);							break;
        //case 'triumph':		seals.triumph(message, (args.length > 1 ? args[1] : 0));	break;
        //case 'triumphs':		triumphs.triumphs(message, (args.length > 1 ? 1 : null));	break;
        //case 'rl':			raidleader.rl(message.channel, (args.length > 1 ? args[1] : message.member.user.id), (args.length > 2 ? args[2] : 7));	break;

        this.AddCommand("restricted", 0, "cap", "!cap NUMBER", "ограничение комнаты до NUMBER мест;", function (args, message) {
            ChangeChannelCap(message, (args.length > 1 ? args[1] : 0));
        });
        this.AddCommand("restricted", 0, "help", "!help", "список доступных команд;", function (args, message) {
            message.channel.send(CommandManager.GetRestrictedHelp());
        });
        this.AddCommand("restricted", 0, "invitefriend", "!invitefriend @DiscordTag", "выдача роли 'Странник' вместо роли 'Очередь';\n_доступна опытным стражам_;", function (args, message) {
            InviteFriend(message, (args.length > 1 ? args[1] : ""));
        });
        this.AddCommand("restricted", 0, "medals", "!medals", "стражи с большим количеством медалей;", function (args, message) {
            ClanMedalsSummary(message.channel);
        });
        this.AddCommand("restricted", 0, "mymt", "!mymt", "проверка активности стража в голосовом чате (только своей);", function (args, message) {
            GetClanMemberOnlineTime(message, (args.length > 1 ? args[1] : 7));
        });
        this.AddCommand("restricted", 0, "region", "!region", "смена региона сервера;", function (args, message) {
            ChangeRegion(message);
        });
        this.AddCommand("restricted", 2, "rl", "!rl / !rl @DiscordTag", "отчет по стражу на пригодность в качестве наставника;", function (args, message) { });
        this.AddCommand("restricted", 0, "roles", "!roles / !roles @DiscordTag", "отображение и выдача стражу заслуженных медалей;", function (args, message) {
            Roles(message, args);
        });
        this.AddCommand("restricted", 0, "roles id:", "!roles id:type/id", "отображение и выдача заслуженных медалей по bungie id;", function (args, message) {
            Roles(message, args);
        });
        this.AddCommand("restricted", 2, "triumph", "!triumph TRIUMPH_HASH", "отобразить стражей клана, получивших конкретный триумф;", function (args, message) { });
        this.AddCommand("restricted", 2, "triumphs", "!triumphs", "топ 15 стражей клана по очкам триумфов текстом;", function (args, message) { });
        this.AddCommand("restricted", 2, "triumphs 1", "!triumphs gimmeimageplz", "топ 15 стражей клана по очкам триумфов графиком;", function (args, message) { });
        this.AddCommand("restricted", 0, "сбор", "!сбор ДД.ММ ЧЧ:ММ название активности, комментарии", "создание сбора на активность на 6 человек;", function (args, message) {
            CreateRaid(message, args);
        });
        this.AddCommand("restricted", 2, "", "!сбор ДД.ММ ЧЧ:ММ [N] название активности", "создание сбора на активность на N человек;", function (args, message) { });


        this.AddCommand("guildmaster", 2, "checksync", "!______________", "_______________;", function (args, message) { });
        this.AddCommand("guildmaster", 0, "ck", "", "", function (args, message) {
            ClanTime(message.channel, (args.length > 1 ? args[1] : 7), 'full');
        });
        this.AddCommand("guildmaster", 0, "clankick", "!clankick %days%", "выборка активности малоактивных стражей;\n_по умолчанию — 7 дней_;", function (args, message) {
            ClanTime(message.channel, (args.length > 1 ? args[1] : 7), 'full');
        });
        this.AddCommand("guildmaster", 0, "ckp", "", "", function (args, message) {
            ClanTime(message.channel, (args.length > 1 ? args[1] : 7));
        });
        this.AddCommand("guildmaster", 0, "clankickpub", "!clankickpub %days%", "выборка активности **самых** малоактивных стражей;\n_по умолчанию — 7 дней_;", function (args, message) {
            ClanTime(message.channel, (args.length > 1 ? args[1] : 7));
        });
        this.AddCommand("guildmaster", 1, "copy", "!copy", "ручной запуск переноса в архив старых сборов рейдов;", function (args, message) { 
            ClearRaidList();
         });
        this.AddCommand("guildmaster", 0, "csr", "!csr", "ручной запуск выдачи ролей всему клану;", function (args, message) {
            SetRoles(message.channel);
        });
        this.AddCommand("guildmaster", 2, "engreset", "!engreset", "генерация ссылок на англоязычные изображения еженедельного ресета в текущий канал;", function (args, message) { });
        this.AddCommand("guildmaster", 0, "forum", "!forum LINKTEXT", "опубликовать объявление о наборе в канал новостей;", function (args, message) { 
            GiveForumRole(message);
        });
        this.AddCommand("guildmaster", 0, "forumtime", "!forumtime", "выдать всем стражам роли перед объявлением о наборе;", function (args, message) { 
            SaveForumLinkAndPublish(message.content.slice(7));
        });
        this.AddCommand("guildmaster", 0, "gmhelp", "!gmhelp", "список доступных ГМ-ских команд;", function (args, message) {
            message.channel.send(CommandManager.GetRestrictedHelp());
        });
        this.AddCommand("guildmaster", 0, "membertime", "!membertime @DiscrordTag %days%", "выборка активности стража;\n_по умолчанию — 7 дней_;", function (args, message) {
            GetClanMemberOnlineTime(message, (args.length > 2 ? args[2] : 7), (args.length > 1 ? args[1] : message.member.id), true)
        });
        this.AddCommand("guildmaster", 0, "message", "!message channel_id текст", "отправить сообщение в канал;", function (args, message) {
            SendCustomMessage(message.client, args);
        });
        this.AddCommand("guildmaster", 0, "n", "!n", "список новичков в клане;", function (args, message) {
            ShowNewbieList(message);
        });
        this.AddCommand("guildmaster", 0, "nicknames", "!nicknames", "проверка никнеймов стражей;", function (args, message) {
            Nicknames(message.channel);
        });
        this.AddCommand("guildmaster", 0, "pmspam", "!pmspam", "спам говном в личку по роли;", function (args, message) {
            SendPrivateMessageByRole(message.guild, args);
        });
        this.AddCommand("guildmaster", 0, "pvpdrop", "!pvpdrop", "снять все пвп роли;", function (args, message) { 
            DropPvpRole(message.guild);
        });
        this.AddCommand("guildmaster", 0, "q", "!q", "список стражей в очереди;", function (args, message) {
            ShowQueueList(message);
        });
        this.AddCommand("guildmaster", 0, "qq", "!qq", "список анкет стражей в очереди;", function (args, message) {
            ShowQueueReqestsList(message);
        });
        this.AddCommand("guildmaster", 0, "raidadd", "!raidadd message_id member_id", "добавление в рейд стража;", function (args, message) { 
            ForcedAddRaidMember(message, args);
        });
        this.AddCommand("guildmaster", 0, "raidkick", "!raidkick message_id member_id", "исключение из рейда стража, пример: https://media.discordapp.net/attachments/515244455033438209/626795525710020638/unknown.png;", function (args, message) { 
            ForcedRemoveRaidMember(message, args);
        });
        this.AddCommand("guildmaster", 2, "reset", "!reset", "генерация текстового еженедельного ресета в текущий канал;", function (args, message) { });
        this.AddCommand("guildmaster", 2, "setmaxtriumphs", "!setmaxtriumphs NUMBER", "обновить значение максимального количества триумфов;", function (args, message) { });
        this.AddCommand("guildmaster", 0, "size", "!size", "количество стражей в составах;", function (args, message) {
            ClanSize().then(value => message.channel.send(value));
        });
        this.AddCommand("guildmaster", 2, "sync", "!______________", "_______________;", function (args, message) { });
        this.AddCommand("guildmaster", 2, "watermelon", "!watermelon @DiscrordTag", "проверка стража на абуз;", function (args, message) { });
        this.AddCommand("guildmaster", 2, "xur", "!xur", "геренация изображения товаров Зура в текущий канал;", function (args, message) { });
    }
}

/*
GM
    case 'checksync':	checksync.checksync(message.channel);					break;
    case 'sync':		roles.roles_bytag(message.channel, args.length > 1 ? args[1] : message.member.id, true);					break;
    case 'watermelon':		watermelon.watermelon(message.channel, args.length > 1 ? args[1] : message.member.id);
        break;
    case 'setmaxtriumphs':
        if(args.length > 1){
            fs.writeFile('maxtriumphs.txt', args[1], function(error){
                if(error) throw error; // если возникла ошибкаS
            });
        }else{
            message.channel.send("нет данных!");
        }
        break;
    case 'testreset':
        var yyyy = date.getFullYear();
        var dd = date.getDate();
        if(dd<10) { dd='0'+dd; }
        var mm = date.getMonth()+1;
        if(mm<10) { mm='0'+mm; }

        message.channel.send(
            "Reset by Kyber3000\n"+
            "https://kyberscorner.files.wordpress.com/"+yyyy+"/"+mm+"/destiny-2-weekly-reset-summary-"+mm+"-"+dd+"-"+yyyy+".png\n"+
            "https://kyberscorner.files.wordpress.com/"+yyyy+"/"+mm+"/destiny-2-weekly-raid-challenges-by-kyber3000-"+mm+"-"+dd+"-"+yyyy+".png");
        break;
    case 'xur':
        reset.auth(boss);
        setTimeout(function (){
            reset.xur(message.channel);
        }, 2000);
        break;
    case 'reset':
        reset.auth(boss);
        setTimeout(function (){
            reset.weeklyreset(message.channel);
        }, 2000);
        break;
}*/